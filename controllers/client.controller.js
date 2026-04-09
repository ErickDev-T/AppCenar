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
  try {
    const orders = await getOrdersByClient(req.session.user.id);

    return res.render("client/orders", {
      ...getClientViewModel(req, "Mis pedidos"),
      ordersList: orders,
      hasOrders: orders.length > 0,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    req.flash("errors", "Error fetching orders");
  }
}

export function getAddresses(req, res) {
  return res.render("client/addresses", getClientViewModel(req, "Mis direcciones"));
}

export function getFavorites(req, res) {
  return res.render("client/favorites", getClientViewModel(req, "Mis favoritos"));
}
