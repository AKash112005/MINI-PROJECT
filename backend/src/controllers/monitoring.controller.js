const prometheusService = require("../services/prometheus.service");


// ==============================
// CPU Usage
// ==============================
const getCPUUsage = async (req, res) => {
    try {

        const cpu = await prometheusService.queryPrometheus(
            '100 - (avg by(instance)(rate(windows_cpu_time_total{mode="idle"}[2m])) * 100)'
        );

        res.json({
            success: true,
            metric: "CPU",
            data: cpu,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// ==============================
// Memory Usage
// ==============================
const getMemoryUsage = async (req, res) => {
    try {

        const memory = await prometheusService.queryPrometheus(
            '100 * (1 - (windows_memory_available_bytes / windows_memory_physical_total_bytes))'
        );

        if (!memory || memory.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Memory metrics not available.",
                data: null,
            });
        }

        const result = memory[0];

        res.status(200).json({
            success: true,
            metric: "Memory",
            usage: Number(parseFloat(result.value[1]).toFixed(2)),
            unit: "%",
            timestamp: result.value[0],
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// ==============================
// Disk Usage
// ==============================
const getDiskUsage = async (req, res) => {
    try {

        const disk = await prometheusService.queryPrometheus(
            '100 * (1 - (windows_logical_disk_free_bytes{volume="C:"} / windows_logical_disk_size_bytes{volume="C:"}))'
        );

        if (!disk || disk.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Disk metrics not available.",
                data: null,
            });
        }

        const result = disk[0];

        res.status(200).json({
            success: true,
            metric: "Disk",
            volume: "C:",
            usage: Number(parseFloat(result.value[1]).toFixed(2)),
            unit: "%",
            timestamp: result.value[0],
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// ==============================
// Network Usage
// ==============================
const getNetworkUsage = async (req, res) => {
    try {

        const receive = await prometheusService.queryPrometheus(
            'rate(windows_net_bytes_received_total{nic="Intel[R] Wi-Fi 6E AX211 160MHz"}[2m])'
        );

        const send = await prometheusService.queryPrometheus(
            'rate(windows_net_bytes_sent_total{nic="Intel[R] Wi-Fi 6E AX211 160MHz"}[2m])'
        );

        if (!receive || receive.length === 0 || !send || send.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Network metrics not available.",
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            metric: "Network",
            interface: "Intel[R] Wi-Fi 6E AX211 160MHz",
            receive: Number(parseFloat(receive[0].value[1]).toFixed(2)),
            send: Number(parseFloat(send[0].value[1]).toFixed(2)),
            unit: "bytes/sec",
            timestamp: receive[0].value[0],
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// ==============================
// System Uptime
// ==============================
const getUptime = async (req, res) => {
    try {

        const uptime = await prometheusService.queryPrometheus(
            'time() - windows_system_boot_time_timestamp'
        );

        if (!uptime || uptime.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Uptime metrics not available.",
                data: null,
            });
        }

        const seconds = Number(uptime[0].value[1]);

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        res.status(200).json({
            success: true,
            metric: "Uptime",
            uptime: {
                days,
                hours,
                minutes,
            },
            totalSeconds: Number(seconds.toFixed(2)),
            timestamp: uptime[0].value[0],
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// ==============================
// Monitoring Summary
// ==============================
const getMonitoringSummary = async (req, res) => {
    try {

        // CPU
        const cpu = await prometheusService.queryPrometheus(
            '100 - (avg by(instance)(rate(windows_cpu_time_total{mode="idle"}[2m])) * 100)'
        );

        // Memory
        const memory = await prometheusService.queryPrometheus(
            '100 * (1 - (windows_memory_available_bytes / windows_memory_physical_total_bytes))'
        );

        // Disk
        const disk = await prometheusService.queryPrometheus(
            '100 * (1 - (windows_logical_disk_free_bytes{volume="C:"} / windows_logical_disk_size_bytes{volume="C:"}))'
        );

        // Network Receive
        const receive = await prometheusService.queryPrometheus(
            'rate(windows_net_bytes_received_total{nic="Intel[R] Wi-Fi 6E AX211 160MHz"}[2m])'
        );

        // Network Send
        const send = await prometheusService.queryPrometheus(
            'rate(windows_net_bytes_sent_total{nic="Intel[R] Wi-Fi 6E AX211 160MHz"}[2m])'
        );

        // Uptime
        const uptime = await prometheusService.queryPrometheus(
            'time() - windows_system_boot_time_timestamp'
        );

        // Validate responses
        if (
            !cpu?.length ||
            !memory?.length ||
            !disk?.length ||
            !receive?.length ||
            !send?.length ||
            !uptime?.length
        ) {
            return res.status(404).json({
                success: false,
                message: "One or more monitoring metrics are unavailable.",
                data: null,
            });
        }

        // Convert uptime
        const totalSeconds = Number(uptime[0].value[1]);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        res.status(200).json({
            success: true,
            message: "Monitoring summary fetched successfully.",
            data: {

                cpu: Number(parseFloat(cpu[0].value[1]).toFixed(2)),

                memory: Number(
                    parseFloat(memory[0].value[1]).toFixed(2)
                ),

                disk: Number(
                    parseFloat(disk[0].value[1]).toFixed(2)
                ),

                network: {
                    interface: "Intel[R] Wi-Fi 6E AX211 160MHz",

                    receive: Number(
                        parseFloat(receive[0].value[1]).toFixed(2)
                    ),

                    send: Number(
                        parseFloat(send[0].value[1]).toFixed(2)
                    ),

                    unit: "bytes/sec",
                },

                uptime: {
                    days,
                    hours,
                    minutes,
                    totalSeconds: Number(totalSeconds.toFixed(2)),
                },
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==============================
// Export Controllers
// ==============================
module.exports = {
    getCPUUsage,
    getMemoryUsage,
    getDiskUsage,
    getNetworkUsage,
    getUptime,
    getMonitoringSummary,
};