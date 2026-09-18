const mongoose = require("mongoose");


// =====================================================
// Monitoring History Schema
// =====================================================

const monitoringHistorySchema = new mongoose.Schema(
    {
        serverName: {
            type: String,
            required: true,
            trim: true,
        },


        // CPU Usage
        cpu: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },


        // Memory Usage
        memory: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },


        // Disk Usage
        disk: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },


        // Network Receive
        networkReceive: {
            type: Number,
            required: true,
            min: 0,
        },


        // Network Send
        networkSend: {
            type: Number,
            required: true,
            min: 0,
        },


        // Monitoring Timestamp
        recordedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model(
    "MonitoringHistory",
    monitoringHistorySchema
);