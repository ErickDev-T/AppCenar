import "./utils/LoadEnvConfig.js";
import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { projectRoot } from "./utils/Paths.js";
import { GetSection } from "./utils/helpers/Section.js";
import { Equals } from "./utils/helpers/compare.js";
import connectDB from "./utils/MongooseConnection.js";
import multer from "multer";
import { v4 as guidV4 } from "uuid";
import authRouter from "./routes/auth-router.js";
import { sendEmail } from "./services/EmailServices.js";
import dashboardRouter from "./routes/dashboard-router.js";

const app = express();
app.engine("hbs", engine({
    layoutsDir: "views/layouts",
    defaultLayout: "main",
    extname: "hbs",
    helpers: {
        section: GetSection,
        eq: Equals
    }
}));
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(projectRoot, "public")));
app.use(express.urlencoded());

const imageStorageForCoverImageBooks = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(projectRoot, "public", "Images", "profileImages" ));
    },
    filename: (req,file,cb) => {
        const fileName = `${guidV4()}-${file.originalname}`;
        cb(null, fileName)
    }
});

app.use(multer({ storage: imageStorageForCoverImageBooks}).single("coverImage"))

app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);


app.use((req, res) => {


    res.status(404).render("404",
        {
            layout: "anonymous-layout",
            title: "Page Not Found"
        });
});


try {
 
  await connectDB();
  app.listen(process.env.PORT || 5000);
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
} catch (ex) {
  console.error("Error setting up the application:", ex);
}
