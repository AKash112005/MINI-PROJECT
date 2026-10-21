const k8s = require("@kubernetes/client-node");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const NAMESPACE = "monitoring";
const CONFIG_MAP_NAME = "prometheus-targets";
const TARGET_FILE_NAME = "targets.json";

const kc = new k8s.KubeConfig();
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

            let target = endpoint.ipAddress.trim();

            /*
             * If the IP address already contains an exporter port,
             * do not append another port.
             */
            if (
                !target.includes(":") ||
                (
                    target.includes(":") &&
                    !target.match(/:\d+$/)
                )
            ) {

                const port =
                    endpoint.operatingSystem === "Windows"
                        ? "9182"
                        : "9100";

                target = `${target}:${port}`;
            }

            return {
                targets: [
                    target,
                ],
                labels: {
                    server: endpoint.serverName,
                },
            };

        });
};

const updatePrometheusTargets = async (endpoints) => {

    const targets =
        buildTargets(endpoints);

    const targetsJson =
        JSON.stringify(
            targets,
            null,
            2
        );

    const targetsFile =
        process.env.PROMETHEUS_TARGETS_FILE;

    if (targetsFile) {
        const directory =
            path.dirname(targetsFile);

        await fs.mkdir(directory, {
            recursive: true,
        });

        const temporaryFile =
            `${targetsFile}.${crypto.randomUUID()}.tmp`;

        await fs.writeFile(
            temporaryFile,
            targetsJson,
            "utf8"
        );

        await fs.rename(
            temporaryFile,
            targetsFile
        );

        return targets;
    }

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