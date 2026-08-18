import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/monitoring/summary";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMetrics(response.data.data);
    } catch (err) {
      console.error("Monitoring API Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to fetch monitoring data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Refresh monitoring data every 10 seconds
    const interval = setInterval(fetchMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          Loading CloudWatchX Monitoring...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="dashboard">
          <h1>CloudWatchX</h1>

          <div className="error-card">
            <h2>Unable to Load Monitoring Data</h2>
            <p>{error}</p>

            <button onClick={fetchMetrics}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>CloudWatchX</h1>
          <p>Infrastructure Monitoring Dashboard</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Monitoring Active
        </div>
      </header>


      {/* Dashboard */}
      <main className="dashboard">

        <div className="section-title">
          <h2>System Overview</h2>
          <button onClick={fetchMetrics}>
            Refresh
          </button>
        </div>


        {/* Metric Cards */}
        <div className="metrics-grid">

          {/* CPU */}
          <div className="metric-card">
            <div className="metric-header">
              <span>CPU Usage</span>
              <span className="metric-icon">CPU</span>
            </div>

            <div className="metric-value">
              {metrics.cpu}%
            </div>

            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${Math.min(metrics.cpu, 100)}%` }}
              ></div>
            </div>

            <p>Processor utilization</p>
          </div>


          {/* Memory */}
          <div className="metric-card">
            <div className="metric-header">
              <span>Memory Usage</span>
              <span className="metric-icon">RAM</span>
            </div>

            <div className="metric-value">
              {metrics.memory}%
            </div>

            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${Math.min(metrics.memory, 100)}%` }}
              ></div>
            </div>

            <p>Physical memory utilization</p>
          </div>


          {/* Disk */}
          <div className="metric-card">
            <div className="metric-header">
              <span>Disk Usage</span>
              <span className="metric-icon">DISK</span>
            </div>

            <div className="metric-value">
              {metrics.disk}%
            </div>

            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${Math.min(metrics.disk, 100)}%` }}
              ></div>
            </div>

            <p>C: drive utilization</p>
          </div>


          {/* Uptime */}
          <div className="metric-card">
            <div className="metric-header">
              <span>System Uptime</span>
              <span className="metric-icon">UP</span>
            </div>

            <div className="uptime-value">
              {metrics.uptime.days}d{" "}
              {metrics.uptime.hours}h{" "}
              {metrics.uptime.minutes}m
            </div>

            <p>Current system uptime</p>
          </div>

        </div>


        {/* Network */}
        <section className="network-card">

          <div className="network-header">
            <div>
              <h2>Network Traffic</h2>
              <p>{metrics.network.interface}</p>
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
                {metrics.network.receive.toFixed(2)}
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
                {metrics.network.send.toFixed(2)}
              </strong>

              <small>
                bytes/sec
              </small>
            </div>

          </div>

        </section>


        {/* Monitoring Information */}
        <section className="info-card">

          <div>
            <span>Monitoring Status</span>
            <strong>Active</strong>
          </div>

          <div>
            <span>Refresh Interval</span>
            <strong>10 seconds</strong>
          </div>

          <div>
            <span>Data Source</span>
            <strong>Prometheus</strong>
          </div>

          <div>
            <span>Exporter</span>
            <strong>Windows Exporter</strong>
          </div>

        </section>

      </main>

    </div>
  );
}

export default App;