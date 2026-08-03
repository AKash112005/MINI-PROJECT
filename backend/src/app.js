const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CloudWatchX Backend is running successfully 🚀",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

module.exports = app;