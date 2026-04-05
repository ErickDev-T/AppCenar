import multer from "multer";
import path from "path";
import { v4 as guidV4 } from "uuid"; //generar los nombres randon
import { projectRoot } from "../utils/Paths.js";

const profileImageStorage = multer.diskStorage({
  //en qe carpeta se va a guardar la imagen
  destination: (req, file, cb) => {
    cb(null, path.join(projectRoot, "public", "Images", "profileImages"));
  },
  filename: (req, file, cb) => {
    const fileName = `${guidV4()}-${file.originalname}`;
    cb(null, fileName);
  }
});

//se resive un solo archivo dond en el formularo se llama profileImage
export const uploadProfileImage = multer({ storage: profileImageStorage }).single("profileImage");
