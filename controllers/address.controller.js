import Addresses from "../models/AddressModel.js";

export async function getAddressesByUser(userId) {
  return await Addresses.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function GetCreate(req, res, next) {
  return res.render("client/addresses/save", {
    editMode: false,
    "page-title": "Nueva dirección",
  });
}

export async function PostCreate(req, res, next) {
  const { Name, Description } = req.body;

  try {
    await Addresses.create({
      name: Name,
      description: Description,
      userId: req.session.user._id,
    });

    req.flash("success", "Dirección creada exitosamente");
    return res.redirect("/client/addresses");
  } catch (err) {
    console.error("Error creating address:", err);
    req.flash("errors", "Error al crear la dirección");
  }
}

export async function GetEdit(req, res, next) {
  const { addressId } = req.params;

  try {
    const address = await Addresses.findOne({
      _id: addressId,
      userId: req.session.user._id,
    }).lean();

    if (!address) {
      req.flash("errors", "Dirección no encontrada");
      return res.redirect("/client/addresses");
    }

    return res.render("client/addresses/save", {
      editMode: true,
      address,
      "page-title": `Editar dirección ${address.name}`,
    });
  } catch (err) {
    console.error("Error fetching address:", err);
    req.flash("errors", "Error al obtener la dirección");
  }
}

export async function PostEdit(req, res, next) {
  const { Name, Description, AddressId } = req.body;

  try {
    const address = await Addresses.findOne({
      _id: AddressId,
      userId: req.session.user._id,
    }).lean();

    if (!address) {
      req.flash("errors", "Dirección no encontrada");
      return res.redirect("/client/addresses");
    }

    await Addresses.findByIdAndUpdate(AddressId, {
      name: Name,
      description: Description,
    });

    req.flash("success", "Dirección actualizada exitosamente");
    return res.redirect("/client/addresses");
  } catch (err) {
    console.error("Error updating address:", err);
    req.flash("errors", "Error al actualizar la dirección");
  }
}

export async function Delete(req, res, next) {
  const { AddressId } = req.body;

  try {
    const address = await Addresses.findOne({
      _id: AddressId,
      userId: req.session.user._id,
    }).lean();

    if (!address) {
      req.flash("errors", "Dirección no encontrada");
      return res.redirect("/client/addresses");
    }

    await Addresses.deleteOne({ _id: AddressId, userId: req.session.user._id });

    req.flash("success", "Dirección eliminada exitosamente");
    return res.redirect("/client/addresses");
  } catch (err) {
    console.error("Error deleting address:", err);
    req.flash("errors", "Error al eliminar la dirección");
  }
}