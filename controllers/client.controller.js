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

export function getOrders(req, res) {
  return res.render("client/orders", getClientViewModel(req, "Mis pedidos"));
}

export function getAddresses(req, res) {
  return res.render("client/addresses", getClientViewModel(req, "Mis direcciones"));
}

export function getFavorites(req, res) {
  return res.render("client/favorites", getClientViewModel(req, "Mis favoritos"));
}
