import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_URL =
  "http://localhost:5000/api/monitoring/summary";

const ENDPOINTS_URL =
  "http://localhost:5000/api/endpoints";


const getHealthStatus = (
  value,
  warning,
  critical
) => {
  if (value >= critical) {
    return {
      label: "CRITICAL",
      className: "critical",
    };
  }

  if (value >= warning) {
    return {
      label: "WARNING",
      className: "warning",
    };
  }

  return {
    label: "NORMAL",
    className: "normal",
  };
};


function App() {

  const [metrics, setMetrics] = useState(null);

  const [history, setHistory] = useState([]);

  const [endpoints, setEndpoints] = useState([]);

  const [selectedEndpoint, setSelectedEndpoint] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /*
   * ==========================================
   * FETCH MONITORING METRICS
   * ==========================================
   */

  const fetchMetrics = async () => {

    try {

      setError("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        API_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        response.data.data;

      setMetrics(data);


      const historyRecord = {

        time:
          new Date().toLocaleTimeString(),

        cpu:
          Number(data.cpu),

        memory:
          Number(data.memory),

        disk:
          Number(data.disk),

        receive:
          Number(
            data.network.receive
          ),

        send:
          Number(
            data.network.send
          ),
      };


      setHistory(
        (previousHistory) => {

          const updatedHistory = [
            ...previousHistory,
            historyRecord,
          ];

          return updatedHistory.slice(-30);

        }
      );

    } catch (err) {

      console.error(
        "Monitoring API Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to fetch monitoring data."
      );

    } finally {

      setLoading(false);

    }

  };


  /*
   * ==========================================
   * FETCH ENDPOINTS
   * ==========================================
   */

  const fetchEndpoints = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        ENDPOINTS_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const endpointData =
        response.data.data || [];

      setEndpoints(endpointData);


      /*
       * Automatically select the first
       * endpoint if none is selected.
       */

      if (
        endpointData.length > 0 &&
        !selectedEndpoint
      ) {

        setSelectedEndpoint(
          endpointData[0]
        );

      }

    } catch (err) {

      console.error(
        "Endpoint API Error:",
        err
      );

      setEndpoints([]);

    }

  };


  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {

    fetchMetrics();

    fetchEndpoints();


    const interval =
      setInterval(
        fetchMetrics,
        10000
      );


    return () =>
      clearInterval(interval);

  }, []);


  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {

    return (

      <div className="app">

        <div className="loading">

          Loading CloudWatchX Monitoring...

        </div>

      </div>

    );

  }


  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {

    return (

      <div className="app">

        <div className="dashboard">

          <h1>
            CloudWatchX
          </h1>

          <div className="error-card">

            <h2>
              Unable to Load Monitoring Data
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={fetchMetrics}
            >
              Retry
            </button>

          </div>

        </div>

      </div>

    );

  }


  /*
   * ==========================================
   * HEALTH STATUS
   * ==========================================
   */

  const cpuStatus =
    getHealthStatus(
      metrics.cpu,
      70,
      85
    );

  const memoryStatus =
    getHealthStatus(
      metrics.memory,
      75,
      85
    );

  const diskStatus =
    getHealthStatus(
      metrics.disk,
      80,
      90
    );


  /*
   * ==========================================
   * DASHBOARD
   * ==========================================
   */

  return (

    <div className="app">


      {/* HEADER */}

      <header className="header">

        <div>

          <h1>
            CloudWatchX
          </h1>

          <p>
            Infrastructure Monitoring Dashboard
          </p>

        </div>


        <div className="status">

          <span
            className="status-dot"
          ></span>

          System Monitoring Active

        </div>

      </header>


      <main className="dashboard">


        {/* SYSTEM OVERVIEW */}

        <div className="section-title">

          <h2>
            System Overview
          </h2>

          <button
            onClick={fetchMetrics}
          >
            Refresh
          </button>

        </div>


        {/* METRIC CARDS */}

        <div className="metrics-grid">


          {/* CPU */}

          <div className="metric-card">

            <div className="metric-header">

              <span>
                CPU Usage
              </span>

              <span className="metric-icon">
                CPU
              </span>

            </div>

            <div className="metric-value">

              {Number(
                metrics.cpu
              ).toFixed(2)}
              %

            </div>

            <div className="progress">

              <div
                className={`progress-bar ${cpuStatus.className}`}
                style={{
                  width: `${Math.min(
                    metrics.cpu,
                    100
                  )}%`,
                }}
              ></div>

            </div>

            <div className="metric-status">

              <span
                className={`health-badge ${cpuStatus.className}`}
              >
                {cpuStatus.label}
              </span>

            </div>

            <p>
              Processor utilization
            </p>

          </div>


          {/* MEMORY */}

          <div className="metric-card">

            <div className="metric-header">

              <span>
                Memory Usage
              </span>

              <span className="metric-icon">
                RAM
              </span>

            </div>

            <div className="metric-value">

              {Number(
                metrics.memory
              ).toFixed(2)}
              %

            </div>

            <div className="progress">

              <div
                className={`progress-bar ${memoryStatus.className}`}
                style={{
                  width: `${Math.min(
                    metrics.memory,
                    100
                  )}%`,
                }}
              ></div>

            </div>

            <div className="metric-status">

              <span
                className={`health-badge ${memoryStatus.className}`}
              >
                {memoryStatus.label}
              </span>

            </div>

            <p>
              Physical memory utilization
            </p>

          </div>


          {/* DISK */}

          <div className="metric-card">

            <div className="metric-header">

              <span>
                Disk Usage
              </span>

              <span className="metric-icon">
                DISK
              </span>

            </div>

            <div className="metric-value">

              {Number(
                metrics.disk
              ).toFixed(2)}
              %

            </div>

            <div className="progress">

              <div
                className={`progress-bar ${diskStatus.className}`}
                style={{
                  width: `${Math.min(
                    metrics.disk,
                    100
                  )}%`,
                }}
              ></div>

            </div>

            <div className="metric-status">

              <span
                className={`health-badge ${diskStatus.className}`}
              >
                {diskStatus.label}
              </span>

            </div>

            <p>
              C: drive utilization
            </p>

          </div>


          {/* UPTIME */}

          <div className="metric-card">

            <div className="metric-header">

              <span>
                System Uptime
              </span>

              <span className="metric-icon">
                UP
              </span>

            </div>

            <div className="uptime-value">

              {metrics.uptime.days}d{" "}
              {metrics.uptime.hours}h{" "}
              {metrics.uptime.minutes}m

            </div>

            <div className="metric-status">

              <span className="health-badge normal">
                ONLINE
              </span>

            </div>

            <p>
              Current system uptime
            </p>

          </div>

        </div>


        {/* NETWORK */}

        <section className="network-card">

          <div className="network-header">

            <div>

              <h2>
                Network Traffic
              </h2>

              <p>
                {metrics.network.interface}
              </p>

            </div>

            <span className="network-status">
              ACTIVE
            </span>

          </div>

          <div className="network-grid">

            <div className="network-item">

              <span className="network-label">
                ↓ Receive
              </span>

              <strong>

                {Number(
                  metrics.network.receive
                ).toFixed(2)}

              </strong>

              <small>
                bytes/sec
              </small>

            </div>


            <div className="network-item">

              <span className="network-label">
                ↑ Send
              </span>

              <strong>

                {Number(
                  metrics.network.send
                ).toFixed(2)}

              </strong>

              <small>
                bytes/sec
              </small>

            </div>

          </div>

        </section>


        {/* MONITORING HISTORY */}

        <section className="charts-section">

          <div className="charts-header">

            <div>

              <h2>
                Monitoring History
              </h2>

              <p>
                Recent system resource usage
              </p>

            </div>

            <span className="history-info">
              Last 5 minutes
            </span>

          </div>


          {/* CPU */}

          <div className="chart-card">

            <h3>
              CPU Usage
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#263247"
                />

                <XAxis
                  dataKey="time"
                  stroke="#8fa3bf"
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#8fa3bf"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>


          {/* MEMORY */}

          <div className="chart-card">

            <h3>
              Memory Usage
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#263247"
                />

                <XAxis
                  dataKey="time"
                  stroke="#8fa3bf"
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#8fa3bf"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>


          {/* DISK */}

          <div className="chart-card">

            <h3>
              Disk Usage
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#263247"
                />

                <XAxis
                  dataKey="time"
                  stroke="#8fa3bf"
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#8fa3bf"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="disk"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>


          {/* NETWORK */}

          <div className="chart-card">

            <h3>
              Network Traffic
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#263247"
                />

                <XAxis
                  dataKey="time"
                  stroke="#8fa3bf"
                />

                <YAxis
                  stroke="#8fa3bf"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="receive"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                  name="Receive"
                />

                <Line
                  type="monotone"
                  dataKey="send"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  dot={false}
                  name="Send"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* =====================================
            SELECTED SERVER
        ====================================== */}

        <section className="selected-server-section">

          <div className="selected-server-header">

            <div>

              <h2>
                Selected Server
              </h2>

              <p>
                Currently selected monitoring endpoint
              </p>

            </div>

          </div>


          {selectedEndpoint ? (

            <div className="selected-server-card">

              <div>

                <h3>
                  {selectedEndpoint.serverName}
                </h3>

                <span>
                  {selectedEndpoint.ipAddress}
                </span>

              </div>


              <div className="selected-server-details">

                <div>

                  <span>
                    Operating System
                  </span>

                  <strong>
                    {selectedEndpoint.operatingSystem || "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    Cloud Provider
                  </span>

                  <strong>
                    {selectedEndpoint.cloudProvider || "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    Region
                  </span>

                  <strong>
                    {selectedEndpoint.region || "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    Instance Type
                  </span>

                  <strong>
                    {selectedEndpoint.instanceType || "N/A"}
                  </strong>

                </div>

              </div>

            </div>

          ) : (

            <div className="no-servers">
              No server selected.
            </div>

          )}

        </section>


        {/* =====================================
            MONITORED SERVERS
        ====================================== */}

        <section className="servers-section">

          <div className="servers-header">

            <div>

              <h2>
                Monitored Servers
              </h2>

              <p>
                Infrastructure endpoints registered in CloudWatchX
              </p>

            </div>

            <span className="server-count">

              {endpoints.length}{" "}

              {endpoints.length === 1
                ? "Server"
                : "Servers"}

            </span>

          </div>


          <div className="servers-grid">

            {endpoints.length === 0 ? (

              <div className="no-servers">

                No monitoring endpoints available.

              </div>

            ) : (

              endpoints.map(
                (server) => {

                  const serverStatus =
                    String(
                      server.status || ""
                    ).toLowerCase();

                  const isOnline =
                    serverStatus === "online";

                  const isSelected =
                    selectedEndpoint?._id ===
                    server._id;


                  return (

                    <div
                      className={`server-card ${
                        isSelected
                          ? "server-card-selected"
                          : ""
                      }`}
                      key={
                        server._id ||
                        server.id ||
                        server.ipAddress
                      }
                    >

                      <div className="server-card-header">

                        <div>

                          <h3>
                            {
                              server.serverName ||
                              "Unnamed Server"
                            }
                          </h3>

                          <span className="server-ip">

                            {
                              server.ipAddress ||
                              "IP not available"
                            }

                          </span>

                        </div>


                        <span
                          className={`server-status ${
                            isOnline
                              ? "online"
                              : "offline"
                          }`}
                        >

                          {
                            server.status ||
                            "Unknown"
                          }

                        </span>

                      </div>


                      <div className="server-details">

                        <div>

                          <span>
                            Operating System
                          </span>

                          <strong>
                            {
                              server.operatingSystem ||
                              "N/A"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Cloud Provider
                          </span>

                          <strong>
                            {
                              server.cloudProvider ||
                              "N/A"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Region
                          </span>

                          <strong>
                            {
                              server.region ||
                              "N/A"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Instance Type
                          </span>

                          <strong>
                            {
                              server.instanceType ||
                              "N/A"
                            }
                          </strong>

                        </div>

                      </div>


                      {/* SELECT SERVER BUTTON */}

                      <button
                        className={`select-server-button ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedEndpoint(server)
                        }
                      >

                        {isSelected
                          ? "✓ Selected Server"
                          : "Select Server"}

                      </button>

                    </div>

                  );

                }
              )

            )}

          </div>

        </section>


        {/* =====================================
            MONITORING INFORMATION
        ====================================== */}

        <section className="info-card">

          <div>

            <span>
              Monitoring Status
            </span>

            <strong className="online-text">
              Active
            </strong>

          </div>


          <div>

            <span>
              Refresh Interval
            </span>

            <strong>
              10 seconds
            </strong>

          </div>


          <div>

            <span>
              History Samples
            </span>

            <strong>
              {history.length}
            </strong>

          </div>


          <div>

            <span>
              Selected Server
            </span>

            <strong>
              {selectedEndpoint
                ? selectedEndpoint.serverName
                : "None"}
            </strong>

          </div>


          <div>

            <span>
              Data Source
            </span>

            <strong>
              Prometheus
            </strong>

          </div>


          <div>

            <span>
              Exporter
            </span>

            <strong>
              Windows Exporter
            </strong>

          </div>

        </section>

      </main>

    </div>

  );
}


export default App;