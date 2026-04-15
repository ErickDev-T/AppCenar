import Commerce from "../models/CommerceModel.js";
import Order from "../models/OrderModel.js";

export async function getCommerceDashboard(req, res, next) {
  try {
    const result = await Commerce.find(
      {},
      { name: 1, profileImage: 1, isActive: 1 },
    ).lean();

    for (const commerce of result) {
      commerce.ordersCount = await Order.countDocuments({
        commerceId: commerce._id,
      });
    }

    const commerces = result || [];

    res.render("/commerce-dashboard", {
        commercesList: commerces,
        hasCommerces: commerces.length > 0,
        "page-title": "Commerce Dashboard"
    });

  } catch (err) {
    console.error("Error loading commerce dashboard:", err);
    req.flash("error", "Error al cargar el dashboard del comercio.");
  }
}

export async function postStatus(req, res, next)
{
    try
    {
        const commerceId = req.body;
        const status = req.body.status === "true";

        await Commerce.findByIdAndUpdate(commerceId, { isActive: status });
        res.flash("success", "Commerce status updated successfully.");
        res.redirect("/commerce-dashboard");
        
    }catch (err)
    {
        console.error("Error updating commerce status:", err);
        req.flash("error", "An error occurred while updating commerce status.");
    }
}
