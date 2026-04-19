import { randomBytes, scryptSync } from "crypto";
import Users from "../models/UserModel.js";
import { Roles } from "../utils/enums/roles.js";

function sanitizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function hashPassword(plainPassword) {
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = scryptSync(plainPassword, salt, 64).toString("hex");

    return `${salt}:${hashedPassword}`;
}

//#region DASHBOARD

export async function getAdminDashboard(req, res, next) {
    try {
        const result = await Users.find(
            { role: Roles.ADMIN },
            {
                name: 1,
                lastName: 1,
                username: 1,
                email: 1,
                cedula: 1,
                isActive: 1
            }
        ).lean();

        const admins = result || [];

        return res.render("Admin/index", {
            adminList: admins,
            hasAdmin: admins.length > 0,
            layout: "admin-layout",
            "page-title": "Admin Dashboard"
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);

        req.flash("error", "Ocurrió un error cargando los administradores.");
        return res.redirect("/");
    }
}

//#endregion

//#region SAVE

export async function getAdminSave(req, res, next) {
    return res.render("Admin/save", {
        editMode: false,
        layout: "admin-layout",
        "page-title": "Agregar Administrador"
    });
}

export async function postAdminSave(req, res, next) {
    const formData = {
        name: sanitizeText(req.body.name),
        lastName: sanitizeText(req.body.lastName),
        username: sanitizeText(req.body.username),
        email: sanitizeText(req.body.email).toLowerCase(),
        cedula: sanitizeText(req.body.cedula)
    };

    const password =
        typeof req.body.password === "string" ? req.body.password.trim() : "";

    const confirmPassword =
        typeof req.body.confirmPassword === "string"
            ? req.body.confirmPassword.trim()
            : "";

    const errors = [];

    if (!formData.name) errors.push("El nombre es obligatorio.");
    if (!formData.lastName) errors.push("El apellido es obligatorio.");
    if (!formData.username) errors.push("El username es obligatorio.");
    if (!formData.email) errors.push("El correo es obligatorio.");
    if (!formData.cedula) errors.push("La cédula es obligatoria.");
    if (!password) errors.push("La contraseña es obligatoria.");
    if (!confirmPassword) errors.push("Debes confirmar la contraseña.");

    if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
        errors.push("El correo no es válido.");
    }

    if (password && password.length < 8) {
        errors.push("La contraseña debe tener al menos 8 caracteres.");
    }

    if (password !== confirmPassword) {
        errors.push("Las contraseñas no coinciden.");
    }

    try {
        const [emailExists, usernameExists] = await Promise.all([
            Users.exists({ email: formData.email }),
            Users.exists({ username: formData.username })
        ]);

        if (emailExists) {
            errors.push("Ya existe un usuario con ese correo.");
        }

        if (usernameExists) {
            errors.push("Ese username ya está en uso.");
        }

        if (errors.length > 0) {
            return res.render("Admin/save", {
                editMode: false,
                formData,
                errors,
                layout: "admin-layout",
                "page-title": "Agregar Administrador"
            });
        }

        await Users.create({
            ...formData,
            password: hashPassword(password),
            role: Roles.ADMIN,
            isActive: true
        });

        req.flash("success", "Administrador creado correctamente.");
        return res.redirect("/Admin");
    } catch (error) {
        console.error("Error creando admin:", error);

        return res.render("Admin/save", {
            editMode: false,
            formData,
            errors: ["Ocurrió un error creando el administrador."],
            layout: "admin-layout",
            "page-title": "Agregar Administrador"
        });
    }
}

//#endregion

//#region EDIT

export async function getAdminEdit(req, res, next) {
    const id = req.params.id;

    try {
        const admin = await Users.findOne({
            _id: id,
            role: Roles.ADMIN
        }).lean();

        if (!admin) {
            req.flash("error", "Administrador no encontrado.");
            return res.redirect("/Admin");
        }

        return res.render("Admin/save", {
            editMode: true,
            admin,
            layout: "admin-layout",
            "page-title": `Editar Administrador ${admin.name}`
        });
    } catch (error) {
        console.error("Error fetching admin for edit:", error);

        req.flash("error", "Error cargando el administrador.");
        return res.redirect("/Admin");
    }
}

export async function postAdminEdit(req, res, next) {
    const { id } = req.body;

    const formData = {
        name: sanitizeText(req.body.name),
        lastName: sanitizeText(req.body.lastName),
        username: sanitizeText(req.body.username),
        email: sanitizeText(req.body.email).toLowerCase(),
        cedula: sanitizeText(req.body.cedula)
    };

    const password =
        typeof req.body.password === "string" ? req.body.password.trim() : "";

    const confirmPassword =
        typeof req.body.confirmPassword === "string"
            ? req.body.confirmPassword.trim()
            : "";

    const errors = [];

    if (!formData.name) errors.push("El nombre es obligatorio.");
    if (!formData.lastName) errors.push("El apellido es obligatorio.");
    if (!formData.username) errors.push("El username es obligatorio.");
    if (!formData.email) errors.push("El correo es obligatorio.");
    if (!formData.cedula) errors.push("La cédula es obligatoria.");

    if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
        errors.push("El correo no es válido.");
    }

    if (password || confirmPassword) {
        if (password.length < 8) {
            errors.push("La contraseña debe tener al menos 8 caracteres.");
        }

        if (password !== confirmPassword) {
            errors.push("Las contraseñas no coinciden.");
        }
    }

    try {
        const admin = await Users.findOne({
            _id: id,
            role: Roles.ADMIN
        }).lean();

        if (!admin) {
            req.flash("error", "Administrador no encontrado.");
            return res.redirect("/Admin");
        }

        const [emailExists, usernameExists] = await Promise.all([
            Users.findOne({
                email: formData.email,
                _id: { $ne: id }
            }),
            Users.findOne({
                username: formData.username,
                _id: { $ne: id }
            })
        ]);

        if (emailExists) {
            errors.push("Ya existe un usuario con ese correo.");
        }

        if (usernameExists) {
            errors.push("Ese username ya está en uso.");
        }

        if (errors.length > 0) {
            return res.render("Admin/save", {
                editMode: true,
                admin: {
                    ...formData,
                    _id: id
                },
                errors,
                layout: "admin-layout",
                "page-title": "Editar Administrador"
            });
        }

        const updateData = {
            ...formData
        };

        if (password) {
            updateData.password = hashPassword(password);
        }

        await Users.findByIdAndUpdate(id, updateData);

        req.flash("success", "Administrador actualizado correctamente.");
        return res.redirect("/Admin");
    } catch (error) {
        console.error("Error updating admin:", error);

        req.flash("error", "Error actualizando el administrador.");
        return res.redirect("/Admin");
    }
}

//#endregion

//#region STATUS

export async function postAdminStatus(req, res, next) {
    const adminId = req.params.id;
    const isActive = req.body.isActive === "true";

    try {
        const loggedUserId = req.session.user?._id;

        if (loggedUserId && adminId === loggedUserId.toString()) {
            req.flash("error", "No puedes modificar tu propio estado.");
            return res.redirect("/Admin");
        }

        const admin = await Users.findOne({
            _id: adminId,
            role: Roles.ADMIN
        });

        if (!admin) {
            req.flash("error", "Administrador no encontrado.");
            return res.redirect("/Admin");
        }

        await Users.findByIdAndUpdate(adminId, {
            isActive
        });

        req.flash(
            "success",
            isActive
                ? "Administrador activado correctamente."
                : "Administrador desactivado correctamente."
        );

        return res.redirect("/Admin");
    } catch (error) {
        console.error("Error updating admin status:", error);

        req.flash("error", "Error al actualizar el estado del administrador.");
        return res.redirect("/Admin");
    }
}

//#endregion