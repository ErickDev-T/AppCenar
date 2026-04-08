import {roles} from "../config/roles.js";

export function getDashboard(req, res) {
    const user = req.user;
    if (user.role === roles.client) {
        res.render("client/dashboard", { "title": "Dashboard"});
    } else {
        res.render("auth/login", { "title": "Login"});
    }
};