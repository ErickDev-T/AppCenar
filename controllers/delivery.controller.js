import { getOrdersByDelivery } from "./orders.controller.js";

function getDeliveryViewModel(req, title) {
  return {
    layout: "delivery-layout",
    title,
    user: req.session?.user ?? null
  };
}

function formatDOP(value) {
  return Number(value || 0).toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP"
  });
}

function formatDateTime(value) {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function resolveImageUrl(fileName, fallbackPrefix) {
  if (!fileName || typeof fileName !== "string") return null;
  if (fileName.startsWith("http://") || fileName.startsWith("https://") || fileName.startsWith("/")) {
    return fileName;
  }

  return `${fallbackPrefix}/${fileName}`;
}

export async function getDashboard(req, res) {
  const sessionDeliveryId = req.session?.user?._id || req.session?.user?.id;

  if (!sessionDeliveryId) {
    return res.redirect("/user/login");
  }

  try {
    const orders = await getOrdersByDelivery(sessionDeliveryId);
    const mappedOrders = orders.map((order) => {
      const commerceData = order?.commerceId;
      const commerceName =
        commerceData && typeof commerceData === "object"
          ? commerceData.name || commerceData.email || "Comercio"
          : "Comercio";

      return {
        id: String(order?._id || ""),
        status: order?.status || "pendiente",
        commerceName,
        commerceLogoUrl: resolveImageUrl(commerceData?.profileImage, "/Images/profileImages"),
        totalLabel: formatDOP(order?.total),
        productsCount: Array.isArray(order?.products) ? order.products.length : 0,
        createdAtLabel: formatDateTime(order?.createdAt)
      };
    });

    return res.render("delivery/dashboard/index", {
      ...getDeliveryViewModel(req, "Home del delivery"),
      ordersList: mappedOrders,
      hasOrders: mappedOrders.length > 0
    });
  } catch (err) {
    console.error("Error fetching delivery orders:", err);
    return res.status(500).render("delivery/dashboard/index", {
      ...getDeliveryViewModel(req, "Home del delivery"),
      ordersList: [],
      hasOrders: false,
      loadError: true
    });
  }
}

export function getProfile(req, res) {
  return res.render("delivery/profile", getDeliveryViewModel(req, "Perfil del delivery"));
}
