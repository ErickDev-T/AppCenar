export function getDashboard(req, res) {
  const user = req.user;
  res.render("dashboard", { "title": "Dashboard"});
}