export function getDashboard(req, res) {

  const user = req.session?.user ?? null;

  return res.render("dashboard", {
    title: "Dashboard",
    user
  });
}
