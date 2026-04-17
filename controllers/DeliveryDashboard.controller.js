import Users from "../models/UserModel.js";
import { Roles } from "../utils/enums/roles.js";
import Orders from "../models/OrderModel.js";

export async function getDeliveryDashboard(req, res, next) {
  try {
    const result = await Users.find(
      { role: Roles.DELIVERY },
      { name: 1, lastName: 1, email: 1, phone: 1 },
    ).lean();

    for (const delivery of result) 
    {
        delivery.ordersCount = await Orders.countDocuments({ deliveryId: delivery._id });
    }

    const deliveries = result || [];

    res.render("Admin/delivery-list", {
      deliveriesList: deliveries,
      hasDeliveries: deliveries.length > 0,
      layout: "admin-layout",
      "page-title": "Delivery Dashboard",
    });
  } catch (error) {
    console.error("Error fetching delivery dashboard data:", error);
    res.flash(
      "error",
      "An error occurred while fetching delivery dashboard data.",
    );
  }
}

export async function postStatusDelivery(req, res, next) {
  const deliveryId = req.body;
  const status = req.body.status === "true";

  try {
    await Users.findByIdAndUpdate(deliveryId, { isActive: status });
    res.flash("success", "Delivery status updated successfully.");
    res.redirect("/delivery-dashboard");
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.flash("error", "An error occurred while updating delivery status.");
  }
}
