import CommerceType from "../models/CommerceTypeModel.js";

//#region GET

export async function getCommerceType(req, res, next) 
{
    try
    {
        const result = await CommerceType.find({});
        const comerceTypes = result || [];
        
        res.render("commerce-types/home", {
            commerceTypesList: comerceTypes,
            hasCommerceTypes: comerceTypes.length > 0,
            "page-title": "Commerce Types Home"
        })
    }
    catch (err)
    {
        console.error("Error fetching commerce types:", err);
        res.flash("error", "An error occurred while fetching commerce types.");
    }
}
//#endregion


//#region SAVE

export async function getCommerceTypeSave(req, res, next)
{
    res.render("commerce-types/save", {
        editMode: false, 
        "page-title": "Add Commerce Type"
    });
}

export async function postCommerceTypeSave(req, res, next)
{
    const { name, description, icon } = req.body;
    
    try
    {
        await CommerceType.create({ name, description, icon });
        res.flash("success", "Commerce type saved successfully.");
        res.redirect("/commerce-types");
    }
    catch (err)
    {
        console.error("Error saving commerce type:", err);
        res.flash("error", "An error occurred while saving the commerce type.");
    }
}

//#endregion


//#region UPDATE

export async function getCommerceTypeEdit(req, res, next)
{
    const id = req.params.id;
    try
    {
        const commerceType = await CommerceType.findOne({ _id: id }).lean();

        if(!commerceType) 
        {
            res.flash("error", "Commerce type not found.");
            return res.redirect("/commerce-types");
        }

        res.render("commerce-types/save", {
        editMode: true,
        commerceType: commerceType, 
        "page-title": `Edit Commerce Type ${commerceType.name}`
    });
    }catch(err)
    {
        console.error("Error fetching commerce type for edit:", err);
        res.flash("error", "An error occurred while fetching the commerce type for edit.");
    }
    
}


export async function postCommerceTypeEdit(req, res, next)
{
    const { name, description, icon, id } = req.body;
    
    try
    {
        const commerceType = await CommerceType.findOne({ _id: id }).lean();

        if(!commerceType) 
        {
            res.flash("error", "Commerce type not found.");
            return res.redirect("/commerce-types");
        }

        await CommerceType.findByIdAndUpdate(id, { name, description, icon });
        res.flash("success", "Commerce type updated successfully.");
        res.redirect("/commerce-types");

    }
    catch (err)
    {
        console.error("Error saving commerce type:", err);
        res.flash("error", "An error occurred while saving the commerce type.");
    }
}

//#endregion


//#region DELETE

export async function postCommerceTypeDelete(req, res, next)
{
    const id = req.params.id;
    try
    {
        const commerceType = await CommerceType.findOne({ _id: id }).lean();

        if(!commerceType) 
        {
            res.flash("error", "Commerce type not found.");
            return res.redirect("/commerce-types");
        }

        await CommerceType.deleteOne({ _id: id });
    }
    catch(err)
    {
        console.error("Error deleting commerce type:", err);
        res.flash("error", "An error occurred while deleting the commerce type.");
    }
}

//#endregion