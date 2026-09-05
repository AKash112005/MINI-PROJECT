const express = require("express");

const router = express.Router();

const alertController =
    require("../controllers/alert.controller");

const authMiddleware =
    require("../middleware/auth.middleware");


/*
 * Get all alerts for a server
 *
 * GET /api/alerts?server=Local%20Windows%20Test%20Machine
 */
router.get(
    "/",
    authMiddleware,
    alertController.getAlertsByServer
);


/*
 * Get active alerts for a server
 *
 * GET /api/alerts/active?server=Local%20Windows%20Test%20Machine
 */
router.get(
    "/active",
    authMiddleware,
    alertController.getActiveAlertsByServer
);


/*
 * Resolve an alert
 *
 * PUT /api/alerts/:id/resolve
 */
router.put(
    "/:id/resolve",
    authMiddleware,
    alertController.resolveAlert
);


module.exports = router;