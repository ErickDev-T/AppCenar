function getDeliveryViewModel(req, title) {
  return {
    layout: "delivery-layout",
    title,
    user: req.session?.user ?? null
  };
}

export function getDashboard(req, res) {
  return res.render("delivery/dashboard/index", getDeliveryViewModel(req, "Home del delivery"));
}

export function getProfile(req, res) {
  return res.render("delivery/profile", getDeliveryViewModel(req, "Perfil del delivery"));
}
