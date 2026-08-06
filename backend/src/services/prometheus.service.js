const axios = require("axios");

const PROMETHEUS_URL = "http://localhost:9090";

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
        throw new Error("Unable to fetch Prometheus metrics.");
    }
};

module.exports = {
    queryPrometheus,
};