const Alert = require("../models/Alert");

/*
 * ==========================================
 * Create Alert
 * ==========================================
 */
const createAlert = async (alertData) => {
    return await Alert.create(alertData);
};


/*
 * ==========================================
 * Create Or Get Existing Active Alert
 * Prevents Duplicate Alerts
 * ==========================================
 */
const createOrGetAlert = async (alertData) => {
    const existingAlert = await Alert.findOne({
        serverName: alertData.serverName,
        metric: alertData.metric,
        status: "Active",
    });

    if (existingAlert) {
        return existingAlert;
    }

    return await Alert.create(alertData);
};


/*
 * ==========================================
 * Get All Alerts For A Server
 * ==========================================
 */
const getAlertsByServer = async (serverName) => {
    return await Alert.find({
        serverName,
    }).sort({
        createdAt: -1,
    });
};


/*
 * ==========================================
 * Get Active Alerts For A Server
 * ==========================================
 */
const getActiveAlertsByServer = async (serverName) => {
    return await Alert.find({
        serverName,
        status: "Active",
    }).sort({
        createdAt: -1,
    });
};


/*
 * ==========================================
 * Resolve Alert
 * ==========================================
 */
const resolveAlert = async (alertId) => {
    return await Alert.findByIdAndUpdate(
        alertId,
        {
            status: "Resolved",
        },
        {
            new: true,
        }
    );
};


/*
 * ==========================================
 * Resolve Active Alert For A Metric
 * ==========================================
 */
const resolveAlertByMetric = async (
    serverName,
    metric
) => {
    return await Alert.findOneAndUpdate(
        {
            serverName,
            metric,
            status: "Active",
        },
        {
            status: "Resolved",
        },
        {
            new: true,
        }
    );
};


module.exports = {
    createAlert,
    createOrGetAlert,
    getAlertsByServer,
    getActiveAlertsByServer,
    resolveAlert,
    resolveAlertByMetric,
};