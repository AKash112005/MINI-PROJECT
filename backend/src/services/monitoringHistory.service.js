const MonitoringHistory = require("../models/MonitoringHistory");

/*
 * ==========================================
 * Create Monitoring History Record
 * ==========================================
 */
const createMonitoringHistory = async (historyData) => {
    return await MonitoringHistory.create(historyData);
};


/*
 * ==========================================
 * Get Monitoring History For A Server
 * ==========================================
 */
const getMonitoringHistoryByServer = async (serverName) => {
    return await MonitoringHistory.find({
        serverName,
    })
        .sort({
            recordedAt: 1,
        })
        .limit(100);
};


/*
 * ==========================================
 * Delete Old Monitoring History
 * ==========================================
 *
 * Keeps the database from growing indefinitely.
 * Currently keeps the latest 100 records per server.
 */
const cleanupMonitoringHistory = async (serverName) => {
    const records = await MonitoringHistory.find({
        serverName,
    })
        .sort({
            recordedAt: -1,
        });

    if (records.length <= 100) {
        return;
    }

    const recordsToDelete = records.slice(100);

    const idsToDelete = recordsToDelete.map(
        (record) => record._id
    );

    await MonitoringHistory.deleteMany({
        _id: {
            $in: idsToDelete,
        },
    });
};


module.exports = {
    createMonitoringHistory,
    getMonitoringHistoryByServer,
    cleanupMonitoringHistory,
};