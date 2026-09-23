const {
    updatePrometheusTargets,
} = require("./src/services/prometheusTarget.service");

const testEndpoint = [
    {
        serverName: "AWS Ubuntu Production",
        ipAddress: "13.234.30.85",
        operatingSystem: "Ubuntu",
    },
];

const runTest = async () => {
    try {
        const result = await updatePrometheusTargets(testEndpoint);

        console.log("=================================");
        console.log("Prometheus Target Update SUCCESS");
        console.log("=================================");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("=================================");
        console.error("Prometheus Target Update FAILED");
        console.error("=================================");
        console.error(error.message);
        console.error(error.response?.body || "");
    }
};

runTest();