import "./utils/LoadEnvConfig.js";
import express from "express";
import session from "express-session";
import flash from "connect-flash";
import { engine } from "express-handlebars";
import path from "path";
import { projectRoot } from "./utils/Paths.js";
import { GetSection } from "./utils/helpers/Section.js";
import { Equals } from "./utils/helpers/compare.js";
import connectDB from "./utils/MongooseConnection.js";
import { attachAuthState } from "./middlewares/auth.middleware.js";
import dashboardRouter from "./routes/dashboard-router.js";
import authRouter from "./routes/auth.routes.js";
import configurationRouter from "./routes/ConfigurationRouter.js";
import deliveryDashboardRouter from "./routes/DeliveryDashboardRouter.js";
import adminDashboardRouter from "./routes/AdminDashboardRouter.js";
import commerceTypeRouter from "./routes/CommerceTypeRouter.js";

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
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(attachAuthState);

app.use("/user", authRouter);
app.use("/", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/configurations", configurationRouter);
app.use("/deliveryDashboar", deliveryDashboardRouter);
app.use("/adminDashboard", adminDashboardRouter);
app.use("/commerceType", commerceTypeRouter);


app.use((req, res) => {

    res.status(404).render("404",
        {
            layout: "anonymous-layout",
            title: "Page Not Found"
        });
});


try {
 
  await connectDB();
  app.listen(process.env.PORT || 3000);
  console.log(`Server corriento en el puerto ${process.env.PORT || 3000}`);
} catch (ex) {
  console.error("Error:", ex);
}
