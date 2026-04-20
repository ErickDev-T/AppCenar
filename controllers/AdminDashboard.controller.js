import Order from "../models/OrderModel.js";
import Commerce from "../models/CommerceModel.js";
import Users from "../models/DeliveryModel.js";
import { Roles } from "../utils/enums/roles.js";

export async function getHomeDashboard(req, res, next)
{
    try
    {
        const Orders = await Order.countDocuments();
        const Commerces = await Commerce.countDocuments();
        const Clients = await Users.countDocuments({ role: Roles.CLIENT });
        const Deliverys = await Users.countDocuments({ role: Roles.DELIVERY });

        res.render("AdminDashboard/Index", {
            totalOrders : Orders,
            totalCommerce : Commerces,
            totalClients : Clients,
            totalDelivery : Deliverys,
            layout: "admin-layout",
            "page-title": "Admin Dashboard"
        });

    }catch (err)
    {
        console.error("Error loading dashboard:", err);
        req.flash("error", "Error al cargar el dashboard.");
        return res.redirect("/AdminDashboard");
    }
}
