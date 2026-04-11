import Configuration from "../models/ConfigurationModel.js";

//#region GET

export async function getConfigurations(req, res, next) {
  try {
    const result = await Configuration.find({});
    const configurations = result || [];

    res.render("/configurations", {
      configurationList: configurations,
      hasconfiguration: configurations.length > 0,
      "page-title": "Configuration Home",
    });
  } catch (err) {
    console.error("Error fetching configuration:", err);
    res.flash("error", "An error occurred while fetching the configuration.");
  }
}

//#endregion

//#region SAVE

export async function getConfigurationSave(req, res, next) {
  try {
    res.render("configurations/save", {
      editMode: false,
      "page-title": "Add Configuration",
    });
  } catch (err) {
    console.error("Error fetching configuration:", err);
    res.flash("error", "An error occurred while fetching the configuration.");
  }
}

export async function postConfigurationSave(req, res, next) {
  const { itbis } = req.body;

  try {
    await Configuration.create({ itbis });
    res.flash("success", "Configuration saved successfully.");
    res.redirect("/configurations");
  } catch (err) {
    console.error("Error saving configuration:", err);
    res.flash("error", "An error occurred while saving the configuration.");
  }
}

//#endregion

//#region UPDATE

export async function getConfigurationEdit(req, res, next) {
  const id = req.params.id;

  try {
    const configuration = await Configuration.findOne({ _id: id }).lean();
    if (!configuration) {
      res.flash("error", "Configuration not found.");
      return res.redirect("/configurations");
    }

    res.render("configurations/save", {
      editMode: true,
      configuration: configuration,
      "page-title": `Edit Configuration`,
    });
  } catch (err) {
    console.error("Error fetching configuration:", err);
    res.flash("error", "An error occurred while fetching the configuration.");
  }
}

export async function postConfigurationEdit(req, res, next) 
{
    const {id, itbis} = req.body;

    try
    {
        const configuration = await Configuration.findOne({ _id: id });
        if(!configuration)        {
            res.flash("error", "Configuration not found.");
            return res.redirect("/configurations");
        }

        await Configuration.findByIdAndUpdate(id, { itbis });
        res.flash("success", "Configuration updated successfully.");
        res.redirect("/configuration");
    }
    catch (err)
    {
        console.error("Error updating configuration:", err);
        res.flash("error", "An error occurred while updating the configuration.");
    }
}

//#endregion
