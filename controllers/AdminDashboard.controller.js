import Order from "../models/Order.js";
import Commerce from "../models/Commerce.js";
import Users from "../models/UserModel.js";
import { Roles } from "../utils/enums/roles.js";

export async function getHomeDashboard(req, res, next)
{
    try
    {
        const Orders = await Order.countDocuments();
        const Commerces = await Commerce.countDocuments();
        const Clients = await Users.countDocuments({ role: Roles.CLIENT });
        const Deliverys = await Users.countDocuments({ role: Roles.DELIVERY });

        res.render("Admin/Dashboard", {
            totalOrders : Orders,
            totalCommerce : Commerces,
            totalClients : Clients,
            totalDelivery : Deliverys,
            "page-title": "Admin Dashboard"
        });

    }catch (err)
    {
        console.error("Error loading dashboard:", err);
        req.flash("error", "Error al cargar el dashboard.");
        return res.redirect("/Admin");
    }
}