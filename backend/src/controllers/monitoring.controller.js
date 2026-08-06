const prometheusService = require("../services/prometheus.service");

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

module.exports = {
    getCPUUsage,
};