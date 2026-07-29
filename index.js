require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/error.middleware");
const User = require("./modules/users/user.model");
const { ROLES } = require("./constants/roles");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const clientRoutes = require("./modules/clients/client.routes");
const billRoutes = require("./modules/bills/bill.routes");
const pdfRoutes = require("./modules/pdf/pdf.routes");
// const tallyRoutes = require("./modules/tally/tally.routes");
const renewalRoutes = require("./modules/bills/bill.renewal.routes");
const { startRenewalReminderJob } = require("./jobs/renewalReminderJob");
const serverRoutes = require("./modules/servers/server.routes");
const serverAssignmentRoutes = require("./modules/server-assignments/serverAssignment.routes");
const app = express();

connectDB();

app.use(
  cors({
    origin: [
      // "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://billings.cloudedata.com",
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/pdf", pdfRoutes);
// app.use("/api/tally", tallyRoutes);
app.use("/api/renewals", renewalRoutes);

app.use("/api/servers", serverRoutes);
app.use("/api/server-assignments", serverAssignmentRoutes);

app.use(errorHandler);

const createDefaultSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ role: ROLES.SUPERADMIN });
    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: "Super Admin",
        email: "admin@cloudedata.com",
        password: "Admin@123",
        role: ROLES.SUPERADMIN,
      });
      await superAdmin.save();
      console.log(
        "Default superadmin created: admin@cloudedata.com / Admin@123",
      );
    }
  } catch (error) {
    console.error("Error creating default superadmin:", error.message);
  }
};

const createDefaultServerAdmin = async () => {
  try {
    const existingServerAdmin = await User.findOne({
      email: "serveradmin@cloudedata.com",
    });
    if (!existingServerAdmin) {
      //  Don't hash here - let the model's pre('save') middleware handle it
      const serverAdmin = new User({
        name: "Server Administrator",
        email: "serveradmin@cloudedata.com",
        password: "ServerAdmin@123", // Plain password - model will hash it
        role: "server_admin",
        isActive: true,
      });
      await serverAdmin.save();
      console.log(
        "Server Admin created with email: serveradmin@cloudedata.com",
      );
    } else {
      console.log(" Server Admin already exists");
    }
  } catch (error) {
    console.error("Error creating default serveradmin:", error.message);
  }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createDefaultSuperAdmin();
  await createDefaultServerAdmin();
  startRenewalReminderJob();
  console.log(" Renewal reminder job started");
});
