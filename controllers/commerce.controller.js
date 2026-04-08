function getCommerceViewModel(req, title) {
  return {
    layout: "commerce-layout",
    title,
    user: req.session?.user ?? null
  };
}

export function getDashboard(req, res) {
  return res.render("commerce/dashboard/index", getCommerceViewModel(req, "Home del comercio"));
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
