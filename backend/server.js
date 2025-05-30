const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");


dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);