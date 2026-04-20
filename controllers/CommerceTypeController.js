import CommerceType from "../models/CommerceTypeModel.js";

//#region GET

export async function getCommerceType(req, res, next) {
    try {
        const result = await CommerceType.find({}).lean();
        const commerceTypes = result || [];

        return res.render("commerceType/index", {
            commerceTypesList: commerceTypes,
            hasCommerceTypes: commerceTypes.length > 0,
            layout: "admin-layout",
            "page-title": "Commerce Types Home"
        });
    } catch (err) {
        console.error("Error fetching commerce types:", err);

        req.flash("error", "An error occurred while fetching commerce types.");
        return res.redirect("/");
    }
}

//#endregion

//#region SAVE

export async function getCommerceTypeSave(req, res, next) {
    return res.render("commerceType/save", {
        editMode: false,
        layout: "admin-layout",
        "page-title": "Add Commerce Type"
    });
}

export async function postCommerceTypeSave(req, res, next) {
    const { name, description, icon } = req.body;

    try {
        await CommerceType.create({
            name,
            description,
            icon
        });

        req.flash("success", "Commerce type saved successfully.");
        return res.redirect("/commerceType");
    } catch (err) {
        console.error("Error saving commerce type:", err);

        req.flash("error", "An error occurred while saving the commerce type.");
        return res.redirect("/commerceType/save");
    }
}

//#endregion

//#region UPDATE

export async function getCommerceTypeEdit(req, res, next) {
    const id = req.params.id;

    try {
        const commerceType = await CommerceType.findById(id).lean();

        if (!commerceType) {
            req.flash("error", "Commerce type not found.");
            return res.redirect("/commerceType");
        }

        return res.render("commerceType/save", {
            editMode: true,
            commerceType: commerceType,
            layout: "admin-layout",
            "page-title": `Edit Commerce Type ${commerceType.name}`
        });
    } catch (err) {
        console.error("Error fetching commerce type for edit:", err);

        req.flash("error", "An error occurred while fetching the commerce type for edit.");
        return res.redirect("/commerceType");
    }
}

export async function postCommerceTypeEdit(req, res, next) {
    const { id, name, description, icon } = req.body;

    try {
        const commerceType = await CommerceType.findById(id).lean();

        if (!commerceType) {
            req.flash("error", "Commerce type not found.");
            return res.redirect("/commerceType");
        }

        await CommerceType.findByIdAndUpdate(id, {
            name,
            description,
            icon
        });

        req.flash("success", "Commerce type updated successfully.");
        return res.redirect("/commerceType");
    } catch (err) {
        console.error("Error updating commerce type:", err);

        req.flash("error", "An error occurred while updating the commerce type.");
        return res.redirect(`/commerceType/edit/${req.body.id}`);
    }
}

//#endregion

//#region DELETE

export async function postCommerceTypeDelete(req, res, next) {
    const id = req.params.id;

    try {
        const commerceType = await CommerceType.findById(id).lean();

        if (!commerceType) {
            req.flash("error", "Commerce type not found.");
            return res.redirect("/commerceType");
        }

        await CommerceType.findByIdAndDelete(id);

        req.flash("success", "Commerce type deleted successfully.");
        return res.redirect("/commerceType");
    } catch (err) {
        console.error("Error deleting commerce type:", err);

        req.flash("error", "An error occurred while deleting the commerce type.");
        return res.redirect("/commerceType");
    }
}

//#endregion