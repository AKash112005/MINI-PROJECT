const mongoose = require("mongoose");

const monitoringHistorySchema = new mongoose.Schema(
    {
        serverName: {
            type: String,
            required: true,
            trim: true,
        },

        cpu: {
            type: Number,
            required: true,
        },

        memory: {
            type: Number,
            required: true,
        },

        disk: {
            type: Number,
            required: true,
        },

        networkReceive: {
            type: Number,
            required: true,
        },

        networkSend: {
            type: Number,
            required: true,
        },

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