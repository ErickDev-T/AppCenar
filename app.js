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

import clientRouter from "./routes/client.routes.js";
import commerceRouter from "./routes/commerce.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import addressRouter from "./routes/address.routes.js";
import orderRouter from "./routes/order.routes.js";
import clientDashboard from "./routes/client-dashboard.routes.js";

import AdminDashboardRouter from "./routes/AdminDashboard.routes.js";


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

app.use("/Admin", AdminDashboardRouter);
app.use("/", dashboardRouter);

app.use("/user", authRouter);
app.use("/client", clientRouter);
app.use("/commerce", commerceRouter);
app.use("/delivery", deliveryRouter);
app.use("/order", orderRouter);
app.use("/", dashboardRouter);
app.use("/address", addressRouter);
app.use("/order", orderRouter);
app.use("/client", clientDashboard);



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
