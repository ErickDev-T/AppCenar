import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import { sendEmail} from "../services/EmailServices.js";
import { promisify } from "util";
import { Roles } from "../utils/enums/roles.js";
import {randomBytes} from "crypto";

export function GetLogin(req, res) {
    res.render("auth/login", 
        { "title": "Login",
           layout: "anonymous-layout"
        });
}

export function GetRegister(req, res) {
    res.render("auth/register", 
        { "title": "Register",
           layout: "anonymous-layout"
        });
}