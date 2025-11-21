import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";

export default function ApplicantJobAlerts() {
  const [jobAlerts, setJobAlerts] = useState([]);
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [readLoading, setReadLoading] = useState(false);   // for Read All
  const [clearLoading, setClearLoading] = useState(false); // for Clear All
  const [error, setError] = useState(null);

  // fetch function extracted so we can call it after actions
  const fetchAlertsFromServer = async () => {
    if (!user || !user.id) return [];
    try {
      const authToken = localStorage.getItem("jwtToken");
      const resp = await axios.get(`${apiUrl}/applyjob/applicant/job-alerts/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const alerts = resp.data || [];
      setJobAlerts(alerts);
      // publish server-side unread count
      const unreadCount = alerts.filter((a) => !a.seen).length;
      window.dispatchEvent(new CustomEvent("alerts-updated", { detail: { unreadCount } }));
      return alerts;
    } catch (err) {
      console.error("Error fetching job alerts:", err);
      setError("Failed to load notifications.");
      setJobAlerts([]);
      window.dispatchEvent(new CustomEvent("alerts-updated", { detail: { unreadCount: 0 } }));
      return [];
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAlertsFromServer().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // publish helper (local)
  const publishUnreadCount = (alerts) => {
    const unreadCount = (alerts || []).filter((a) => !a.seen).length;
    window.dispatchEvent(new CustomEvent("alerts-updated", { detail: { unreadCount } }));
  };

  // MARK SINGLE AS SEEN
  const handleJobAlertClick = async (alert) => {
    try {
      const authToken = localStorage.getItem("jwtToken");
      await axios.put(
        `${apiUrl}/applyjob/applicant/mark-alert-as-seen/${alert.alertsId}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // update local UI immediately
      const updatedLocal = jobAlerts.map((a) => (a.alertsId === alert.alertsId ? { ...a, seen: true } : a));
      setJobAlerts(updatedLocal);
      publishUnreadCount(updatedLocal);
    } catch (err) {
      console.error("Error marking single alert as seen:", err);
      // optionally refetch to sync
      await fetchAlertsFromServer();
    }
  };

  // DELETE SINGLE ALERT
  const handleDeleteAlert = async (alertId) => {
    try {
      const authToken = localStorage.getItem("jwtToken");
      await axios.delete(`${apiUrl}/applyjob/alert/delete/${alertId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const updated = jobAlerts.filter((a) => a.alertsId !== alertId);
      setJobAlerts(updated);
      publishUnreadCount(updated);
    } catch (err) {
      console.error("Error deleting alert:", err);
      await fetchAlertsFromServer();
    }
  };

  // READ ALL (mark all as seen) - robust: try batch, fallback per-item, then REFRESH from server
  const handleReadAll = async () => {
    if (!jobAlerts.length) return;
    setReadLoading(true);
    setError(null);
    const authToken = localStorage.getItem("jwtToken");

    try {
      // try batch endpoint (adjust if your backend differs)
      await axios.put(
        `${apiUrl}/applyjob/applicant/mark-all-alerts-as-seen/${user.id}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (batchErr) {
      console.warn("Batch mark-all endpoint failed, falling back to per-item marking.", batchErr);
      // fallback: mark each item (continue even if some fail)
      await Promise.all(
        jobAlerts.map(async (a) => {
          try {
            await axios.put(
              `${apiUrl}/applyjob/applicant/mark-alert-as-seen/${a.alertsId}`,
              {},
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
          } catch (e) {
            console.error(`Failed to mark alert ${a.alertsId} as seen`, e);
            // continue; we will refetch to get definitive state
          }
        })
      );
    }

    // REFRESH from server to ensure DB/UI are consistent (and publish authoritative unread count)
    try {
      await fetchAlertsFromServer();
    } catch (err) {
      console.error("Failed to refetch alerts after Read All:", err);
    } finally {
      setReadLoading(false);
    }
  };

  // CLEAR ALL (delete all) - robust: try batch, fallback per-item, then REFRESH from server
  const handleClearAll = async () => {
    if (!jobAlerts.length) return;
    if (!window.confirm("Clear all notifications? This action will permanently remove all notifications.")) return;

    setClearLoading(true);
    setError(null);
    const authToken = localStorage.getItem("jwtToken");

    try {
      // try batch delete endpoint
      await axios.delete(`${apiUrl}/applyjob/alert/delete-all/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (batchDelErr) {
      console.warn("Batch delete-all endpoint failed, falling back to per-item delete.", batchDelErr);
      // fallback: delete per item (continue on errors)
      await Promise.all(
        jobAlerts.map(async (a) => {
          try {
            await axios.delete(`${apiUrl}/applyjob/alert/delete/${a.alertsId}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
          } catch (e) {
            console.error(`Failed to delete alert ${a.alertsId}`, e);
            // continue
          }
        })
      );
    }

    // REFRESH from server to get definitive state and unread count
    try {
      await fetchAlertsFromServer();
    } catch (err) {
      console.error("Failed to refetch alerts after Clear All:", err);
    } finally {
      setClearLoading(false);
    }
  };

  // date formatter
  function formatDate(dateArray) {
    if (!Array.isArray(dateArray)) return "";
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute, second);
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
    return date.toLocaleString("en-US", options);
  }

  // combined flag to disable buttons while an action runs
  const anyActionRunning = readLoading || clearLoading;

  return (
    <div className="border-style">
      <div className="blur-border-style" />
      <div className="dashboard__content">
        <section className="page-title-dashboard extraSpace">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                {/* Title + action buttons */}
                <div
                  className="title-dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    paddingRight: 30,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="title-dash flex2" style={{ marginLeft: "30px", marginBottom: "-30px" }}>
                      Notifications
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={handleReadAll}
                      disabled={loading || jobAlerts.length === 0 || anyActionRunning}
                      style={{
                        background: "#fd7e14",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontWeight: 600,
                        cursor: loading || jobAlerts.length === 0 || anyActionRunning ? "not-allowed" : "pointer",
                      }}
                      title="Mark all notifications as read"
                      aria-disabled={loading || jobAlerts.length === 0 || anyActionRunning}
                    >
                      {readLoading ? "Working..." : "Read All"}
                    </button>

                    <button
                      onClick={handleClearAll}
                      disabled={loading || jobAlerts.length === 0 || anyActionRunning}
                      style={{
                        background: "#fff",
                        color: "#fd7e14",
                        border: "1px solid #fd7e14",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontWeight: 600,
                        cursor: loading || jobAlerts.length === 0 || anyActionRunning ? "not-allowed" : "pointer",
                      }}
                      title="Delete all notifications"
                      aria-disabled={loading || jobAlerts.length === 0 || anyActionRunning}
                    >
                      {clearLoading ? "Working..." : "Clear All"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flat-dashboard-dyagram">
          <div className="box-icon wrap-counter flex">
            <div className="icon style1">
              <span className="icon-bag" />
            </div>
            <div className="content" />
          </div>

          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                {loading ? (
                  <div style={{ padding: 20 }}>Loading...</div>
                ) : (
                  <div className="box-notifications">
                    {error && <div style={{ color: "red", padding: "8px 12px" }}>{error}</div>}

                    {jobAlerts.length > 0 ? (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {jobAlerts.map((alert) => (
                          <li
                            key={alert.alertsId}
                            className="inner"
                            style={{
                              width: "100%",
                              padding: "2%",
                              borderRadius: "10px",
                              minHeight: "80px",
                              position: "relative",
                              backgroundColor: alert.seen ? "#E5EAF5" : "#FFFFFF",
                              marginBottom: 12,
                              transition: "background-color 180ms ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", position: "relative", height: "50px" }}>
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  backgroundColor: alert.seen ? "transparent" : "#3384E3",
                                  border: "2px solid #3384E3",
                                  borderRadius: "50%",
                                  marginRight: "10px",
                                  position: "absolute",
                                  left: "0px",
                                  top: "20px",
                                }}
                              />

                              <h4 style={{ marginLeft: "25px", flex: 1 }}>
                                <Link
                                  to={`/applicant-interview-status?jobId=${alert.jobId}&applyJobId=${alert.applyjobid}`}
                                  className="link"
                                  onClick={() => handleJobAlertClick(alert)}
                                  onMouseOver={(e) => {
                                    e.target.style.color = "black";
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.color = "black";
                                  }}
                                  style={{ textDecoration: "none", color: "inherit" }}
                                >
                                  Your application status has been marked as{" "}
                                  {alert.status === "New" ? "Applied Job" : alert.status} by {alert.companyName} for{" "}
                                  {alert.jobTitle} role.
                                  <br />
                                  <span className="date-info" style={{ color: "#666", fontSize: 12 }}>
                                    {formatDate(alert.changeDate)}
                                  </span>
                                </Link>
                              </h4>

                              <button
                                style={{
                                  all: "unset",
                                  marginLeft: "12px",
                                  cursor: "pointer",
                                  color: "#fd7e14",
                                  fontWeight: "bold",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (window.confirm("Delete this notification?")) {
                                    handleDeleteAlert(alert.alertsId);
                                  }
                                }}
                                title="Delete alert"
                              >
                                <i className="fas fa-trash" aria-hidden />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ padding: 20 }}>
                        <h4>No Notifications Found</h4>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
