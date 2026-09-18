const prometheusService = require("../services/prometheus.service");
const alertService = require("../services/alert.service");
const monitoringHistoryService = require("../services/monitoringHistory.service");


// =====================================================
// METRIC VALUE VALIDATION
// =====================================================

const isValidPercentage = (value) => {
    const numericValue = Number(value);

    return (
        Number.isFinite(numericValue) &&
        numericValue >= 0 &&
        numericValue <= 100
    );
};


const isValidNonNegativeValue = (value) => {
    const numericValue = Number(value);

    return (
        Number.isFinite(numericValue) &&
        numericValue >= 0
    );
};


// =====================================================
// CHECK METRIC THRESHOLD AND CREATE ALERT
// =====================================================

const checkAndCreateAlert = async (
    serverName,
    metric,
    value
) => {

    let severity = null;
    let message = "";


    // =============================================
    // CPU
    // =============================================

    if (metric === "CPU") {

        if (value >= 85) {

            severity = "Critical";

            message =
                "CPU usage exceeded critical threshold";

        } else if (value >= 70) {

            severity = "Warning";

            message =
                "CPU usage exceeded warning threshold";

        }

    }


    // =============================================
    // MEMORY
    // =============================================

    if (metric === "Memory") {

        if (value >= 85) {

            severity = "Critical";

            message =
                "Memory usage exceeded critical threshold";

        } else if (value >= 75) {

            severity = "Warning";

            message =
                "Memory usage exceeded warning threshold";

        }

    }


    // =============================================
    // DISK
    // =============================================

    if (metric === "Disk") {

        if (value >= 90) {

            severity = "Critical";

            message =
                "Disk usage exceeded critical threshold";

        } else if (value >= 80) {

            severity = "Warning";

            message =
                "Disk usage exceeded warning threshold";

        }

    }


    // =============================================
    // NORMAL CONDITION
    // =============================================

    if (!severity) {

        await alertService.resolveAlertByMetric(
            serverName,
            metric
        );

        return null;

    }


    // =============================================
    // CREATE OR GET ACTIVE ALERT
    // =============================================

    return await alertService.createOrGetAlert({

        serverName,

        metric,

        value,

        severity,

        message,

    });

};


// =====================================================
// CPU USAGE
// =====================================================

const getCPUUsage = async (req, res) => {

    try {

        const { server } = req.query;


        if (!server) {

            return res.status(400).json({

                success: false,

                message:
                    "Server name is required.",

                data: null,

            });

        }


        const cpu =
            await prometheusService.queryPrometheus(

                `100 - (
                    avg by(instance) (
                        rate(
                            windows_cpu_time_total{
                                mode="idle",
                                server="${server}"
                            }[2m]
                        )
                    ) * 100
                )`

            );


        if (

            !cpu ||

            cpu.length === 0 ||

            !isValidPercentage(
                cpu[0]?.value?.[1]
            )

        ) {

            return res.status(404).json({

                success: false,

                message:
                    `CPU metrics are unavailable for server: ${server}`,

                data: null,

            });

        }


        res.status(200).json({

            success: true,

            metric: "CPU",

            server,

            usage:
                Number(
                    parseFloat(
                        cpu[0].value[1]
                    ).toFixed(2)
                ),

            unit: "%",

            timestamp:
                cpu[0].value[0],

        });


    } catch (error) {

        console.error(
            "CPU Monitoring Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// MEMORY USAGE
// =====================================================

const getMemoryUsage = async (req, res) => {

    try {

        const { server } = req.query;


        if (!server) {

            return res.status(400).json({

                success: false,

                message:
                    "Server name is required.",

                data: null,

            });

        }


        const memory =
            await prometheusService.queryPrometheus(

                `100 * (
                    1 - (
                        windows_memory_available_bytes{
                            server="${server}"
                        }
                        /
                        windows_memory_physical_total_bytes{
                            server="${server}"
                        }
                    )
                )`

            );


        if (

            !memory ||

            memory.length === 0 ||

            !isValidPercentage(
                memory[0]?.value?.[1]
            )

        ) {

            return res.status(404).json({

                success: false,

                message:
                    `Memory metrics are unavailable for server: ${server}`,

                data: null,

            });

        }


        const result =
            memory[0];


        res.status(200).json({

            success: true,

            metric: "Memory",

            server,

            usage:
                Number(
                    parseFloat(
                        result.value[1]
                    ).toFixed(2)
                ),

            unit: "%",

            timestamp:
                result.value[0],

        });


    } catch (error) {

        console.error(
            "Memory Monitoring Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// DISK USAGE
// =====================================================

const getDiskUsage = async (req, res) => {

    try {

        const { server } = req.query;


        if (!server) {

            return res.status(400).json({

                success: false,

                message:
                    "Server name is required.",

                data: null,

            });

        }


        const disk =
            await prometheusService.queryPrometheus(

                `100 * (
                    1 - (
                        windows_logical_disk_free_bytes{
                            volume="C:",
                            server="${server}"
                        }
                        /
                        windows_logical_disk_size_bytes{
                            volume="C:",
                            server="${server}"
                        }
                    )
                )`

            );


        if (

            !disk ||

            disk.length === 0 ||

            !isValidPercentage(
                disk[0]?.value?.[1]
            )

        ) {

            return res.status(404).json({

                success: false,

                message:
                    `Disk metrics are unavailable for server: ${server}`,

                data: null,

            });

        }


        const result =
            disk[0];


        res.status(200).json({

            success: true,

            metric: "Disk",

            server,

            volume: "C:",

            usage:
                Number(
                    parseFloat(
                        result.value[1]
                    ).toFixed(2)
                ),

            unit: "%",

            timestamp:
                result.value[0],

        });


    } catch (error) {

        console.error(
            "Disk Monitoring Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// NETWORK USAGE
// =====================================================

const getNetworkUsage = async (req, res) => {

    try {

        const { server } = req.query;


        if (!server) {

            return res.status(400).json({

                success: false,

                message:
                    "Server name is required.",

                data: null,

            });

        }


        const receive =
            await prometheusService.queryPrometheus(

                `rate(
                    windows_net_bytes_received_total{
                        server="${server}"
                    }[2m]
                )`

            );


        const send =
            await prometheusService.queryPrometheus(

                `rate(
                    windows_net_bytes_sent_total{
                        server="${server}"
                    }[2m]
                )`

            );


        if (

            !receive ||

            receive.length === 0 ||

            !send ||

            send.length === 0 ||

            !isValidNonNegativeValue(
                receive[0]?.value?.[1]
            ) ||

            !isValidNonNegativeValue(
                send[0]?.value?.[1]
            )

        ) {

            return res.status(404).json({

                success: false,

                message:
                    `Network metrics are unavailable for server: ${server}`,

                data: null,

            });

        }


        res.status(200).json({

            success: true,

            metric: "Network",

            server,

            interface:
                receive[0].metric.nic ||
                "Network Interface",

            receive:
                Number(
                    parseFloat(
                        receive[0].value[1]
                    ).toFixed(2)
                ),

            send:
                Number(
                    parseFloat(
                        send[0].value[1]
                    ).toFixed(2)
                ),

            unit:
                "bytes/sec",

            timestamp:
                receive[0].value[0],

        });


    } catch (error) {

        console.error(
            "Network Monitoring Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// SYSTEM UPTIME
// =====================================================

const getUptime = async (req, res) => {

    try {

        const { server } = req.query;


        if (!server) {

            return res.status(400).json({

                success: false,

                message:
                    "Server name is required.",

                data: null,

            });

        }


        const uptime =
            await prometheusService.queryPrometheus(

                `time() -
                windows_system_boot_time_timestamp{
                    server="${server}"
                }`

            );


        if (

            !uptime ||

            uptime.length === 0 ||

            !isValidNonNegativeValue(
                uptime[0]?.value?.[1]
            )

        ) {

            return res.status(404).json({

                success: false,

                message:
                    `Uptime metrics are unavailable for server: ${server}`,

                data: null,

            });

        }


        const totalSeconds =
            Number(
                uptime[0].value[1]
            );


        const days =
            Math.floor(
                totalSeconds / 86400
            );


        const hours =
            Math.floor(
                (totalSeconds % 86400) / 3600
            );


        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );


        res.status(200).json({

            success: true,

            metric: "Uptime",

            server,

            uptime: {

                days,

                hours,

                minutes,

            },

            totalSeconds:
                Number(
                    totalSeconds.toFixed(2)
                ),

            timestamp:
                uptime[0].value[0],

        });


    } catch (error) {

        console.error(
            "Uptime Monitoring Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// MONITORING SUMMARY
// =====================================================

const getMonitoringSummary = async (req, res) => {

    try {

        // =============================================
        // GET SELECTED SERVER
        // =============================================

        const { server } =
            req.query;


        if (!server) {

            return res.status(400).json({

                success: false,

                message:
                    "Server name is required.",

                data: null,

            });

        }


        console.log(
            `Monitoring request received for: ${server}`
        );


        // =============================================
        // CPU
        // =============================================

        const cpu =
            await prometheusService.queryPrometheus(

                `100 - (
                    avg by(instance) (
                        rate(
                            windows_cpu_time_total{
                                mode="idle",
                                server="${server}"
                            }[2m]
                        )
                    ) * 100
                )`

            );


        // =============================================
        // MEMORY
        // =============================================

        const memory =
            await prometheusService.queryPrometheus(

                `100 * (
                    1 - (
                        windows_memory_available_bytes{
                            server="${server}"
                        }
                        /
                        windows_memory_physical_total_bytes{
                            server="${server}"
                        }
                    )
                )`

            );


        // =============================================
        // DISK
        // =============================================

        const disk =
            await prometheusService.queryPrometheus(

                `100 * (
                    1 - (
                        windows_logical_disk_free_bytes{
                            volume="C:",
                            server="${server}"
                        }
                        /
                        windows_logical_disk_size_bytes{
                            volume="C:",
                            server="${server}"
                        }
                    )
                )`

            );


        // =============================================
        // NETWORK RECEIVE
        // =============================================

        const receive =
            await prometheusService.queryPrometheus(

                `rate(
                    windows_net_bytes_received_total{
                        server="${server}"
                    }[2m]
                )`

            );


        // =============================================
        // NETWORK SEND
        // =============================================

        const send =
            await prometheusService.queryPrometheus(

                `rate(
                    windows_net_bytes_sent_total{
                        server="${server}"
                    }[2m]
                )`

            );


        // =============================================
        // UPTIME
        // =============================================

        const uptime =
            await prometheusService.queryPrometheus(

                `time() -
                windows_system_boot_time_timestamp{
                    server="${server}"
                }`

            );


        // =============================================
        // VALIDATE ALL METRICS
        // =============================================

        if (

            !cpu?.length ||

            !memory?.length ||

            !disk?.length ||

            !receive?.length ||

            !send?.length ||

            !uptime?.length ||

            !isValidPercentage(
                cpu[0]?.value?.[1]
            ) ||

            !isValidPercentage(
                memory[0]?.value?.[1]
            ) ||

            !isValidPercentage(
                disk[0]?.value?.[1]
            ) ||

            !isValidNonNegativeValue(
                receive[0]?.value?.[1]
            ) ||

            !isValidNonNegativeValue(
                send[0]?.value?.[1]
            ) ||

            !isValidNonNegativeValue(
                uptime[0]?.value?.[1]
            )

        ) {

            console.log(
                `No valid monitoring data found for: ${server}`
            );


            return res.status(404).json({

                success: false,

                message:
                    `Monitoring metrics are unavailable for server: ${server}`,

                server,

                data: null,

            });

        }


        // =============================================
        // CONVERT UPTIME
        // =============================================

        const totalSeconds =
            Number(
                uptime[0].value[1]
            );


        const days =
            Math.floor(
                totalSeconds / 86400
            );


        const hours =
            Math.floor(
                (totalSeconds % 86400) / 3600
            );


        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );


        // =============================================
        // CONVERT MONITORING VALUES
        // =============================================

        const cpuValue =
            Number(
                parseFloat(
                    cpu[0].value[1]
                ).toFixed(2)
            );


        const memoryValue =
            Number(
                parseFloat(
                    memory[0].value[1]
                ).toFixed(2)
            );


        const diskValue =
            Number(
                parseFloat(
                    disk[0].value[1]
                ).toFixed(2)
            );


        // =============================================
        // CHECK CPU ALERT
        // =============================================

        await checkAndCreateAlert(
            server,
            "CPU",
            cpuValue
        );


        // =============================================
        // CHECK MEMORY ALERT
        // =============================================

        await checkAndCreateAlert(
            server,
            "Memory",
            memoryValue
        );


        // =============================================
        // CHECK DISK ALERT
        // =============================================

        await checkAndCreateAlert(
            server,
            "Disk",
            diskValue
        );


        // =============================================
        // SAVE MONITORING HISTORY
        // =============================================

        const networkReceiveValue =
            Number(
                parseFloat(
                    receive[0].value[1]
                ).toFixed(2)
            );


        const networkSendValue =
            Number(
                parseFloat(
                    send[0].value[1]
                ).toFixed(2)
            );


        try {
    await monitoringHistoryService.createMonitoringHistory({
        serverName: server,
        cpu: cpuValue,
        memory: memoryValue,
        disk: diskValue,
        networkReceive: networkReceiveValue,
        networkSend: networkSendValue,
    });
} catch (historyError) {
    console.error(
        "Monitoring History Error:",
        historyError.message
    );
}


        // =============================================
        // FINAL RESPONSE
        // =============================================

        res.status(200).json({

            success: true,

            message:
                "Monitoring summary fetched successfully.",

            server,

            data: {

                cpu:
                    Number(
                        parseFloat(
                            cpu[0].value[1]
                        ).toFixed(2)
                    ),

                memory:
                    Number(
                        parseFloat(
                            memory[0].value[1]
                        ).toFixed(2)
                    ),

                disk:
                    Number(
                        parseFloat(
                            disk[0].value[1]
                        ).toFixed(2)
                    ),

                network: {

                    interface:
                        receive[0].metric.nic ||
                        "Network Interface",

                    receive:
                        Number(
                            parseFloat(
                                receive[0].value[1]
                            ).toFixed(2)
                        ),

                    send:
                        Number(
                            parseFloat(
                                send[0].value[1]
                            ).toFixed(2)
                        ),

                    unit:
                        "bytes/sec",

                },

                uptime: {

                    days,

                    hours,

                    minutes,

                    totalSeconds:
                        Number(
                            totalSeconds.toFixed(2)
                        ),

                },

            },

        });


    } catch (error) {

        console.error(
            "Monitoring Summary Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {

    getCPUUsage,

    getMemoryUsage,

    getDiskUsage,

    getNetworkUsage,

    getUptime,

    getMonitoringSummary,

};