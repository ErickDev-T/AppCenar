import Users from "../models/UserModel.js";
import Order from "../models/OrderModel.js";
import { Roles } from "../utils/enums/roles.js";

export async function getClientsDashboard(req, res, next) {
  try {
    const result = await Users.find(
      { role: Roles.CLIENT },
      { name: 1, lastName: 1, email: 1, isActive: 1 },
    ).lean();
    for (client of result) 
    {
        client.ordersCount = await Order.countDocuments({ clientId: client._id });
    }

    const clients = result || [];

    res.render("client/client-dashboard", {
      clientsList: clients,
      hasClients: clients.length > 0,
      "page-title": "Client Dashboard",
    });

  } catch (err) {
    console.error("Error loading client dashboard:", err);
    req.flash("error", "Error al cargar el dashboard del cliente.");
    return res.redirect("/client");
  }
}

export async function postStatusClient(req, res, next) 
{
    const clientId = req.body;
    const status = req.body.status === "true";

    try {
        await Users.findByIdAndUpdate(clientId, { isActive: status });
        res.flash("success", "Client status updated successfully.");
        res.redirect("/client-dashboard");
    } catch (error) {
        console.error("Error updating client status:", error);
        res.flash("error", "An error occurred while updating client status.");
    }
}
