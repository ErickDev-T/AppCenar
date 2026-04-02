import { randomBytes, scryptSync } from "node:crypto";
import { unlink } from "node:fs/promises";
import Users from "../models/UserModel.js";
import { Roles } from "../utils/enums/roles.js";
import { sendEmail } from "../services/EmailServices.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hashPassword(plainPassword) {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(plainPassword, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

function getBaseUrl(req) {
  const appUrl = sanitizeText(process.env.APP_URL);
  if (appUrl) {
    return appUrl.replace(/\/+$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

function renderRegisterView(res, { formData, errors, statusCode = 200 }) {
  return res.status(statusCode).render("auth/register", {
    layout: "anonymous-layout",
    "page-title": "Registro",
    formData,
    errors
  });
}

async function removeUploadedFile(filePath) {
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (ex) {
    if (ex?.code !== "ENOENT") {
      console.error("Error deleting uploaded file", ex);
    }
  }
}

export function renderLoginPage(req, res) {
  const registeredMessage =
    req.query.registered === "1"
      ? "<p style=\"color: green;\">Cuenta creada inactiva. Revisa tu correo para activar la cuenta.</p>"
      : "";
  const activatedMessage =
    req.query.activated === "1"
      ? "<p style=\"color: green;\">Cuenta activada correctamente. Ya puedes iniciar sesion.</p>"
      : "";

  res.status(200).send(`
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h1>Login</h1>
        ${registeredMessage}
        ${activatedMessage}
        <p>aun no hecha </p>
        <a href="/user/register">Ir a registro</a>
      </body>
    </html>
  `);
}

export function renderRegisterPage(req, res) {
  return renderRegisterView(res, {
    formData: {
      name: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      role: ""
    },
    errors: []
  });
}

export async function register(req, res) {
  const formData = {
    name: sanitizeText(req.body.name),
    lastName: sanitizeText(req.body.lastName),
    username: sanitizeText(req.body.username),
    email: sanitizeText(req.body.email).toLowerCase(),
    phone: sanitizeText(req.body.phone),
    role: sanitizeText(req.body.role)
  };
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const confirmPassword = typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";
  const errors = [];
  const allowedRoles = [Roles.CLIENT, Roles.DELIVERY];

  if (!formData.name) errors.push("El nombre es obligatorio.");
  if (!formData.lastName) errors.push("El apellido es obligatorio.");
  if (!formData.username) errors.push("El username es obligatorio.");
  if (!formData.email) errors.push("El email es obligatorio.");
  if (!formData.phone) errors.push("El telefono es obligatorio.");
  if (!formData.role) errors.push("Debes seleccionar un rol.");
  if (formData.role && !allowedRoles.includes(formData.role)) {
    errors.push("El rol seleccionado no es valido.");
  }
  if (!password) errors.push("La contrasena es obligatoria.");
  if (!confirmPassword) errors.push("Debes confirmar la contrasena.");
  if (!req.file?.filename) errors.push("La foto de perfil es obligatoria.");

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("El email no tiene un formato valido.");
  }

  if (password && password.length < 8) {
    errors.push("La contrasena debe tener al menos 8 caracteres.");
  }

  if (password && confirmPassword && password !== confirmPassword) {
    errors.push("Las contrasenas no coinciden.");
  }

  if (errors.length > 0) {
    await removeUploadedFile(req.file?.path);
    return renderRegisterView(res, { formData, errors, statusCode: 400 });
  }

  let createdUserId = null;

  try {
    const [emailAlreadyExists, usernameAlreadyExists] = await Promise.all([
      Users.exists({ email: formData.email }),
      Users.exists({ username: formData.username })
    ]);

    if (emailAlreadyExists) errors.push("Ya existe una cuenta con ese email.");
    if (usernameAlreadyExists) errors.push("Ese username ya esta en uso.");

    if (errors.length > 0) {
      await removeUploadedFile(req.file?.path);
      return renderRegisterView(res, { formData, errors, statusCode: 409 });
    }

    const userPayload = {
      ...formData,
      password: hashPassword(password),
      role: formData.role,
      isActive: false,
      activateToken: randomBytes(32).toString("hex")
    };

    userPayload.profileImage = req.file.filename;

    const createdUser = await Users.create(userPayload);
    createdUserId = createdUser._id;

    const activationLink = `${getBaseUrl(req)}/user/activate/${userPayload.activateToken}`;
    await sendEmail({
      to: formData.email,
      subject: "Activa tu cuenta",
      html: `
        <h2>Hola ${formData.name}</h2>
        <p>Tu cuenta fue creada correctamente y esta inactiva.</p>
        <p>Para activarla, haz click en el siguiente enlace:</p>
        <p><a href="${activationLink}">Activar cuenta</a></p>
      `
    });

    return res.redirect("/user/login?registered=1");
  } catch (ex) {
    if (ex?.code === 11000) {
      const duplicateFields = Object.keys(ex.keyPattern ?? {});

      if (duplicateFields.includes("email")) {
        errors.push("Ya existe una cuenta con ese email.");
      }
      if (duplicateFields.includes("username")) {
        errors.push("Ese username ya esta en uso.");
      }

      if (errors.length === 0) {
        errors.push("No se pudo crear la cuenta por datos duplicados.");
      }

      await removeUploadedFile(req.file?.path);
      return renderRegisterView(res, { formData, errors, statusCode: 409 });
    }

    if (createdUserId) {
      try {
        await Users.findByIdAndDelete(createdUserId);
      } catch (deleteError) {
        console.error("Error cleaning failed registration", deleteError);
      }
    }

    await removeUploadedFile(req.file?.path);
    console.error("Error creating user", ex);
    errors.push("No se pudo completar el registro o enviar el correo de activacion.");
    return renderRegisterView(res, { formData, errors, statusCode: 500 });
  }
}

export async function activateAccount(req, res) {
  const token = sanitizeText(req.params.token);

  if (!token) {
    return res.status(400).send("Token de activacion invalido.");
  }

  try {
    const user = await Users.findOne({ activateToken: token });

    if (!user) {
      return res.status(404).send("El enlace de activacion no es valido o ya expiro.");
    }

    user.isActive = true;
    user.activateToken = null;
    await user.save();

    return res.redirect("/user/login?activated=1");
  } catch (ex) {
    console.error("Error activando el usuaroi ", ex);
    return res.status(500).send("Error interno al activar la cuenta.");
  }
}

export function login(req, res) {
  res.status(501).json({
    ok: false,
    message: "falta Login"
  });
}

export function logout(req, res) {
  res.status(501).json({
    ok: false,
    message: "falta Logout "
  });
}
