const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const monitoringController = require("../controllers/monitoring.controller");


// ==========================================
// CPU Monitoring
// ==========================================

router.get(
    "/cpu",
    authMiddleware,
    monitoringController.getCPUUsage
);


// ==========================================
// Memory Monitoring
// ==========================================

router.get(
    "/memory",
    authMiddleware,
    monitoringController.getMemoryUsage
);


// ==========================================
// Disk Monitoring
// ==========================================

router.get(
    "/disk",
    authMiddleware,
    monitoringController.getDiskUsage
);


// ==========================================
// Network Monitoring
// ==========================================

router.get(
    "/network",
    authMiddleware,
    monitoringController.getNetworkUsage
);


// ==========================================
// Uptime Monitoring
// ==========================================

router.get(
    "/uptime",
    authMiddleware,
    monitoringController.getUptime
);


// ==========================================
// Monitoring Summary
// ==========================================

router.get(
    "/summary",
    authMiddleware,
    monitoringController.getMonitoringSummary
);


// ==========================================
// Export Router
// ==========================================

module.exports = router;