const MonitoringHistory = require("../models/MonitoringHistory");


// =====================================================
// Create Monitoring History Record
// =====================================================

const createMonitoringHistory = async (historyData) => {

    // Get the latest monitoring record
    // for the selected server.

    const latestRecord =
        await MonitoringHistory.findOne({
            serverName:
                historyData.serverName,
        }).sort({
            recordedAt: -1,
        });


    // Prevent storing an exact duplicate
    // of the latest monitoring sample.

    if (
        latestRecord &&
        latestRecord.cpu === historyData.cpu &&
        latestRecord.memory === historyData.memory &&
        latestRecord.disk === historyData.disk &&
        latestRecord.networkReceive ===
            historyData.networkReceive &&
        latestRecord.networkSend ===
            historyData.networkSend
    ) {
        return latestRecord;
    }


    // Create a new monitoring record.

    const record =
        await MonitoringHistory.create(
            historyData
        );


    // Cleanup old records.
    // Cleanup failure must not remove
    // the successfully created record.

    try {

        await cleanupMonitoringHistory(
            historyData.serverName
        );

    } catch (cleanupError) {

        console.error(
            "Monitoring History Cleanup Error:",
            cleanupError.message
        );
    }


    return record;
};


// =====================================================
// Get Monitoring History For A Server
// =====================================================

const getMonitoringHistoryByServer = async (
    serverName
) => {

    return await MonitoringHistory.find({
        serverName,
    })
        .sort({
            recordedAt: 1,
        })
        .limit(100);
};


// =====================================================
// Delete Old Monitoring History
// =====================================================

const cleanupMonitoringHistory = async (
    serverName
) => {

    const records =
        await MonitoringHistory.find({
            serverName,
        })
            .sort({
                recordedAt: -1,
            });


    if (records.length <= 100) {
        return;
    }


    const recordsToDelete =
        records.slice(100);


    const idsToDelete =
        recordsToDelete.map(
            (record) => record._id
        );


    await MonitoringHistory.deleteMany({
        _id: {
            $in: idsToDelete,
        },
    });
};


// =====================================================
// Export Services
// =====================================================

module.exports = {

    createMonitoringHistory,

    getMonitoringHistoryByServer,

    cleanupMonitoringHistory,

};