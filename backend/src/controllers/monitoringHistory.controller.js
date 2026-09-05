const monitoringHistoryService = require("../services/monitoringHistory.service");


/*
 * ==========================================
 * Get Monitoring History For A Server
 * ==========================================
 */
const getMonitoringHistory = async (req, res) => {
    try {
        const { server } = req.query;

        if (!server) {
            return res.status(400).json({
                success: false,
                message: "Server name is required.",
                data: null,
            });
        }

        const history =
            await monitoringHistoryService
                .getMonitoringHistoryByServer(server);

        res.status(200).json({
            success: true,
            message: "Monitoring history fetched successfully.",
            server,
            data: history,
        });

    } catch (error) {
        console.error(
            "Monitoring History Controller Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};


module.exports = {
    getMonitoringHistory,
};