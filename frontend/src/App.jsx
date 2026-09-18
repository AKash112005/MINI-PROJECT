import { useEffect, useState, useRef } from "react";
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

const LOGIN_URL =
  "http://localhost:5000/api/auth/login";

const API_URL =
  "http://localhost:5000/api/monitoring/summary";

const ENDPOINTS_URL =
  "http://localhost:5000/api/endpoints";

const ALERTS_URL =
  "http://localhost:5000/api/alerts";

const HISTORY_URL =
  "http://localhost:5000/api/monitoring-history";


// =====================================================
// LOGIN PAGE
// =====================================================

function LoginPage({ onLogin }) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ===================================================
  // HANDLE LOGIN
  // ===================================================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");


    // -----------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------

    if (!email.trim() || !password) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      // -----------------------------------------------
      // LOGIN REQUEST
      // -----------------------------------------------

      const response =
        await axios.post(
          LOGIN_URL,
          {
            email: email.trim(),
            password,
          }
        );


      // -----------------------------------------------
      // GET LOGIN RESULT
      // -----------------------------------------------

      const result =
        response.data?.data;


      // -----------------------------------------------
      // VALIDATE TOKEN
      // -----------------------------------------------

      if (!result?.token) {

        throw new Error(
          "Login response did not contain a valid token."
        );

      }


      // -----------------------------------------------
      // STORE JWT
      // -----------------------------------------------

      localStorage.setItem(
        "token",
        result.token
      );


      // -----------------------------------------------
      // STORE USER INFORMATION
      // -----------------------------------------------

      if (result.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(
            result.user
          )
        );

      }


      // -----------------------------------------------
      // LOGIN SUCCESS
      // -----------------------------------------------

      onLogin(
        result.user || null
      );


    } catch (err) {

      console.error(
        "Login Error:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to login. Please check your credentials."
      );


    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // LOGIN UI
  // ===================================================

  return (

    <div className="login-page">

      <div className="login-background-glow"></div>


      <div className="login-card">


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">
          CWX
        </div>


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="login-header">

          <h1>
            CloudWatchX
          </h1>

          <p>
            Infrastructure Monitoring Platform
          </p>

        </div>


        <div className="login-divider"></div>


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >


          <div className="login-title">

            <span>
              SECURE ACCESS
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to access
              the monitoring dashboard.
            </p>

          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-group">

            <label htmlFor="login-email">
              Email Address
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>


            <div className="password-wrapper">

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword
                  ? "HIDE"
                  : "SHOW"}

              </button>

            </div>

          </div>


          {/* =================================================
              LOGIN ERROR
          ================================================= */}

          {error && (

            <div className="login-error">

              <span className="login-error-icon">
                !
              </span>


              <div>

                <strong>
                  Login failed
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading ? (

              <>
                <span className="login-spinner"></span>

                Signing in...
              </>

            ) : (

              "Sign In"

            )}

          </button>


        </form>


        {/* =================================================
            SECURITY INFORMATION
        ================================================= */}

        <div className="login-security">

          <span className="security-dot"></span>

          <span>
            JWT secured authentication
          </span>

        </div>


      </div>

    </div>

  );

}


// =====================================================
// HEALTH STATUS
// =====================================================

const getHealthStatus = (
  value,
  warning,
  critical
) => {

  const numericValue =
    Number(value);


  if (!Number.isFinite(numericValue)) {

    return {

      label: "UNAVAILABLE",

      className: "unavailable",

    };

  }


  if (numericValue >= critical) {

    return {

      label: "CRITICAL",

      className: "critical",

    };

  }


  if (numericValue >= warning) {

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


  return new Date(
    date
  ).toLocaleString();

};


// =====================================================
// APPLICATION
// =====================================================

function App() {


  // ===================================================
  // AUTHENTICATION STATE
  // ===================================================

  const [authenticated, setAuthenticated] =
    useState(
      Boolean(
        localStorage.getItem("token")
      )
    );


  const [loggedInUser, setLoggedInUser] =
    useState(() => {

      try {

        const storedUser =
          localStorage.getItem("user");


        return storedUser
          ? JSON.parse(storedUser)
          : null;

      } catch {

        return null;

      }

    });


  // ===================================================
  // LOGIN SUCCESS
  // ===================================================

  const handleLogin = (user) => {

    setLoggedInUser(user);

    setAuthenticated(true);

  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );


    setLoggedInUser(null);

    setAuthenticated(false);

  };


  // ===================================================
  // METRICS
  // ===================================================

  const [metrics, setMetrics] =
    useState(null);


  const metricsRequestRef =
    useRef(0);


  // ===================================================
  // HISTORY
  // ===================================================

  const [history, setHistory] =
    useState([]);


  const historyRequestRef =
    useRef(0);


  // ===================================================
  // ENDPOINTS
  // ===================================================

  const [endpoints, setEndpoints] =
    useState([]);


  const endpointsRequestRef =
    useRef(0);


  const [selectedEndpoint, setSelectedEndpoint] =
    useState(null);


  // ===================================================
  // ACTIVE SIDEBAR SECTION
  // ===================================================

  const [activeSection, setActiveSection] =
    useState("overview");


  // ===================================================
  // SIDEBAR NAVIGATION
  // ===================================================

  const navigateToSection = (sectionId) => {

    setActiveSection(sectionId);

    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  };


  // ===================================================
  // ALERTS
  // ===================================================

  const [alerts, setAlerts] =
    useState([]);


  const alertsRequestRef =
    useRef(0);


  // ===================================================
  // GENERAL STATE
  // ===================================================

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

    const requestId =
      ++metricsRequestRef.current;


    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const server =
        serverOverride ||
        selectedEndpoint?.serverName;


      if (!server) {

        if (
          requestId ===
          metricsRequestRef.current
        ) {

          setMetrics(null);

          setError(
            "Please select a monitoring server."
          );

          setLoading(false);

        }

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
        response.data?.data;


      // -----------------------------------------------
      // DEBUG
      // -----------------------------------------------

      console.log(
        "FRONTEND METRICS DATA:",
        data
      );


      if (!data) {

        if (
          requestId ===
          metricsRequestRef.current
        ) {

          setMetrics(null);

          setError(
            `Monitoring data is unavailable for server: ${server}`
          );

          setLastUpdated(null);

        }

        return;

      }


      // -----------------------------------------------
      // NORMALIZE METRICS
      // -----------------------------------------------

      const normalizedMetrics = {

        cpu:
          Number(
            data.cpu
          ),

        memory:
          Number(
            data.memory
          ),

        disk:
          Number(
            data.disk
          ),


        network: {

          interface:
            data.network?.interface ||
            "Network interface unavailable",

          receive:
            Number(
              data.network?.receive
            ),

          send:
            Number(
              data.network?.send
            ),

          unit:
            data.network?.unit ||
            "bytes/sec",

        },


        uptime: {

          days:
            Number(
              data.uptime?.days
            ),

          hours:
            Number(
              data.uptime?.hours
            ),

          minutes:
            Number(
              data.uptime?.minutes
            ),

          totalSeconds:
            Number(
              data.uptime?.totalSeconds
            ),

        },

      };


      // -----------------------------------------------
      // LATEST REQUEST CHECK
      // -----------------------------------------------

      if (
        requestId !==
        metricsRequestRef.current
      ) {

        return;

      }


      setMetrics(
        normalizedMetrics
      );


      setError("");


      setLastUpdated(
        new Date()
      );


    } catch (err) {

      console.error(
        "Monitoring API Error:",
        err
      );


      if (
        requestId ===
        metricsRequestRef.current
      ) {

        setMetrics(null);


        setError(
          err.response?.data?.message ||
          "Unable to fetch monitoring data."
        );


        setLastUpdated(null);

      }


    } finally {

      if (
        requestId ===
        metricsRequestRef.current
      ) {

        setLoading(false);

      }

    }

  };


  // ===================================================
  // FETCH MONITORING HISTORY
  // ===================================================

  const fetchHistory = async (
    serverOverride = null
  ) => {

    const requestId =
      ++historyRequestRef.current;


    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const server =
        serverOverride ||
        selectedEndpoint?.serverName;


      if (!server) {

        if (
          requestId ===
          historyRequestRef.current
        ) {

          setHistory([]);

        }

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
        response.data?.data ||
        [];


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
              Number(
                record.cpu ?? 0
              ),

            memory:
              Number(
                record.memory ?? 0
              ),

            disk:
              Number(
                record.disk ?? 0
              ),

            receive:
              Number(
                record.networkReceive ?? 0
              ),

            send:
              Number(
                record.networkSend ?? 0
              ),

          })
        );


      if (
        requestId ===
        historyRequestRef.current
      ) {

        setHistory(
          formattedHistory.slice(-30)
        );

      }


    } catch (err) {

      console.error(
        "Monitoring History API Error:",
        err
      );


      if (
        requestId ===
        historyRequestRef.current
      ) {

        setHistory([]);

      }

    }

  };


  // ===================================================
  // FETCH ENDPOINTS
  // ===================================================

  const fetchEndpoints = async () => {

    const requestId =
      ++endpointsRequestRef.current;


    try {

      const token =
        localStorage.getItem(
          "token"
        );


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
        response.data?.data ||
        [];


      if (
        requestId !==
        endpointsRequestRef.current
      ) {

        return;

      }


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


      if (
        requestId ===
        endpointsRequestRef.current
      ) {

        setEndpoints([]);

        setError(
          "Unable to load monitoring endpoints."
        );

      }

    }

  };


  // ===================================================
  // FETCH ACTIVE ALERTS
  // ===================================================

  const fetchAlerts = async (
    serverOverride = null
  ) => {

    const requestId =
      ++alertsRequestRef.current;


    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const server =
        serverOverride ||
        selectedEndpoint?.serverName;


      if (!server) {

        if (
          requestId ===
          alertsRequestRef.current
        ) {

          setAlerts([]);

        }

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


      if (
        requestId ===
        alertsRequestRef.current
      ) {

        setAlerts(
          response.data?.data ||
          []
        );

      }


    } catch (err) {

      console.error(
        "Alert API Error:",
        err
      );


      if (
        requestId ===
        alertsRequestRef.current
      ) {

        setAlerts([]);

      }


    } finally {

      if (
        requestId ===
        alertsRequestRef.current
      ) {

        setAlertLoading(false);

      }

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
        localStorage.getItem(
          "token"
        );


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


      fetchAlerts(
        selectedEndpoint?.serverName
      );


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

    if (!authenticated) {

      return;

    }


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

  }, [authenticated]);


  // ===================================================
  // SERVER SELECTION
  // ===================================================

  useEffect(() => {

    if (!authenticated) {

      return;

    }


    if (!selectedEndpoint) {

      return;

    }


    // -----------------------------------------------
    // INVALIDATE PREVIOUS REQUESTS
    // -----------------------------------------------

    ++metricsRequestRef.current;

    ++historyRequestRef.current;

    ++alertsRequestRef.current;


    // -----------------------------------------------
    // CLEAR PREVIOUS SERVER DATA
    // -----------------------------------------------

    setHistory([]);

    setMetrics(null);

    setAlerts([]);

    setError("");

    setLastUpdated(null);


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

  }, [
    authenticated,
    selectedEndpoint
  ]);


  // ===================================================
  // SIDEBAR ACTIVE SECTION TRACKING
  // ===================================================

  useEffect(() => {

    if (!authenticated) {
      return;
    }

    const sectionIds = [
      "overview",
      "performance",
      "network",
      "alerts",
      "history",
    ];

    const sections =
      sectionIds
        .map((id) =>
          document.getElementById(id)
        )
        .filter(Boolean);

    if (sections.length === 0) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {

          const visibleSections =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  a.boundingClientRect.top -
                  b.boundingClientRect.top
              );

          if (
            visibleSections.length > 0
          ) {

            setActiveSection(
              visibleSections[0].target.id
            );

          }

        },
        {
          root: null,
          rootMargin:
            "-110px 0px -55% 0px",
          threshold: 0,
        }
      );

    sections.forEach(
      (section) =>
        observer.observe(section)
    );

    return () => {
      observer.disconnect();
    };

  }, [authenticated]);



  // ===================================================
  // AUTHENTICATION UI
  // ===================================================

  if (!authenticated) {

    return (

      <LoginPage
        onLogin={handleLogin}
      />

    );

  }


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
        alert.severity ===
        "Critical"
    ).length;


  const warningAlerts =
    alerts.filter(
      (alert) =>
        alert.severity ===
        "Warning"
    ).length;


  // ===================================================
  // DASHBOARD
  // ===================================================

  return (

    <div className="app">



      {/* =================================================
          PREMIUM SIDEBAR
      ================================================= */}

      <aside className="cloudwatch-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            CWX
          </div>

          <div>
            <strong>CloudWatchX</strong>
            <span>Infrastructure</span>
          </div>

        </div>


        <div className="sidebar-group">

          <span className="sidebar-group-title">
            MONITORING
          </span>


          <button
            className={`sidebar-nav-item ${
              activeSection === "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateToSection("overview")
            }
          >
            <span className="sidebar-nav-icon">◉</span>
            <span>Overview</span>
          </button>


          <button
            className={`sidebar-nav-item ${
              activeSection === "performance"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateToSection("performance")
            }
          >
            <span className="sidebar-nav-icon">◫</span>
            <span>Performance</span>
          </button>


          <button
            className={`sidebar-nav-item ${
              activeSection === "network"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateToSection("network")
            }
          >
            <span className="sidebar-nav-icon">⇅</span>
            <span>Network</span>
          </button>


          <button
            className={`sidebar-nav-item ${
              activeSection === "alerts"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateToSection("alerts")
            }
          >
            <span className="sidebar-nav-icon">!</span>
            <span>Alerts</span>

            {alerts.length > 0 && (
              <span className="sidebar-alert-count">
                {alerts.length}
              </span>
            )}

          </button>


          <button
            className={`sidebar-nav-item ${
              activeSection === "history"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateToSection("history")
            }
          >
            <span className="sidebar-nav-icon">◒</span>
            <span>History</span>
          </button>

        </div>


        <div className="sidebar-group sidebar-servers">

          <div className="sidebar-server-heading">

            <span className="sidebar-group-title">
              MONITORED SERVERS
            </span>

            <span className="sidebar-server-total">
              {endpoints.length}
            </span>

          </div>


          <div className="sidebar-server-list">

            {endpoints.length === 0 ? (

              <div className="sidebar-empty">
                No servers
              </div>

            ) : (

              endpoints.map((server) => {

                const isOnline =
                  String(
                    server.status || ""
                  ).toLowerCase() === "online";

                const isSelected =
                  selectedEndpoint?._id === server._id;

                return (

                  <button
                    key={
                      server._id ||
                      server.id ||
                      server.ipAddress
                    }
                    className={`sidebar-server-item ${
                      isSelected ? "selected" : ""
                    }`}
                    title={`Monitor ${server.serverName || "server"}`}
                    onClick={() => {

                      setSelectedEndpoint(server);

                      setActiveSection(
                        "performance"
                      );

                      requestAnimationFrame(() => {
                        document
                          .getElementById("performance")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      });

                    }}
                  >

                    <span
                      className={`sidebar-server-status ${
                        isOnline ? "online" : "offline"
                      }`}
                    ></span>


                    <span className="sidebar-server-info">

                      <strong>
                        {
                          server.serverName ||
                          "Unnamed Server"
                        }
                      </strong>

                      <small>
                        {server.cloudProvider || "Local"}
                      </small>

                    </span>


                    {isSelected && (
                      <span className="sidebar-selected-mark">
                        ✓
                      </span>
                    )}

                  </button>

                );

              })

            )}

          </div>

        </div>


        {selectedEndpoint && (

          <div className="sidebar-current-server">

            <span>
              CURRENT SERVER
            </span>

            <strong>
              {selectedEndpoint.serverName}
            </strong>

            <small>
              {selectedEndpoint.ipAddress}
            </small>

            <div className="sidebar-current-status">

              <span
                className={
                  String(
                    selectedEndpoint.status || ""
                  ).toLowerCase() === "online"
                    ? "online-dot"
                    : "offline-dot"
                }
              ></span>

              {String(
                selectedEndpoint.status || ""
              ).toLowerCase() === "online"
                ? "Monitoring active"
                : "Server offline"}

            </div>

          </div>

        )}

      </aside>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="header-context">

          <span className="header-context-label">
            INFRASTRUCTURE MONITORING
          </span>

          <span className="header-context-divider">
            /
          </span>

          <span className="header-context-current">
            Live Dashboard
          </span>

        </div>


        {/* =================================================
            HEADER ACTIONS
        ================================================= */}

        <div className="header-actions">


          {/* USER */}

          {loggedInUser && (

            <div className="user-info">

              <span className="user-avatar">

                {String(
                  loggedInUser.name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}

              </span>


              <div className="user-details">

                <strong>
                  {
                    loggedInUser.name ||
                    "User"
                  }
                </strong>

                <small>
                  {
                    loggedInUser.email
                  }
                </small>

              </div>

            </div>

          )}


          {/* LIVE STATUS */}

          <div className="header-live">

            <span className="live-dot"></span>

            <span>
              Monitoring Live
            </span>

          </div>


          {/* LOGOUT */}

          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>


        </div>

      </header>


      <main className="dashboard">


        {/* =================================================
            TOP OVERVIEW
        ================================================= */}

        <section id="overview" className="dashboard-intro">

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
                fetchMetrics(
                  selectedEndpoint?.serverName
                )
              }
            >
              Retry
            </button>

          </div>

        )}


        {/* =================================================
            METRIC CARDS
        ================================================= */}

        <section id="performance">

          <div className="section-heading">

            <div>

              <span className="section-label">
                RESOURCE HEALTH
              </span>

              <h2>
                Current Performance
              </h2>

            </div>


            <div className="last-updated">

              <span></span>

              <div>

                <strong>
                  {lastUpdated
                    ? "LIVE MONITORING"
                    : "MONITORING UNAVAILABLE"}
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

                  {metrics &&
                  Number.isFinite(
                    metrics.cpu
                  )
                    ? `${metrics.cpu.toFixed(2)}%`
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
                        Math.max(
                          Number(
                            metrics?.cpu || 0
                          ),
                          0
                        ),
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

                  {metrics &&
                  Number.isFinite(
                    metrics.memory
                  )
                    ? `${metrics.memory.toFixed(2)}%`
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
                        Math.max(
                          Number(
                            metrics?.memory || 0
                          ),
                          0
                        ),
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

                  {metrics &&
                  Number.isFinite(
                    metrics.disk
                  )
                    ? `${metrics.disk.toFixed(2)}%`
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
                        Math.max(
                          Number(
                            metrics?.disk || 0
                          ),
                          0
                        ),
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

                {metrics?.uptime &&
                Number.isFinite(
                  metrics.uptime.days
                ) &&
                Number.isFinite(
                  metrics.uptime.hours
                ) &&
                Number.isFinite(
                  metrics.uptime.minutes
                )
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

        <section id="alerts" className="alerts-section">

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

        <section id="network" className="network-card">

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

                {metrics &&
                Number.isFinite(
                  metrics.network?.receive
                )
                  ? metrics.network.receive.toFixed(2)
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

                {metrics &&
                Number.isFinite(
                  metrics.network?.send
                )
                  ? metrics.network.send.toFixed(2)
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

        <section id="history" className="charts-section">

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
                    serverStatus ===
                    "online";


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