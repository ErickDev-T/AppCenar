import {
  assignDeliveryToCommerceOrder,
  getCommerceOrderById,
  getOrdersByCommerce
} from "./orders.controller.js";

function getCommerceViewModel(req, title) {
  return {
    layout: "commerce-layout",
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
  const sessionCommerceId = req.session?.user?._id || req.session?.user?.id;

  if (!sessionCommerceId) {
    return res.redirect("/user/login");
  }

  try {
    const orders = await getOrdersByCommerce(sessionCommerceId);
    const mappedOrders = orders.map((order) => {
      const commerceData = order?.commerceId;
      const commerceName =
        commerceData && typeof commerceData === "object"
          ? commerceData.name || commerceData.email || "Comercio"
          : "Comercio";

      const logoFileName =
        commerceData && typeof commerceData === "object" ? commerceData.profileImage : null;
      const commerceLogoUrl = resolveImageUrl(logoFileName, "/Images/profileImages");

      const productsCount = Array.isArray(order?.products) ? order.products.length : 0;

      return {
        id: String(order?._id || ""),
        status: order?.status || "pendiente",
        commerceName,
        commerceLogoUrl,
        totalLabel: formatDOP(order?.total),
        productsCount,
        createdAtLabel: formatDateTime(order?.createdAt)
      };
    });

    return res.render("commerce/dashboard/index", {
      ...getCommerceViewModel(req, "Home del comercio"),
      ordersList: mappedOrders,
      hasOrders: mappedOrders.length > 0
    });
  } catch (err) {
    console.error("Error fetching commerce orders:", err);
    return res.status(500).render("commerce/dashboard/index", {
      ...getCommerceViewModel(req, "Home del comercio"),
      ordersList: [],
      hasOrders: false,
      loadError: true
    });
  }
}

export function getProfile(req, res) {
  return res.render("commerce/profile", getCommerceViewModel(req, "Perfil del comercio"));
}

export function getCategories(req, res) {
  return res.render("commerce/categories", getCommerceViewModel(req, "Mantenimiento de categorias"));
}

export function getProducts(req, res) {
  return res.render("commerce/products", getCommerceViewModel(req, "Mantenimiento de productos"));
}

export async function getOrderDetail(req, res) {
  const sessionCommerceId = req.session?.user?._id || req.session?.user?.id;
  const orderId = req.params?.orderId;

  if (!sessionCommerceId) {
    return res.redirect("/user/login");
  }

  try {
    const order = await getCommerceOrderById(orderId, sessionCommerceId);

    const successMessages = req.flash("success");
    const errorMessages = req.flash("errors");

    if (!order) {
      return res.status(404).render("commerce/order-detail", {
        ...getCommerceViewModel(req, "Detalle del pedido"),
        notFound: true,
        successMessages,
        errorMessages
      });
    }

    const commerceData = order?.commerceId && typeof order.commerceId === "object" ? order.commerceId : null;
    const deliveryData = order?.deliveryId && typeof order.deliveryId === "object" ? order.deliveryId : null;

    const mappedOrder = {
      id: String(order._id),
      status: order.status || "pendiente",
      commerceName: commerceData?.name || commerceData?.email || "Comercio",
      commerceLogoUrl: resolveImageUrl(commerceData?.profileImage, "/Images/profileImages"),
      createdAtLabel: formatDateTime(order.createdAt),
      totalLabel: formatDOP(order.total),
      productsList: Array.isArray(order.products)
        ? order.products.map((product) => ({
            imageUrl: resolveImageUrl(product?.image, "/Images/products"),
            name: product?.name || "Producto",
            priceLabel: formatDOP(product?.price)
          }))
        : [],
      assignedDeliveryName: deliveryData
        ? `${deliveryData.name || ""} ${deliveryData.lastName || ""}`.trim() ||
          deliveryData.username ||
          deliveryData.email ||
          "Delivery"
        : null,
      hasAssignedDelivery: Boolean(deliveryData)
    };

    return res.render("commerce/order-detail", {
      ...getCommerceViewModel(req, "Detalle del pedido"),
      order: mappedOrder,
      productsList: mappedOrder.productsList,
      hasProducts: mappedOrder.productsList.length > 0,
      canAssignDelivery: mappedOrder.status === "pendiente" && !mappedOrder.hasAssignedDelivery,
      successMessages,
      errorMessages
    });
  } catch (err) {
    console.error("Error fetching commerce order detail:", err);
    return res.status(500).render("commerce/order-detail", {
      ...getCommerceViewModel(req, "Detalle del pedido"),
      loadError: true,
      successMessages: [],
      errorMessages: ["No se pudo cargar el detalle del pedido."]
    });
  }
}

export async function postAssignDelivery(req, res) {
  const sessionCommerceId = req.session?.user?._id || req.session?.user?.id;
  const orderId = req.params?.orderId;

  if (!sessionCommerceId) {
    return res.redirect("/user/login");
  }

  const redirectPath = `/commerce/orders/${orderId}`;

  try {
    const result = await assignDeliveryToCommerceOrder({
      orderId,
      commerceId: sessionCommerceId
    });

    if (!result.ok) {
      switch (result.code) {
        case "invalid_ids":
          req.flash("errors", "Datos invalidos para asignar delivery.");
          break;
        case "order_not_found":
          req.flash("errors", "Pedido no encontrado para este comercio.");
          break;
        case "invalid_status":
          req.flash("errors", "Solo puedes asignar delivery a pedidos pendientes.");
          break;
        case "delivery_not_available":
          req.flash("errors", "No hay delivery disponible en este momento. Intenta mas tarde.");
          break;
        case "delivery_already_assigned":
          req.flash("errors", "Este pedido ya tiene un delivery asignado.");
          break;
        default:
          req.flash("errors", "No se pudo asignar el delivery.");
      }

      return res.redirect(redirectPath);
    }

    req.flash("success", "Delivery asignado correctamente. El pedido ahora esta en proceso.");
    return res.redirect(redirectPath);
  } catch (err) {
    console.error("Error assigning delivery to commerce order:", err);
    req.flash("errors", "Error interno al asignar el delivery.");
    return res.redirect(redirectPath);
  }
}
