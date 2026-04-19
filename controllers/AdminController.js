import Users from "../models/UserModel.js";
import { Roles } from "../utils/enums/roles.js";

//#region get
export async function getAdminDashboard(req, res, next) 
{
    try
    {
        const result = await Users.find({ role: Roles.ADMIN }, {name: 1, lastName: 1, username: 1, email: 1, cedula: 1, isActive: 1}).lean();
        const admins = result || [];
        
        res.render("Admin/index", {
            adminList: admins,
            hasAdmin: admins.length > 0,
            "page-title": "Admin Dashboard"
        });
    }catch (error) 
    {
        console.error('Error fetching admin dashboard data:', error);
        res.flash('error', 'An error occurred while fetching admin dashboard data.');
    }
}
//#endregion

//#region post

export async function getAdminSave(req, res, next)
{
    res.render("Admin/save", {
        editMode: false, 
        "page-title": "Add New Admin"
    });
}

export async function postAdminSave(req, res) 
{
  const formData = {
    name: sanitizeText(req.body.name),
    lastName: sanitizeText(req.body.lastName),
    username: sanitizeText(req.body.username),
    email: sanitizeText(req.body.email).toLowerCase(),
    cedula: sanitizeText(req.body.cedula)
  };

  const password = typeof req.body.password === "string" ? req.body.password : "";
  const confirmPassword = typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";

  const errors = [];

  if (!formData.name) errors.push("El nombre es obligatorio.");
  if (!formData.lastName) errors.push("El apellido es obligatorio.");
  if (!formData.username) errors.push("El username es obligatorio.");
  if (!formData.email) errors.push("El correo es obligatorio.");
  if (!formData.cedula) errors.push("La cédula es obligatoria.");

  if (!password) errors.push("La contraseña es obligatoria.");
  if (!confirmPassword) errors.push("Debes confirmar la contraseña.");

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("El correo no es válido.");
  }

  if (password && password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres.");
  }

  if (password !== confirmPassword) {
    errors.push("Las contraseñas no coinciden.");
  }

  if (errors.length > 0) {
    return res.render("admin/create", { formData, errors });
  }

  try {
    const [emailExists, usernameExists] = await Promise.all([
      Users.exists({ email: formData.email }),
      Users.exists({ username: formData.username })
    ]);

    if (emailExists) errors.push("Ya existe un usuario con ese correo.");
    if (usernameExists) errors.push("Ese username ya está en uso.");

    if (errors.length > 0) {
      return res.render("admin/create", { formData, errors });
    }

    await Users.create({...formData, password: hashPassword(password), role: Roles.ADMIN, isActive: true});

    req.flash("success", "Administrador creado correctamente.");
    return res.redirect("/Admin");

  } catch (error) {
    console.error("Error creando admin:", error);
    errors.push("Error al crear el administrador.");
    return res.render("admin/create", { formData, errors });
  }
}

//#endregion

//#region update 

export async function getAdminEdit(req, res, next)
{
    const id = req.params.id;

    try
    {
        const admin = await Users.findOne({ _id: id, role: Roles.ADMIN }).lean();

        if(!admin)
        {
            req.flash("error", "Administrador no encontrado.");
            return res.redirect("/admin/list");
        }

        res.render("Admin/Save", {
            editMode: true,
            admin: admin,
            "page-title": `Editar Administrador ${admin.name}`
        });

    }catch(err)
    {
        console.error("Error fetching admin for edit:", err);
        req.flash("error", "Error cargando el administrador.");
        return res.redirect("/admin");
    }
}

export async function postAdminEdit(req, res, next)
{
    const { id, name, lastName, username, email, cedula, password, confirmPassword } = req.body;

    const errors = [];

    const formData = {
        name: sanitizeText(name),
        lastName: sanitizeText(lastName),
        username: sanitizeText(username),
        email: sanitizeText(email).toLowerCase(),
        cedula: sanitizeText(cedula)
    };

    if (!formData.name) errors.push("El nombre es obligatorio.");
    if (!formData.lastName) errors.push("El apellido es obligatorio.");
    if (!formData.username) errors.push("El usuario es obligatorio.");
    if (!formData.email) errors.push("El correo es obligatorio.");
    if (!formData.cedula) errors.push("La cédula es obligatoria.");
    if (!password) errors.push("La contraseña es obligatoria.");
    if (!confirmPassword) errors.push("Debes confirmar la contraseña.");

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push("El correo no es válido.");
    }

    if (password && password.length < 8) {
        errors.push("La contraseña debe tener al menos 8 caracteres.");
    }

    if (password !== confirmPassword) {
        errors.push("Las contraseñas no coinciden.");
    }

    try
    {
        const admin = await Users.findOne({ _id: id, role: Roles.ADMIN }).lean();

        if(!admin)
        {
            req.flash("error", "Administrador no encontrado.");
            return res.redirect("/admin/list");
        }

        const [emailExists, usernameExists] = await Promise.all([
            Users.findOne({ email: formData.email, _id: { $ne: id } }),
            Users.findOne({ username: formData.username, _id: { $ne: id } })
        ]);

        if (emailExists) errors.push("Ya existe un usuario con ese correo.");
        if (usernameExists) errors.push("Ese username ya está en uso.");

        if (errors.length > 0)
        {
            return res.render("admin/save", {
                editMode: true,
                admin: { ...formData, _id: id },
                errors,
                "page-title": "Editar Administrador"
            });
        }

        await Users.findByIdAndUpdate(id, {
            ...formData,
            password: hashPassword(password)
        });

        req.flash("success", "Administrador actualizado correctamente.");
        return res.redirect("/admin/list");

    }
    catch (err)
    {
        console.error("Error updating admin:", err);
        req.flash("error", "Error actualizando el administrador.");
        return res.redirect("/admin/list");
    }
}

export async function postAdminStatus(req, res, next)
{
    const adminId = req.params.id;
    const status  = req.body;

    try
    {
        const loggedUserId = req.session.user._id;

        if (adminId === loggedUserId.toString())
        {
            req.flash("error", "No puedes modificar tu propio estado.");
            return res.redirect("/admin");
        }

        const admin = await Users.findOne({ _id: adminId, role: Roles.ADMIN });

        if (!admin)
        {
            req.flash("error", "Administrador no encontrado.");
            return res.redirect("/admin");
        }

        await Users.findByIdAndUpdate(adminId, { isActive: status });

        req.flash(
            "success",
            status
                ? "Administrador activado correctamente."
                : "Administrador inactivado correctamente."
        );

        return res.redirect("/admin");

    } 
    catch (error)
    {
        console.error("Error updating admin status:", error);
        req.flash("error", "Error al actualizar el estado del administrador.");
        return res.redirect("/admin");
    }
}

//#endregion

