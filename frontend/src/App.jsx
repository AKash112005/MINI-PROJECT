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


// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL =
  "http://localhost:5000/api/monitoring/summary";

const ENDPOINTS_URL =
  "http://localhost:5000/api/endpoints";

const ALERTS_URL =
  "http://localhost:5000/api/alerts";

const HISTORY_URL =
  "http://localhost:5000/api/monitoring-history";


// =====================================================
// HEALTH STATUS
// =====================================================

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


// =====================================================
// FORMAT TIME
// =====================================================

const formatAlertTime = (date) => {

  if (!date) {
    return "Unknown time";
  }

  return new Date(date).toLocaleString();
};


// =====================================================
// APPLICATION
// =====================================================

function App() {

  const [metrics, setMetrics] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [endpoints, setEndpoints] =
    useState([]);

  const [selectedEndpoint, setSelectedEndpoint] =
    useState(null);

  const [alerts, setAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [alertLoading, setAlertLoading] =
    useState(false);


  // ===================================================
  // FETCH MONITORING METRICS
  // ===================================================

  const fetchMetrics = async (
    serverOverride = null
  ) => {

    try {

      setError("");

      const token =
        localStorage.getItem("token");

      const server =
        serverOverride ||
        selectedEndpoint?.serverName;


      if (!server) {

        setMetrics(null);

        setError(
          "Please select a monitoring server."
        );

        setLoading(false);

        return;
      }


      const response =
        await axios.get(
          API_URL,
          {
            params: {
              server,
            },

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        response.data.data;


      if (!data) {

        setMetrics(null);

        setError(
          `Monitoring data is unavailable for server: ${server}`
        );

        return;
      }


      // -----------------------------------------------
      // SET CURRENT METRICS
      // -----------------------------------------------

      setMetrics(data);


      // -----------------------------------------------
      // UPDATE TIME
      // -----------------------------------------------

      setLastUpdated(
        new Date()
      );

    } catch (err) {

      console.error(
        "Monitoring API Error:",
        err
      );


      setMetrics(null);


      setError(
        err.response?.data?.message ||
        "Unable to fetch monitoring data."
      );


    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // FETCH PERSISTENT MONITORING HISTORY
  // ===================================================

  const fetchHistory = async (
    serverOverride = null
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      const server =
        serverOverride ||
        selectedEndpoint?.serverName;


      if (!server) {

        setHistory([]);

        return;

      }


      const response =
        await axios.get(
          HISTORY_URL,
          {
            params: {
              server,
            },

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const historyData =
        response.data.data || [];


      // -----------------------------------------------
      // CONVERT MONGODB HISTORY TO CHART DATA
      // -----------------------------------------------

      const formattedHistory =
        historyData.map(
          (record) => ({

            time:
              record.recordedAt
                ? new Date(
                    record.recordedAt
                  ).toLocaleTimeString()
                : "--",

            cpu:
              Number(record.cpu || 0),

            memory:
              Number(record.memory || 0),

            disk:
              Number(record.disk || 0),

            receive:
              Number(
                record.networkReceive || 0
              ),

            send:
              Number(
                record.networkSend || 0
              ),

          })
        );


      // -----------------------------------------------
      // DISPLAY LATEST 30 RECORDS
      // -----------------------------------------------

      setHistory(
        formattedHistory.slice(-30)
      );


    } catch (err) {

      console.error(
        "Monitoring History API Error:",
        err
      );

      setHistory([]);

    }

  };


  // ===================================================
  // FETCH ENDPOINTS
  // ===================================================

  const fetchEndpoints = async () => {

    try {

      const token =
        localStorage.getItem("token");


      const response =
        await axios.get(
          ENDPOINTS_URL,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const endpointData =
        response.data.data || [];


      setEndpoints(
        endpointData
      );


      // -----------------------------------------------
      // KEEP CURRENT SERVER SELECTED
      // -----------------------------------------------

      setSelectedEndpoint(
        (currentSelected) => {

          if (currentSelected) {

            const stillExists =
              endpointData.find(
                (endpoint) =>
                  endpoint._id ===
                  currentSelected._id
              );


            if (stillExists) {

              return stillExists;

            }

          }


          if (
            endpointData.length > 0
          ) {

            return endpointData[0];

          }


          return null;

        }
      );


    } catch (err) {

      console.error(
        "Endpoint API Error:",
        err
      );

      setEndpoints([]);

      setError(
        "Unable to load monitoring endpoints."
      );

    }

  };


  // ===================================================
  // FETCH ACTIVE ALERTS
  // ===================================================

  const fetchAlerts = async (
    serverOverride = null
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      const server =
        serverOverride ||
        selectedEndpoint?.serverName;


      if (!server) {

        setAlerts([]);

        return;

      }


      setAlertLoading(true);


      const response =
        await axios.get(
          `${ALERTS_URL}/active`,
          {
            params: {
              server,
            },

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setAlerts(
        response.data.data || []
      );


    } catch (err) {

      console.error(
        "Alert API Error:",
        err
      );

      setAlerts([]);

    } finally {

      setAlertLoading(false);

    }

  };


  // ===================================================
  // RESOLVE ALERT
  // ===================================================

  const resolveAlert = async (
    alertId
  ) => {

    try {

      const token =
        localStorage.getItem("token");


      await axios.put(
        `${ALERTS_URL}/${alertId}/resolve`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      fetchAlerts();


    } catch (err) {

      console.error(
        "Resolve Alert Error:",
        err
      );

    }

  };


  // ===================================================
  // INITIAL LOAD + ENDPOINT REFRESH
  // ===================================================

  useEffect(() => {

    fetchEndpoints();


    const endpointInterval =
      setInterval(
        () => {

          fetchEndpoints();

        },
        30000
      );


    return () =>
      clearInterval(
        endpointInterval
      );

  }, []);


  // ===================================================
  // SERVER SELECTION
  // ===================================================

  useEffect(() => {

    if (!selectedEndpoint) {
      return;
    }


    // Clear previous server data

    setHistory([]);

    setMetrics(null);

    setAlerts([]);

    setError("");


    const server =
      selectedEndpoint.serverName;


    // -----------------------------------------------
    // INITIAL DATA
    // -----------------------------------------------

    fetchMetrics(server);

    fetchHistory(server);

    fetchAlerts(server);


    // -----------------------------------------------
    // METRICS REFRESH — 10 SECONDS
    // -----------------------------------------------

    const metricInterval =
      setInterval(
        () => {

          fetchMetrics(server);

        },
        10000
      );


    // -----------------------------------------------
    // ALERTS REFRESH — 10 SECONDS
    // -----------------------------------------------

    const alertInterval =
      setInterval(
        () => {

          fetchAlerts(server);

        },
        10000
      );


    // -----------------------------------------------
    // HISTORY REFRESH — 10 SECONDS
    // -----------------------------------------------

    const historyInterval =
      setInterval(
        () => {

          fetchHistory(server);

        },
        10000
      );


    return () => {

      clearInterval(
        metricInterval
      );

      clearInterval(
        alertInterval
      );

      clearInterval(
        historyInterval
      );

    };

  }, [selectedEndpoint]);


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <div className="app">

        <div className="loading">

          <div className="loading-logo">
            CWX
          </div>

          <h2>
            CloudWatchX
          </h2>

          <p>
            Loading infrastructure monitoring...
          </p>

        </div>

      </div>

    );

  }


  // ===================================================
  // HEALTH STATUS
  // ===================================================

  const cpuStatus =
    metrics
      ? getHealthStatus(
          metrics.cpu,
          70,
          85
        )
      : null;


  const memoryStatus =
    metrics
      ? getHealthStatus(
          metrics.memory,
          75,
          85
        )
      : null;


  const diskStatus =
    metrics
      ? getHealthStatus(
          metrics.disk,
          80,
          90
        )
      : null;


  // ===================================================
  // SERVER COUNTS
  // ===================================================

  const onlineServers =
    endpoints.filter(
      (server) =>
        String(
          server.status || ""
        ).toLowerCase() === "online"
    ).length;


  const offlineServers =
    endpoints.length -
    onlineServers;


  // ===================================================
  // ALERT COUNTS
  // ===================================================

  const criticalAlerts =
    alerts.filter(
      (alert) =>
        alert.severity === "Critical"
    ).length;


  const warningAlerts =
    alerts.filter(
      (alert) =>
        alert.severity === "Warning"
    ).length;


  // ===================================================
  // DASHBOARD
  // ===================================================

  return (

    <div className="app">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="brand">

          <div className="brand-logo">
            CWX
          </div>

          <div>

            <h1>
              CloudWatchX
            </h1>

            <p>
              Infrastructure Monitoring Platform
            </p>

          </div>

        </div>


        <div className="header-live">

          <span className="live-dot"></span>

          <span>
            Monitoring Live
          </span>

        </div>

      </header>


      <main className="dashboard">


        {/* =================================================
            TOP OVERVIEW
        ================================================= */}

        <section className="dashboard-intro">

          <div>

            <span className="eyebrow">
              INFRASTRUCTURE OVERVIEW
            </span>

            <h2>
              System Monitoring
            </h2>

            <p>
              Real-time visibility into your
              monitored infrastructure.
            </p>

          </div>


          <div className="selected-server-pill">

            <span className="pill-dot"></span>

            <div>

              <small>
                MONITORING SERVER
              </small>

              <strong>
                {
                  selectedEndpoint?.serverName ||
                  "No server selected"
                }
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            INFRASTRUCTURE KPI OVERVIEW
        ================================================= */}

        <section className="kpi-section">

          <div className="kpi-card">

            <div className="kpi-icon">
              SVR
            </div>

            <div className="kpi-content">

              <span className="kpi-label">
                TOTAL SERVERS
              </span>

              <strong>
                {endpoints.length}
              </strong>

              <p>
                Registered endpoints
              </p>

            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-icon">
              ON
            </div>

            <div className="kpi-content">

              <span className="kpi-label">
                ONLINE SERVERS
              </span>

              <strong>
                {onlineServers}
              </strong>

              <p>
                Currently available
              </p>

            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-icon">
              OFF
            </div>

            <div className="kpi-content">

              <span className="kpi-label">
                OFFLINE SERVERS
              </span>

              <strong>
                {offlineServers}
              </strong>

              <p>
                Currently unavailable
              </p>

            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-icon">
              ALT
            </div>

            <div className="kpi-content">

              <span className="kpi-label">
                ACTIVE ALERTS
              </span>

              <strong>
                {alerts.length}
              </strong>

              <p>
                Requiring attention
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="monitoring-error">

            <div>

              <strong>
                Monitoring data unavailable
              </strong>

              <p>
                {error}
              </p>

            </div>


            <button
              onClick={() =>
                fetchMetrics()
              }
            >
              Retry
            </button>

          </div>

        )}


        {/* =================================================
            METRIC CARDS
        ================================================= */}

        <section>

          <div className="section-heading">

            <div>

              <span className="section-label">
                RESOURCE HEALTH
              </span>

              <h2>
                Current Performance
              </h2>

            </div>


            {/* =================================================
                LIVE MONITORING STATUS
            ================================================= */}

            <div className="last-updated">

              <span></span>

              <div>

                <strong>
                  LIVE MONITORING
                </strong>

                <small>
                  Last updated:{" "}
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString()
                    : "--"}
                </small>

              </div>

            </div>

          </div>


          <div className="metrics-grid">


            {/* =================================================
                CPU
            ================================================= */}

            <div className="metric-card">

              <div className="metric-top">

                <div>

                  <span className="metric-label">
                    CPU USAGE
                  </span>

                  <h3>
                    Processor
                  </h3>

                </div>

                <div className="metric-icon">
                  CPU
                </div>

              </div>


              <div className="metric-main">

                <strong>

                  {metrics
                    ? `${Number(
                        metrics.cpu
                      ).toFixed(2)}%`
                    : "--"}

                </strong>


                {cpuStatus && (

                  <span
                    className={`health-badge ${cpuStatus.className}`}
                  >
                    {cpuStatus.label}
                  </span>

                )}

              </div>


              <div className="progress">

                <div
                  className={`progress-bar ${
                    cpuStatus?.className || ""
                  }`}
                  style={{
                    width:
                      `${Math.min(
                        metrics?.cpu || 0,
                        100
                      )}%`,
                  }}
                ></div>

              </div>


              <p>
                Processor utilization
              </p>

            </div>


            {/* =================================================
                MEMORY
            ================================================= */}

            <div className="metric-card">

              <div className="metric-top">

                <div>

                  <span className="metric-label">
                    MEMORY USAGE
                  </span>

                  <h3>
                    Physical Memory
                  </h3>

                </div>

                <div className="metric-icon">
                  RAM
                </div>

              </div>


              <div className="metric-main">

                <strong>

                  {metrics
                    ? `${Number(
                        metrics.memory
                      ).toFixed(2)}%`
                    : "--"}

                </strong>


                {memoryStatus && (

                  <span
                    className={`health-badge ${memoryStatus.className}`}
                  >
                    {memoryStatus.label}
                  </span>

                )}

              </div>


              <div className="progress">

                <div
                  className={`progress-bar ${
                    memoryStatus?.className || ""
                  }`}
                  style={{
                    width:
                      `${Math.min(
                        metrics?.memory || 0,
                        100
                      )}%`,
                  }}
                ></div>

              </div>


              <p>
                Physical memory utilization
              </p>

            </div>


            {/* =================================================
                DISK
            ================================================= */}

            <div className="metric-card">

              <div className="metric-top">

                <div>

                  <span className="metric-label">
                    DISK USAGE
                  </span>

                  <h3>
                    C: Drive
                  </h3>

                </div>

                <div className="metric-icon">
                  DISK
                </div>

              </div>


              <div className="metric-main">

                <strong>

                  {metrics
                    ? `${Number(
                        metrics.disk
                      ).toFixed(2)}%`
                    : "--"}

                </strong>


                {diskStatus && (

                  <span
                    className={`health-badge ${diskStatus.className}`}
                  >
                    {diskStatus.label}
                  </span>

                )}

              </div>


              <div className="progress">

                <div
                  className={`progress-bar ${
                    diskStatus?.className || ""
                  }`}
                  style={{
                    width:
                      `${Math.min(
                        metrics?.disk || 0,
                        100
                      )}%`,
                  }}
                ></div>

              </div>


              <p>
                Storage utilization
              </p>

            </div>


            {/* =================================================
                UPTIME
            ================================================= */}

            <div className="metric-card">

              <div className="metric-top">

                <div>

                  <span className="metric-label">
                    SYSTEM UPTIME
                  </span>

                  <h3>
                    Availability
                  </h3>

                </div>

                <div className="metric-icon">
                  UP
                </div>

              </div>


              <div className="uptime-value">

                {metrics?.uptime
                  ? `${metrics.uptime.days}d ${metrics.uptime.hours}h ${metrics.uptime.minutes}m`
                  : "--"}

              </div>


              <div className="metric-main">

                <span className="health-badge normal">
                  ONLINE
                </span>

              </div>


              <p>
                Current system uptime
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            ALERTS
        ================================================= */}

        <section className="alerts-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                ATTENTION REQUIRED
              </span>

              <h2>
                Active Alerts
              </h2>

            </div>


            <div className="alert-count">

              <span>
                {alerts.length} Active
              </span>

              <span>
                {criticalAlerts} Critical
              </span>

              <span>
                {warningAlerts} Warning
              </span>

            </div>

          </div>


          {alertLoading ? (

            <div className="alerts-empty">
              Loading alerts...
            </div>

          ) : alerts.length === 0 ? (

            <div className="alerts-empty success-alert">

              <div className="success-icon">
                ✓
              </div>

              <div>

                <strong>
                  No active alerts
                </strong>

                <p>
                  All monitored resources are currently
                  within acceptable thresholds.
                </p>

              </div>

            </div>

          ) : (

            <div className="alerts-list">

              {alerts.map(
                (alert) => (

                  <div
                    className={`alert-card ${String(
                      alert.severity || ""
                    ).toLowerCase()}`}
                    key={alert._id}
                  >

                    <div className="alert-severity">

                      <span className="alert-indicator"></span>

                      <strong>
                        {alert.severity}
                      </strong>

                    </div>


                    <div className="alert-content">

                      <div className="alert-title-row">

                        <h3>
                          {alert.metric} Usage
                        </h3>

                        <strong className="alert-value">

                          {Number(
                            alert.value
                          ).toFixed(2)}
                          %

                        </strong>

                      </div>


                      <p>
                        {alert.message}
                      </p>


                      <div className="alert-meta">

                        <span>

                          Server:
                          {" "}

                          <strong>
                            {alert.serverName}
                          </strong>

                        </span>


                        <span>

                          {formatAlertTime(
                            alert.createdAt
                          )}

                        </span>

                      </div>

                    </div>


                    <button
                      className="resolve-button"
                      onClick={() =>
                        resolveAlert(
                          alert._id
                        )
                      }
                    >
                      Resolve
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            NETWORK
        ================================================= */}

        <section className="network-card">

          <div className="network-header">

            <div>

              <span className="section-label">
                NETWORK
              </span>

              <h2>
                Network Traffic
              </h2>

              <p>
                {
                  metrics?.network?.interface ||
                  "Network interface unavailable"
                }
              </p>

            </div>


            <span
              className={`network-status ${
                metrics
                  ? "active"
                  : "inactive"
              }`}
            >

              {metrics
                ? "ACTIVE"
                : "UNAVAILABLE"}

            </span>

          </div>


          <div className="network-grid">

            <div className="network-item">

              <span className="network-label">
                ↓ Receive
              </span>

              <strong>

                {metrics
                  ? Number(
                      metrics.network?.receive || 0
                    ).toFixed(2)
                  : "--"}

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

                {metrics
                  ? Number(
                      metrics.network?.send || 0
                    ).toFixed(2)
                  : "--"}

              </strong>

              <small>
                bytes/sec
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            HISTORY
        ================================================= */}

        <section className="charts-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                PERFORMANCE TRENDS
              </span>

              <h2>
                Monitoring History
              </h2>

              <p>
                Persistent system resource performance
              </p>

            </div>


            <span className="history-info">
              Last {history.length} samples
            </span>

          </div>


          {/* =================================================
              CPU HISTORY
          ================================================= */}

          <div className="chart-card">

            <div className="chart-title">

              <div>

                <h3>
                  CPU Usage
                </h3>

                <p>
                  Processor utilization over time
                </p>

              </div>

            </div>


            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="time"
                />

                <YAxis
                  domain={[0, 100]}
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


          {/* =================================================
              MEMORY HISTORY
          ================================================= */}

          <div className="chart-card">

            <div className="chart-title">

              <div>

                <h3>
                  Memory Usage
                </h3>

                <p>
                  Physical memory utilization over time
                </p>

              </div>

            </div>


            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="time"
                />

                <YAxis
                  domain={[0, 100]}
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


          {/* =================================================
              DISK HISTORY
          ================================================= */}

          <div className="chart-card">

            <div className="chart-title">

              <div>

                <h3>
                  Disk Usage
                </h3>

                <p>
                  C: drive utilization over time
                </p>

              </div>

            </div>


            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="time"
                />

                <YAxis
                  domain={[0, 100]}
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


          {/* =================================================
              NETWORK HISTORY
          ================================================= */}

          <div className="chart-card">

            <div className="chart-title">

              <div>

                <h3>
                  Network Traffic
                </h3>

                <p>
                  Receive and send traffic
                </p>

              </div>

            </div>


            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <LineChart
                data={history}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="time"
                />

                <YAxis />

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


        {/* =================================================
            INFRASTRUCTURE
        ================================================= */}

        <section className="servers-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                INFRASTRUCTURE
              </span>

              <h2>
                Monitored Servers
              </h2>

              <p>
                Registered infrastructure endpoints
              </p>

            </div>


            <div className="server-summary">

              <span>

                <i className="online-dot"></i>

                {onlineServers} Online

              </span>


              <span>

                <i className="offline-dot"></i>

                {offlineServers} Offline

              </span>

            </div>

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

                        <div className="server-name">

                          <div
                            className={`server-icon ${
                              isOnline
                                ? "online"
                                : "offline"
                            }`}
                          >

                            {isOnline
                              ? "●"
                              : "○"}

                          </div>


                          <div>

                            <h3>

                              {
                                server.serverName ||
                                "Unnamed Server"
                              }

                            </h3>


                            <span>

                              {
                                server.ipAddress ||
                                "IP unavailable"
                              }

                            </span>

                          </div>

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
                            Provider
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


                      <button
                        className={`select-server-button ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {

                          setSelectedEndpoint(
                            server
                          );

                        }}
                      >

                        {isSelected
                          ? "✓ Monitoring Server"
                          : "View Monitoring"}

                      </button>

                    </div>

                  );

                }
              )

            )}

          </div>

        </section>


        {/* =================================================
            SELECTED SERVER DETAILS
        ================================================= */}

        {selectedEndpoint && (

          <section className="selected-server-section">

            <div className="selected-server-card">

              <div className="selected-server-main">

                <span className="section-label">
                  SELECTED ENDPOINT
                </span>

                <h2>
                  {selectedEndpoint.serverName}
                </h2>

                <p>
                  {selectedEndpoint.ipAddress}
                </p>

              </div>


              <div className="selected-server-details">

                <div>

                  <span>
                    Operating System
                  </span>

                  <strong>

                    {
                      selectedEndpoint.operatingSystem ||
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
                      selectedEndpoint.cloudProvider ||
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
                      selectedEndpoint.region ||
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
                      selectedEndpoint.instanceType ||
                      "N/A"
                    }

                  </strong>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            SYSTEM INFORMATION
        ================================================= */}

        <section className="info-card">

          <div>

            <span>
              Monitoring
            </span>

            <strong className="online-text">
              Active
            </strong>

          </div>


          <div>

            <span>
              Metric Refresh
            </span>

            <strong>
              10 seconds
            </strong>

          </div>


          <div>

            <span>
              Endpoint Refresh
            </span>

            <strong>
              30 seconds
            </strong>

          </div>


          <div>

            <span>
              History
            </span>

            <strong>
              {history.length} samples
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


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">

          <span>
            CloudWatchX Infrastructure Monitoring
          </span>

          <span>
            Prometheus • Windows Exporter
          </span>

        </footer>


      </main>

    </div>

  );

}


export default App;