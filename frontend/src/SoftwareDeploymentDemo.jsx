import { useState } from "react";
import "./SoftwareDeploymentDemo.css";

const demoPackages = [
  {
    id: "nginx",
    name: "Nginx Web Server",
    version: "1.26.2",
    category: "Web & Application",
    platform: "Linux",
    initials: "NG",
    color: "blue",
  },
  {
    id: "docker",
    name: "Docker Engine",
    version: "27.3.1",
    category: "Container Runtime",
    platform: "Linux",
    initials: "DK",
    color: "cyan",
  },
  {
    id: "vscode",
    name: "Visual Studio Code",
    version: "1.95.3",
    category: "Developer Tools",
    platform: "Windows",
    initials: "VS",
    color: "purple",
  },
  {
    id: "node",
    name: "Node.js LTS",
    version: "22.11.0",
    category: "Runtime",
    platform: "Linux / Windows",
    initials: "JS",
    color: "green",
  },
];

const demoTargetGroups = [
  "Production Web Fleet",
  "Staging Servers",
  "Development Workstations",
];

const initialDemoActivity = [
  {
    id: "job-1",
    packageName: "Docker Engine",
    version: "27.3.1",
    target: "Staging Servers",
    time: "Today, 09:42",
    status: "Simulated",
  },
  {
    id: "job-2",
    packageName: "Node.js LTS",
    version: "22.11.0",
    target: "Development Workstations",
    time: "Today, 09:18",
    status: "Simulated",
  },
  {
    id: "job-3",
    packageName: "Nginx Web Server",
    version: "1.26.2",
    target: "Production Web Fleet",
    time: "Yesterday, 16:05",
    status: "Simulated",
  },
];

function SoftwareDeploymentDemo() {
  const [selectedPackageId, setSelectedPackageId] =
    useState(demoPackages[0].id);
  const [selectedTarget, setSelectedTarget] =
    useState(demoTargetGroups[1]);
  const [activity, setActivity] =
    useState(initialDemoActivity);
  const [notice, setNotice] =
    useState("");

  const selectedPackage =
    demoPackages.find((item) => item.id === selectedPackageId);

  const startDemoDeployment = () => {
    const deploymentTime =
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    setActivity((currentActivity) => [
      {
        id: `job-${Date.now()}`,
        packageName: selectedPackage.name,
        version: selectedPackage.version,
        target: selectedTarget,
        time: `Today, ${deploymentTime}`,
        status: "Simulated",
      },
      ...currentActivity,
    ]);
    setNotice(
      `${selectedPackage.name} deployment simulated for ${selectedTarget}. No software was installed.`
    );
  };

  return (
    <section
      id="software-deployment"
      className="software-deployment"
      aria-labelledby="software-deployment-title"
    >
      <div className="software-deployment-heading">
        <div>
          <span className="software-deployment-eyebrow">
            OPERATIONS / SOFTWARE DEPLOYMENT
          </span>
          <h2 id="software-deployment-title">Software deployment</h2>
          <p>
            Select a software package and target group to preview a managed rollout.
          </p>
        </div>
        <span className="software-deployment-mode">PREVIEW</span>
      </div>

      <div className="software-deployment-disclaimer" role="note">
        Illustrative catalog and activity only. Deployments are simulated in
        this browser; no endpoint is contacted and no software is installed.
      </div>

      {notice && (
        <div className="software-deployment-notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss deployment message"
          >
            ×
          </button>
        </div>
      )}

      <div className="software-deployment-layout">
        <div className="software-catalog-panel">
          <div className="software-panel-heading">
            <div>
              <h3>Software catalog</h3>
              <p>Choose a package to preview a rollout.</p>
            </div>
            <span>{demoPackages.length} packages</span>
          </div>

          <div className="software-catalog-grid">
            {demoPackages.map((software) => (
              <button
                type="button"
                key={software.id}
                className={`software-package-card ${
                  selectedPackageId === software.id ? "selected" : ""
                }`}
                aria-pressed={selectedPackageId === software.id}
                onClick={() => {
                  setSelectedPackageId(software.id);
                  setNotice("");
                }}
              >
                <span
                  className={`software-package-icon ${software.color}`}
                  aria-hidden="true"
                >
                  {software.initials}
                </span>
                <span className="software-package-info">
                  <strong>{software.name}</strong>
                  <small>{software.category}</small>
                  <small>{software.platform}</small>
                </span>
                <span className="software-package-version">
                  v{software.version}
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="software-rollout-panel">
          <div className="software-panel-heading">
            <div>
              <h3>Deployment plan</h3>
              <p>Configure this simulated rollout.</p>
            </div>
          </div>

          <div className="software-rollout-field">
            <label htmlFor="demo-deployment-target">Target group</label>
            <select
              id="demo-deployment-target"
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value)}
            >
              {demoTargetGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="software-rollout-summary">
            <span>PACKAGE</span>
            <strong>{selectedPackage.name}</strong>
            <small>Version {selectedPackage.version}</small>
            <div>
              <span>Rollout strategy</span>
              <strong>Staged · simulated</strong>
            </div>
            <div>
              <span>Restart policy</span>
              <strong>On success · simulated</strong>
            </div>
          </div>

          <button
            type="button"
            className="software-deploy-button"
            onClick={startDemoDeployment}
          >
            <span aria-hidden="true">▷</span>
            Simulate deployment
          </button>
          <p className="software-rollout-footnote">
            This action only adds a simulated activity record.
          </p>
        </aside>
      </div>

      <div className="software-activity-panel">
        <div className="software-panel-heading">
          <div>
            <h3>Recent deployment activity</h3>
            <p>Illustrative history for the presentation.</p>
          </div>
          <span className="software-activity-count">
            {activity.length} activities
          </span>
        </div>

        <div className="software-activity-scroll">
          <table className="software-activity-table">
            <thead>
              <tr>
                <th scope="col">Package</th>
                <th scope="col">Target group</th>
                <th scope="col">Started</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.packageName}</strong>
                    <small>Version {item.version}</small>
                  </td>
                  <td>{item.target}</td>
                  <td>{item.time}</td>
                  <td>
                    <span className="software-activity-status">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default SoftwareDeploymentDemo;
