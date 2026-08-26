import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import setupRoutes from "./routes/setup.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import biltyRoutes from "./routes/bilty.routes.js";
import challanRoutes from "./routes/challan.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/bilties", biltyRoutes);
app.use("/api/challans", challanRoutes);

app.get("/", async (req, res) => {

  const totalRoles = await prisma.role.count();

  res.json({
    success: true,
    message: "Shri Om Logistics API Running 🚛",
    totalRoles
  });

});

export default app;