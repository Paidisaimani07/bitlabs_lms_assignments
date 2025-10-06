import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";

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

  // Build Date from API arrays: date [Y,M,D], startTime [HH,mm]
  const buildStartDate = (dateArr, timeArr) => {
    if (!Array.isArray(dateArr) || dateArr.length < 3) return null;
    const [y, m, d] = dateArr;
    const hh = Array.isArray(timeArr) ? (timeArr[0] ?? 0) : 0;
    const mm = Array.isArray(timeArr) ? (timeArr[1] ?? 0) : 0;
    const dt = new Date(y, (m ?? 1) - 1, d, hh, mm, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const formatDatePill = (dateArr, timeArr) => {
    const dt = buildStartDate(dateArr, timeArr);
    if (!dt) return "";
    return dt.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDuration = (mins) => {
    if (mins == null) return "";
    const n = Number(mins);
    if (isNaN(n)) return `${mins}`;
    if (n < 60) return `${n} min`;
    const h = Math.floor(n / 60);
    const r = n % 60;
    return r === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hr ${r} min`;
  };

  // Google Calendar link
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
      ].filter(Boolean).join("\n\n");

      const start = buildStartDate(meeting.date, meeting.startTime);
      if (!start) {
        return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&details=${encodeURIComponent(body)}`;
      }
      const mins = Number(meeting.durationMinutes ?? meeting.duration ?? 60) || 60;
      const end = new Date(start.getTime() + mins * 60000);
      const dates = `${toGoogleUTC(start)}/${toGoogleUTC(end)}`;
      const loc = meeting.meetLink ?? "";

      return "https://www.google.com/calendar/render?action=TEMPLATE"
        + `&text=${encodeURIComponent(title)}`
        + `&details=${encodeURIComponent(body)}`
        + `&location=${encodeURIComponent(loc)}`
        + `&dates=${encodeURIComponent(dates)}`;
    } catch {
      return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(meeting.title ?? "Mentor Session")}`;
    }
  };

  const handleJoin = (meetLink) => {
    if (!meetLink) return;
    window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  // --- Styles ---
  const cardWrap = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #EEF2F7",
    boxShadow: "0 12px 24px rgba(17, 24, 39, 0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: 260,
  };

  const headerBar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(90deg, rgba(255,243,233,0.9) 0%, rgba(255,247,237,0.9) 100%)",
    padding: "10px 14px",
    borderBottom: "1px solid #FFE7D6",
  };

  const mentorName = { fontSize: 12, fontWeight: 800, color: "#1F2937" };

  const datePill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#FFF5EB",
    color: "#EF7D27",
    border: "1px solid #FFD8BA",
    borderRadius: 24,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  const body = { padding: "14px", display: "flex", flexDirection: "column", flexGrow: 1 };

  const titleStyle = {
    color: "#0F172A",
    fontSize: 18,
    lineHeight: 1.25,
    fontWeight: 800,
    marginBottom: 8,
  };

  // 1-line area with scroll only if overflow
  const descBox = {
    fontSize: 14,
    color: "#334155",
    lineHeight: "1.5",
    maxHeight: "1.5em", // EXACTLY one line
    overflow: "auto",   // scrollbar shows only when needed
    marginBottom: 10,
  };

  const metaRow = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 12,
  };

  const metaChip = {
    marginTop: "5%",
    fontSize: 12,
    color: "#475569",
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "6px 8px",
    fontWeight: 600,
  };

  // Footer pinned to bottom-right
  const footer = {
    marginTop: "5%",
    marginLeft: "20%",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  };

  // Refreshed buttons
  const btnOutline = {
    background: "#fff",
    color: "#F97316",
    border: "1.5px solid #F97316",
    padding: "9px 14px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 13,
  };

  const btnFilled = {
    background: "linear-gradient(90deg, #F97316 0%, #FB923C 100%)",
    color: "#fff",
    border: "0",
    padding: "9px 16px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 13,
    boxShadow: "0 6px 12px rgba(249,115,22,0.25)",
  };

  return (
    <div className="dashboard__content" style={{ paddingTop: 4, paddingBottom: 8 }}>
      <style>{`
        .mentor-grid { display:flex; flex-wrap:wrap; gap:16px; margin-top:12px; }
        .mentor-card { flex:1 1 calc(33.333% - 16px); max-width:calc(33.333% - 16px); box-sizing:border-box; }
        @media (max-width: 992px) { .mentor-card { flex:1 1 calc(50% - 16px); max-width:calc(50% - 16px); } }
        @media (max-width: 600px) { .mentor-card { flex:1 1 100%; max-width:100%; } }
        .mentor-card:hover { transform: translateY(-2px); transition: transform 160ms ease; }
        /* thin scrollbar for the description area */
        .desc-scroll::-webkit-scrollbar { height: 6px; width: 8px; }
        .desc-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.18); border-radius: 6px; }
        .desc-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.18) transparent; }
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
                      {meetings.map((m) => {
                        const meetingId = m.meetingId ?? m.meeting_id ?? m.id;
                        const mentor = m.mentorName ?? m.mentor_name ?? "Mentor";
                        const title = m.title ?? "Webinar";
                        const description = m.description ?? "";
                        const dateArr = m.date ?? null;
                        const timeArr = m.startTime ?? m.start_time ?? null;
                        const durationMinutes = m.durationMinutes ?? m.duration ?? 60;
                        const meetLink = m.meetLink ?? m.meet_link ?? "";

                        const gcalUrl = buildGoogleCalendarUrl(m);
                        const dateText = formatDatePill(dateArr, timeArr);

                        return (
                          <div className="mentor-card" key={meetingId}>
                            <div style={cardWrap}>
                              {/* Header */}
                              <div style={headerBar}>
                                <div style={mentorName}>{mentor}</div>
                                <div style={datePill}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF7D27" aria-hidden="true">
                                    <path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v2h20V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1z"/>
                                    <path d="M22 10H2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-9zM7 14h4v4H7v-4z"/>
                                  </svg>
                                  <span>{dateText}</span>
                                </div>
                              </div>

                              {/* Body */}
                              <div style={body}>
                                <div style={titleStyle}>{title}</div>

                                {/* Description — 1 line max; scroll if longer */}
                                <div className="desc-scroll" style={descBox}>
                                  {description}
                                </div>

                                {/* Meta row */}
                               <div style={metaRow}>
  <div style={metaChip}>Duration: {formatDuration(durationMinutes)}</div>

  {meetLink && (
    <div
      style={{
        ...metaChip,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s ease",
      }}
      title="Click to copy meet link"
      onClick={() =>
        navigator.clipboard
          .writeText(meetLink)
          .then(() => alert("✅ Meet link copied to clipboard!"))
          .catch(() => alert("⚠️ Unable to copy. Please copy manually."))
      }
    >
      Copy Meet Link
    </div>
  )}
</div>


                                {/* Footer CTAs pinned to bottom-right */}
                                <div style={footer}>
                                  <button
                                    style={btnOutline}
                                    onClick={() => handleJoin(meetLink)}
                                    disabled={!meetLink}
                                    title={!meetLink ? "No join link provided" : "Join Now"}
                                  >
                                    Join Now
                                  </button>
                                  <button
                                    style={btnFilled}
                                    onClick={() => window.open(gcalUrl, "_blank", "noopener,noreferrer")}
                                    title="Add to Google Calendar"
                                  >
                                    Add to calendar
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
