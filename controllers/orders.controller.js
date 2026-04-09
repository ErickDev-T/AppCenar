import Orders from "../models/OrderModel.js";
import Config from "../models/ConfigModel.js";
import Users from "../models/UserModel.js";
import Delivery from "../models/DeliveryModel.js";
import { Roles } from "../utils/enums/roles.js";
import mongoose from "mongoose";

// Logica para exportar las ordenes de un cliente y utilizarla en el controlador de cliente
export async function getOrdersByClient(clientId) {
  return await Orders.find({ clientId })
    .sort({ createdAt: -1 })
    .populate({ path: "commerceId", model: "Commerce", select: "name email" })
    .lean();
}

// Logica para exportar las ordenes de un comercio y utilizarla en el dashboard de comercio
export async function getOrdersByCommerce(commerceId) {
  return await Orders.find({ commerceId })
    .sort({ createdAt: -1 })
    .populate({ path: "commerceId", model: "Commerce", select: "name profileImage email" })
    .lean();
}

// Logica para exportar las ordenes asignadas a un delivery logueado
export async function getOrdersByDelivery(deliveryId) {
  return await Orders.find({ deliveryId })
    .sort({ createdAt: -1 })
    .populate({ path: "commerceId", model: "Commerce", select: "name profileImage email" })
    .lean();
}

export async function getCommerceOrderById(orderId, commerceId) {
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(commerceId)) {
    return null;
  }

  return await Orders.findOne({ _id: orderId, commerceId })
    .populate({ path: "commerceId", model: "Commerce", select: "name profileImage email" })
    .populate({
      path: "deliveryId",
      model: "Delivery",
      select: "name lastName username email profileImage deliveryStatus"
    })
    .lean();
}

export async function getAvailableDeliveries() {
  return await Delivery.find({
    role: Roles.DELIVERY,
    isActive: true,
    deliveryStatus: "disponible"
  })
    .sort({ createdAt: -1 })
    .select("name lastName username email")
    .lean();
}

export async function assignDeliveryToCommerceOrder({ orderId, commerceId, deliveryId }) {
  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(commerceId) ||
    !mongoose.Types.ObjectId.isValid(deliveryId)
  ) {
    return { ok: false, code: "invalid_ids" };
  }

  const order = await Orders.findOne({ _id: orderId, commerceId });
  if (!order) {
    return { ok: false, code: "order_not_found" };
  }

  if (order.status !== "pendiente") {
    return { ok: false, code: "invalid_status" };
  }

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    role: Roles.DELIVERY,
    isActive: true,
    deliveryStatus: "disponible"
  });

  if (!delivery) {
    return { ok: false, code: "delivery_not_available" };
  }

  order.deliveryId = delivery._id;
  order.status = "en proceso";
  await order.save();

  delivery.deliveryStatus = "ocupado";
  await delivery.save();

  return { ok: true };
}

// Crear ordenes por comercio y asignar delivery
export async function PostCreate(req, res, next) {
  const { ClientId, DeliveryId, AddressId, Products: OrderProducts } = req.body;
  const sessionCommerceId = req.user?.id;

  try {
    if (!sessionCommerceId) {
      req.flash("errors", "Commerce session not found");
      return res.redirect("/user/login");
    }

    const parsedProducts = JSON.parse(OrderProducts);
    const clientObjectId = new mongoose.Types.ObjectId(ClientId);
    const deliveryObjectId = new mongoose.Types.ObjectId(DeliveryId);
    const addressObjectId = new mongoose.Types.ObjectId(AddressId);

    const [clientExists, deliveryExists] = await Promise.all([
      Users.exists({ _id: clientObjectId, role: Roles.CLIENT }),
      Delivery.exists({ _id: deliveryObjectId, role: Roles.DELIVERY })
    ]);

    const addressesCollection = mongoose.connection.db.collection("Addresses");
    const ownershipCandidates = [clientObjectId, ClientId];

    const addressBelongsToClient = await addressesCollection.findOne({
      _id: addressObjectId,
      $or: [
        { clientId: { $in: ownershipCandidates } },
        { userId: { $in: ownershipCandidates } },
        { ownerId: { $in: ownershipCandidates } },
        { client: { $in: ownershipCandidates } },
        { user: { $in: ownershipCandidates } },
        { owner: { $in: ownershipCandidates } }
      ]
    });

    const businessErrors = [];
    if (!clientExists) businessErrors.push("El cliente seleccionado no existe.");
    if (!deliveryExists) businessErrors.push("El delivery seleccionado no existe.");
    if (!addressBelongsToClient) {
      businessErrors.push("La direccion no existe o no pertenece al cliente seleccionado.");
    }

    if (businessErrors.length > 0) {
      req.flash("errors", businessErrors);
      return res.redirect("/commerce/dashboard");
    }

    const config = await Config.findOne().lean();
    const itbisRate = config ? config.itbis : 18;

    const subtotal = parsedProducts.reduce((sum, p) => sum + p.price, 0);
    const itbisAmount = subtotal * (itbisRate / 100);
    const total = subtotal + itbisAmount;

    await Orders.create({
      clientId: ClientId,
      commerceId: sessionCommerceId,
      deliveryId: DeliveryId,
      addressId: AddressId,
      products: parsedProducts,
      subtotal,
      itbis: itbisAmount,
      total,
      status: "pendiente",
    });

    req.flash("success", "Orden creada y asignada correctamente");
    return res.redirect("/commerce/dashboard");
  } catch (err) {
    console.error("Error creating order:", err);
    req.flash("errors", "Error creating order");
    return res.redirect("/commerce/dashboard");
  }
}
