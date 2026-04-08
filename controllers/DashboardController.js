export function getDashboard(req, res) {
  const user = req.user;
  res.render("Auth/Login", { "title": "Login"});
}