const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const monitoringRoutes = require("./routes/monitoring.routes");
const healthRoutes = require("./routes/health.routes");
const endpointRoutes = require("./routes/endpoint.routes");
const app = express();
const authRoutes = require("./routes/auth.routes");
// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/endpoints", endpointRoutes);
app.use("/api/monitoring", monitoringRoutes);
module.exports = app;