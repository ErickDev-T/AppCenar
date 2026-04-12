import Orders from "../models/OrderModel.js";
import Config from "../models/ConfigModel.js";

// Logica para exportar las ordenes de un cliente y utilizarla en el controlador de cliente
export async function getOrdersByClient(clientId) {
  return await Orders.find({ clientId })
    .sort({ createdAt: -1 })
    .populate("commerceId")
    .lean();
}

// Crear ordenes de cliente
export async function PostCreate(req, res, next) {
  const { CommerceId, AddressId, Products: OrderProducts } = req.body;

  try {
    const parsedProducts = JSON.parse(OrderProducts);

    const config = await Config.findOne().lean();
    const itbisRate = config ? config.itbis : 18;

    const subtotal = parsedProducts.reduce((sum, p) => sum + p.price, 0);
    const itbisAmount = subtotal * (itbisRate / 100);
    const total = subtotal + itbisAmount;

    await Orders.create({
      clientId: req.user.id,
      commerceId: CommerceId,
      addressId: AddressId,
      products: parsedProducts,
      subtotal,
      itbis: itbisAmount,
      total,
      status: "pendiente",
    });

    req.flash("success", "Order placed successfully");
    return res.redirect("/client/home");
  } catch (err) {
    console.error("Error creating order:", err);
    req.flash("errors", "Error creating order");
  }

}

// Obtener detalle de orden
export async function GetDetail(req, res, next) {
  const { orderId } = req.params;

  try {
    const order = await Orders.findById(orderId)
      .populate("commerceId")
      .populate("addressId")
      .lean();

    if (!order) {
      req.flash("errors", "Order not found");
      return res.redirect("/client/orders");
    }

    return res.render("orders/detail", {
      order,
      "page-title": "Detalle del pedido",
    });
  } catch (err) {
    console.error("Error fetching order detail:", err);
    req.flash("errors", "Error fetching order detail");
  }
}