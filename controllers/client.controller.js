import CommerceType from "../models/CommerceTypeModel.js";
import { getOrdersByClient } from "./orders.controller.js";
import { getCommercesByType } from "./commerce.controller.js";
import { getAddressesByUser } from "./address.controller.js";
import { getFavoritesByClient } from "./favorite.controller.js";
import { unlink } from "node:fs/promises";
import Users from "../models/UserModel.js";

// helper para eliminar archivos
async function removeUploadedFile(filePath) {
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (ex) {
    if (ex?.code !== "ENOENT") {
      console.error("Error deleting uploaded file", ex);
    }
  }
}

function getClientViewModel(req, title) {
  return {
    layout: "client-layout",
    title,
    user: req.session?.user ?? null
  };
}

export async function getDashboard(req, res) {
  try {
    const commerceTypes = await CommerceType.find().lean();
    return res.render("client/dashboard/index", {
      ...getClientViewModel(req, "Inicio"),
      commerceTypes,
      hasCommerceTypes: commerceTypes.length > 0
    });
  } catch (ex) {
    console.error("Error loading dashboard:", ex);
    return res.render("client/dashboard/index", {
      ...getClientViewModel(req, "Inicio"),
      commerceTypes: [],
      hasCommerceTypes: false
    });
  }
}

export async function getCommercesByTypeView(req, res) {
  try {
    const { commerceTypeId } = req.params;
    const { search } = req.query;

    const { commerces, commerceType, total } = await getCommercesByType(commerceTypeId, search);

    return res.render("client/commerces", {
      ...getClientViewModel(req, commerceType?.name ?? "Comercios"),
      commerces,
      commerceType,
      total,
      search: search ?? "",
      hasCommerces: commerces.length > 0
    });
  } catch (ex) {
    console.error("Error loading commerces:", ex);
    return res.redirect("/client/dashboard");
  }
}

// render perfil con formData
export function getProfile(req, res) {
  const user = req.session.user;

  return res.render("client/profile", {
    ...getClientViewModel(req, "Mi perfil"),
    formData: {
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      profileImage: user.profileImage
    },
    errors: [],
    success: false
  });
}

// actualizar perfil
export async function updateProfile(req, res) {
  const user = req.session.user;

  const formData = {
    name: req.body.name?.trim() ?? "",
    lastName: req.body.lastName?.trim() ?? "",
    phone: req.body.phone?.trim() ?? "",
    profileImage: user.profileImage
  };

  const errors = [];
  if (!formData.name) errors.push("El nombre es obligatorio.");
  if (!formData.lastName) errors.push("El apellido es obligatorio.");
  if (!formData.phone) errors.push("El telefono es obligatorio.");

  if (errors.length > 0) {
    await removeUploadedFile(req.file?.path);

    return res.render("client/profile", {
      ...getClientViewModel(req, "Mi perfil"),
      formData,
      errors,
      success: false
    });
  }

  try {
    const updateData = {
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone
    };

    // reemplazo de imagen
    if (req.file?.filename) {
      await removeUploadedFile(`uploads/${user.profileImage}`);
      updateData.profileImage = req.file.filename;
    }

    const updatedUser = await Users.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    );

    req.session.user = updatedUser;

    return res.render("client/profile", {
      ...getClientViewModel(req, "Mi perfil"),
      formData: {
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage
      },
      errors: [],
      success: true
    });

  } catch (ex) {
    await removeUploadedFile(req.file?.path);

    console.error("Error updating profile:", ex);

    return res.render("client/profile", {
      ...getClientViewModel(req, "Mi perfil"),
      formData,
      errors: ["No se pudo actualizar el perfil."],
      success: false
    });
  }
}

export async function getOrders(req, res) {
  const sessionUserId = req.session?.user?._id || req.session?.user?.id;

  if (!sessionUserId) {
    return res.redirect("/user/login");
  }

  try {

    const orders = await getOrdersByClient(sessionUserId);
    const mappedOrders = orders.map((order) => {
      const commerceData = order?.commerceId;
      const commerceName =
        commerceData && typeof commerceData === "object"
          ? commerceData.name || commerceData.email || "Comercio"
          : "Comercio";

      const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
      const createdAtLabel =
        createdAt && !Number.isNaN(createdAt.getTime())
          ? createdAt.toLocaleString("es-DO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "-";

      const totalValue = Number(order?.total || 0);
      const totalLabel = totalValue.toLocaleString("es-DO", {
        style: "currency",
        currency: "DOP"
      });

      const productsCount = Array.isArray(order?.products) ? order.products.length : 0;
      const shortId = String(order?._id || "").slice(-6).toUpperCase();

      return {
        id: order?._id,
        shortId,
        commerceName,
        productsCount,
        status: order?.status || "pendiente",
        totalLabel,
        createdAtLabel
      };
    });


    return res.render("client/orders", {
      ...getClientViewModel(req, "Mis pedidos"),
      ordersList: mappedOrders,
      hasOrders: mappedOrders.length > 0
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).render("client/orders", {
      ...getClientViewModel(req, "Mis pedidos"),
      ordersList: [],
      hasOrders: false,
      loadError: true
    });
  }
}

export async function getAddresses(req, res) {
  try {
    const addresses = await getAddressesByUser(req.session.user._id);

    return res.render("client/addresses", {
      ...getClientViewModel(req, "Mis direcciones"),
      addressesList: addresses,
      hasAddresses: addresses.length > 0,
    });
  } catch (err) {
    console.error("Error fetching addresses:", err);
    req.flash("errors", "Error al obtener las direcciones");
  }
}

export async function getFavorites(req, res) {
  try {
    const favorites = await getFavoritesByClient(req.session.user._id);

    return res.render("client/favorites", {
      ...getClientViewModel(req, "Mis favoritos"),
      favoritesList: favorites,
      hasFavorites: favorites.length > 0,
    });
  }
  catch (err) {
    console.error("Error fetching favorites:", err);
    req.flash("errors", "Error al obtener los favoritos");
  }
}