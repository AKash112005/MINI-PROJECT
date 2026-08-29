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


module.exports = {
    queryPrometheus,
    queryPrometheusByServer,
};