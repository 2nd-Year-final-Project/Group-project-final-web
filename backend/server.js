const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const courseRoutes = require("./routes/courseRoutes");
const alertRoutes = require("./routes/alertRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/alerts", alertRoutes);

const PORT = process.env.PORT || 5000;

// Initialize alert scheduler
const { scheduleAlertChecks } = require('./scheduler/alertScheduler');
scheduleAlertChecks();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





