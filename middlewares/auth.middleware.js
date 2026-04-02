// Pasa el usuario de la sesión a las vistas
// y marca si el usuario esta autenticado o no
export function attachAuthState(req, res, next) {
  const user = req.session?.user ?? null;
  res.locals.currentUser = user;
  res.locals.isAuthenticated = Boolean(user);
  next();
}

// Verifica que el usuario haya iniciado sesion
// antes de entrar a una ruta
export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.redirect("/user/login");
  }

  next();
}

// si ya inició sesión lo manda al inicio
// si no ha iniciado sesión continua
export function requireGuest(req, res, next) {
  if (req.session?.user) {
    return res.redirect("/");
  }

  next();
}