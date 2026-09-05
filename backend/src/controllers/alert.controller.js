const alertService = require("../services/alert.service");

/*
 * ==========================================
 * Get All Alerts For A Server
 * ==========================================
 */
const getAlertsByServer = async (req, res) => {
    try {
        const { server } = req.query;

        if (!server) {
            return res.status(400).json({
                success: false,
                message: "Server name is required.",
                data: null,
            });
        }

        const alerts =
            await alertService.getAlertsByServer(server);

        res.status(200).json({
            success: true,
            message: "Alerts fetched successfully.",
            server,
            data: alerts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};


/*
 * ==========================================
 * Get Active Alerts For A Server
 * ==========================================
 */
const getActiveAlertsByServer = async (req, res) => {
    try {
        const { server } = req.query;

        if (!server) {
            return res.status(400).json({
                success: false,
                message: "Server name is required.",
                data: null,
            });
        }

        const alerts =
            await alertService.getActiveAlertsByServer(server);

        res.status(200).json({
            success: true,
            message: "Active alerts fetched successfully.",
            server,
            data: alerts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};


/*
 * ==========================================
 * Resolve Alert
 * ==========================================
 */
const resolveAlert = async (req, res) => {
    try {
        const alert =
            await alertService.resolveAlert(
                req.params.id
            );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found.",
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            message: "Alert resolved successfully.",
            data: alert,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};


module.exports = {
    getAlertsByServer,
    getActiveAlertsByServer,
    resolveAlert,
};