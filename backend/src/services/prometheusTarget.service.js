const k8s = require("@kubernetes/client-node");

const NAMESPACE = "monitoring";
const CONFIG_MAP_NAME = "prometheus-targets";
const TARGET_FILE_NAME = "targets.json";

const kc = new k8s.KubeConfig();

// Uses the same Minikube context/configuration as kubectl
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);

const buildTargets = (endpoints) => {
    return endpoints
        .filter(
            (endpoint) =>
                endpoint.ipAddress &&
                endpoint.serverName &&
                endpoint.operatingSystem
        )
        .map((endpoint) => {
            const port =
                endpoint.operatingSystem === "Windows"
                    ? "9182"
                    : "9100";

            return {
                targets: [
                    `${endpoint.ipAddress}:${port}`,
                ],
                labels: {
                    server: endpoint.serverName,
                },
            };
        });
};

const updatePrometheusTargets = async (endpoints) => {
    const targets = buildTargets(endpoints);

    const targetsJson = JSON.stringify(targets, null, 2);

    // JSON Patch operation
    const patchBody = [
        {
            op: "replace",
            path: `/data/${TARGET_FILE_NAME}`,
            value: targetsJson,
        },
    ];

    await coreApi.patchNamespacedConfigMap({
        name: CONFIG_MAP_NAME,
        namespace: NAMESPACE,
        body: patchBody,
    });

    return targets;
};

module.exports = {
    updatePrometheusTargets,
};