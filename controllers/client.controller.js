import { getOrdersByClient } from "./orders.controller.js";

function getClientViewModel(req, title) {
  return {
    layout: "client-layout",
    title,
    user: req.session?.user ?? null
  };
}

export function getDashboard(req, res) {
  return res.render("client/dashboard/index", getClientViewModel(req, "Inicio"));
}

export function getProfile(req, res) {
  return res.render("client/profile", getClientViewModel(req, "Mi perfil"));
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

export function getAddresses(req, res) {
  return res.render("client/addresses", getClientViewModel(req, "Mis direcciones"));
}

export function getFavorites(req, res) {
  return res.render("client/favorites", getClientViewModel(req, "Mis favoritos"));
}
