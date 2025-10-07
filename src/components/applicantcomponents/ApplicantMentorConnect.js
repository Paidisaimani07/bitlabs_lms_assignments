import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";

// ✅ local fallback images (replace paths as needed)
import DummyMentor from "../../images/mentor-dummy.png"; // your provided dummy avatar
import DummyBanner from "../../images/bannercard_mentor.jpg"; // generic banner image

const ApplicantMentorConnect = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const user = useUserContext()?.user;

  useEffect(() => {
    const controller = new AbortController();

    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        const headers = jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {};
        const resp = await axios.get(`${apiUrl}/api/mentor-connect/getAllMeetings`, {
          headers,
          signal: controller.signal,
        });
        const data = Array.isArray(resp.data) ? resp.data : [];
        setMeetings(data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching mentor connect meetings:", err);
        setError("Failed to fetch meetings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
    return () => controller.abort();
  }, []);

  // --- helpers ---
  const buildStartDate = (dateArr, timeArr) => {
    if (!Array.isArray(dateArr) || dateArr.length < 3) return null;
    const [y, m, d] = dateArr;
    const hh = Array.isArray(timeArr) ? (timeArr[0] ?? 0) : 0;
    const mm = Array.isArray(timeArr) ? (timeArr[1] ?? 0) : 0;
    const dt = new Date(y, (m ?? 1) - 1, d, hh, mm, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const formatDuration = (mins) => {
    if (mins == null) return "";
    const n = Number(mins);
    if (isNaN(n)) return `${mins}`;
    if (n < 60) return `${n} mins`;
    const h = Math.floor(n / 60);
    const r = n % 60;
    return r === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hr ${r} mins`;
  };

  const formatStartsOn = (dateArr, timeArr) => {
    const dt = buildStartDate(dateArr, timeArr);
    if (!dt) return "";
    return dt.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // status: 'upcoming' | 'ongoing' | 'past'
  const getStatus = (meeting) => {
    const start = buildStartDate(meeting.date, meeting.startTime);
    if (!start) return "past";
    const durationMinutes = Number(meeting.durationMinutes ?? meeting.duration ?? 60) || 60;
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const now = Date.now();
    if (now < start.getTime()) return "upcoming";
    if (now >= start.getTime() && now < end.getTime()) return "ongoing";
    return "past";
  };

  // Google Calendar
  const toGoogleUTC = (d) => {
    const p = (n) => String(n).padStart(2, "0");
    return (
      d.getUTCFullYear() +
      p(d.getUTCMonth() + 1) +
      p(d.getUTCDate()) +
      "T" +
      p(d.getUTCHours()) +
      p(d.getUTCMinutes()) +
      p(d.getUTCSeconds()) +
      "Z"
    );
  };

  const buildGoogleCalendarUrl = (meeting) => {
    try {
      const title = meeting.title ?? "Mentor Session";
      const body = [
        meeting.description || "",
        meeting.meetLink ? `Join link: ${meeting.meetLink}` : "",
        "Hosted via Mentor Connect",
      ]
        .filter(Boolean)
        .join("\n\n");

      const start = buildStartDate(meeting.date, meeting.startTime);
      if (!start) {
        return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
          title
        )}&details=${encodeURIComponent(body)}`;
      }
      const mins = Number(meeting.durationMinutes ?? meeting.duration ?? 60) || 60;
      const end = new Date(start.getTime() + mins * 60000);
      const dates = `${toGoogleUTC(start)}/${toGoogleUTC(end)}`;
      const loc = meeting.meetLink ?? "";

      return (
        "https://www.google.com/calendar/render?action=TEMPLATE" +
        `&text=${encodeURIComponent(title)}` +
        `&details=${encodeURIComponent(body)}` +
        `&location=${encodeURIComponent(loc)}` +
        `&dates=${encodeURIComponent(dates)}`
      );
    } catch {
      return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        meeting.title ?? "Mentor Session"
      )}`;
    }
  };

  const handleJoin = (meetLink) => {
    if (!meetLink) return;
    window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  // fallback resolvers
  const getAvatarUrl = (m) =>
    m.mentorImage || m.mentorAvatar || m.photoUrl || m.avatar || DummyMentor;

  const getBannerUrl = (m) =>
    m.bannerImage || m.bannerUrl || m.imageUrl || m.coverImage || DummyBanner;

  // ---- Styles (same base styles) ----
  const card = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #EEF2F7",
    boxShadow: "0 14px 28px rgba(17, 24, 39, 0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 150ms ease, box-shadow 150ms ease",
  };

  const bannerWrap = { position: "relative", width: "100%", height: 140, overflow: "hidden" };

  const pillBase = {
    position: "absolute",
    top: 12,
    right: 12,
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
  };

  const pillOngoing = { ...pillBase, background: "#22c55e" }; // green
  const pillUpcoming = { ...pillBase, background: "#F97316" }; // orange

  const body = { padding: 14, display: "flex", flexDirection: "column", gap: 8 };

  const title = { fontSize: 18, fontWeight: 800, color: "#111827" };

  // Description: 1 line with vertical scrollbar if needed
  const subtitle = {
    fontSize: 14,
    color: "#475569",
    maxHeight: "1.4em",
    lineHeight: "1.4",
    overflowY: "auto",
    overflowX: "hidden",
  };

  const durationText = { fontSize: 12, color: "#64748B" };

  const mentorRow = { display: "flex", alignItems: "center", gap: 10, marginTop: 2 };

  const avatar = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #FFE0C2",
    background: "#fff",
    flexShrink: 0,
  };

  const mentorMeta = { display: "flex", flexDirection: "column", lineHeight: 1.1 };
  const mentorName = { fontSize: 13, fontWeight: 700, color: "#0F172A" };
  const mentorRole = { fontSize: 12, color: "#94A3B8" };

  const primaryCta = {
    marginTop: 6,
    background: "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)",
    color: "#fff",
    border: 0,
    padding: "12px 16px",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 8px 18px rgba(249,115,22,0.25)",
  };
  const primaryCtaDisabled = { ...primaryCta, opacity: 0.8, cursor: "not-allowed" };

  const bottomBar = {
    marginTop: 8,
    display: "flex",
    gap: 10,
    alignItems: "center",
  };

  const ghostBtn = {
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#F8FAFC",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap", // keep single line
  };

  return (
    <div className="dashboard__content" style={{ paddingTop: 4, paddingBottom: 8 }}>
      <style>{`
        .mentor-grid { display:flex; flex-wrap:wrap; gap:16px; margin-top:12px; }
        .mentor-card { flex:1 1 calc(33.333% - 16px); max-width:calc(33.333% - 16px); box-sizing:border-box; }
        @media (max-width: 992px) { .mentor-card { flex:1 1 calc(50% - 16px); max-width:calc(50% - 16px); } }
        @media (max-width: 600px) { .mentor-card { flex:1 1 100%; max-width:100%; } }
        .mentor-card:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(17,24,39,0.10); }
        /* thin scrollbar look for the description area */
        .desc-thin::-webkit-scrollbar { width: 8px; }
        .desc-thin::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.18); border-radius: 6px; }
        .desc-thin { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.18) transparent; }
      `}</style>

      <section className="page-title-dashboard" style={{ marginBottom: 12 }}>
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="title-dashboard">
                <div className="title-dash">Mentor Live Connect</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="col-lg-12 col-md-12">
        <section className="flat-dashboard-setting flat-dashboard-setting2">
          <div className="themes-container">
            <div className="content-tab">
              <div className="inner">
                <div className="group-col-2" />

                <div style={{ marginTop: 6 }}>
                  {loading ? (
                    <div style={{ padding: 18 }}>Loading sessions…</div>
                  ) : error ? (
                    <div style={{ color: "#b91c1c" }}>{error}</div>
                  ) : meetings.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
                      No mentor sessions available at the moment. Check back later.
                    </div>
                  ) : (
                    <div className="mentor-grid">
                      {meetings
                        .filter((m) => getStatus(m) !== "past") // hide past
                        .map((m) => {
                          const meetingId = m.meetingId ?? m.meeting_id ?? m.id;
                          const mentor = m.mentorName ?? m.mentor_name ?? "Mentor";
                          const titleTxt = m.title ?? "Career Guidance";
                          const subtitleTxt = m.description ?? "";
                          const duration = formatDuration(m.durationMinutes ?? m.duration ?? 60);
                          const meetLink = m.meetLink ?? m.meet_link ?? "";
                          const avatarUrl = getAvatarUrl(m);
                          const bannerUrl = getBannerUrl(m);
                          const gcalUrl = buildGoogleCalendarUrl(m);
                          const role = m.mentorRole || m.role || "Career Coach";

                          const status = getStatus(m);
                          const startsOnText = formatStartsOn(m.date, m.startTime);

                          return (
                            <div className="mentor-card" key={meetingId}>
                              <div style={card}>
                                {/* Banner with status pill */}
                                <div style={bannerWrap}>
                                  <img
                                    src={bannerUrl}
                                    alt={titleTxt}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = DummyBanner;
                                    }}
                                  />
                                  <div style={status === "ongoing" ? pillOngoing : pillUpcoming}>
                                    {status === "ongoing" ? "Ongoing" : "Upcoming"}
                                  </div>
                                </div>

                                {/* Body */}
                                <div style={body}>
                                  <div style={title}>{titleTxt}</div>

                                  {/* 1-line scrollable description */}
                                  <div className="desc-thin" style={subtitle}>
                                    {subtitleTxt}
                                  </div>

                                  <div style={durationText}>Duration: {duration}</div>

                                  {/* Mentor strip */}
                                  <div style={mentorRow}>
                                    <img
                                      src={avatarUrl}
                                      alt={mentor}
                                      style={avatar}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = DummyMentor;
                                      }}
                                    />
                                    <div style={mentorMeta}>
                                      <span style={mentorName}>{mentor}</span>
                                      <span style={mentorRole}>{role}</span>
                                    </div>
                                  </div>

                                  {/* Primary CTA – changes with status */}
                                  {status === "ongoing" ? (
                                    <button
                                      style={primaryCta}
                                      onClick={() => handleJoin(meetLink)}
                                      disabled={!meetLink}
                                      title={!meetLink ? "No join link provided" : "Join Now"}
                                    >
                                      Join Now
                                    </button>
                                  ) : (
                                    <button
                                      style={primaryCtaDisabled}
                                      disabled
                                      title={`Starts on ${startsOnText}`}
                                    >
                                      Starts on {startsOnText}
                                    </button>
                                  )}

                                  {/* Bottom action bar */}
                                  <div style={bottomBar}>
                                    <button
                                      style={ghostBtn}
                                      onClick={() => window.open(gcalUrl, "_blank", "noopener,noreferrer")}
                                      title="Add to Google Calendar"
                                    >
                                      {/* calendar icon */}
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v2h20V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1z"/>
                                        <path d="M22 10H2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-9zM7 14h4v4H7v-4z"/>
                                      </svg>
                                      Add to calendar
                                    </button>

                                    <button
                                      style={ghostBtn}
                                      title="Copy join link"
                                      onClick={() =>
                                        navigator.clipboard
                                          .writeText(meetLink || "")
                                          .then(() => alert("Link copied!"))
                                          .catch(() => alert("Unable to copy. Please copy manually."))
                                      }
                                    >
                                      {/* copy icon */}
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <path d="M16 1H6a2 2 0 0 0-2 2v11h2V3h10V1z" />
                                        <path d="M19 5H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z" />
                                      </svg>
                                      Copy Link
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApplicantMentorConnect;
