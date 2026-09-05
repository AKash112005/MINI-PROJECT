const axios = require("axios");

const PROMETHEUS_URL = "http://localhost:9090";

/*
 * ==========================================
 * Query Prometheus
 * ==========================================
 */
const queryPrometheus = async (query) => {
    try {
        const response = await axios.get(
            `${PROMETHEUS_URL}/api/v1/query`,
            {
                params: {
                    query,
                },
            }
        );

        return response.data.data.result;

    } catch (error) {
        console.error(
            "Prometheus Query Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Unable to fetch Prometheus metrics."
        );
    }
};


/*
 * ==========================================
 * Query Prometheus For Specific Server
 * ==========================================
 */
const queryPrometheusByServer = async (
    query,
    server
) => {

    try {

        if (!server) {
            throw new Error(
                "Server name is required."
            );
        }

        const response = await axios.get(
            `${PROMETHEUS_URL}/api/v1/query`,
            {
                params: {
                    query,
                },
            }
        );

        return response.data.data.result;

    } catch (error) {

        console.error(
            "Prometheus Server Query Error:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            "Unable to fetch server monitoring metrics."
        );
    }
};
/*
 * ==========================================
 * Check Monitoring Availability For Server
 * ==========================================
 */
const checkServerAvailability = async (server) => {

    try {

        if (!server) {
            return false;
        }

        const query = `
            up{
                server="${server}"
            }
        `;

        const result = await queryPrometheus(query);

        if (!result || result.length === 0) {
            return false;
        }

        return result.some(
            (item) =>
                item.value &&
                Number(item.value[1]) === 1
        );

    } catch (error) {

        console.error(
            "Server Availability Check Error:",
            error.message
        );

        return false;
    }
};

module.exports = {
    queryPrometheus,
    queryPrometheusByServer,
    checkServerAvailability,
};