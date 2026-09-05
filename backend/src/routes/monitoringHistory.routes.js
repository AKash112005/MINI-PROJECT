const express = require("express");

const router = express.Router();

const monitoringHistoryController =
    require("../controllers/monitoringHistory.controller");

const authMiddleware =
    require("../middleware/auth.middleware");


/*
 * ==========================================
 * Get Monitoring History
 * ==========================================
 *
 * Example:
 * GET /api/monitoring-history?server=Local%20Windows%20Test%20Machine
 *
 */
router.get(
    "/",
    authMiddleware,
    monitoringHistoryController.getMonitoringHistory
);


module.exports = router;