import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";

// Fallback images
import DummyMentor from "../../images/mentor-dummy.png";
import DummyBanner from "../../images/bannercard_mentor.jpg";

const ApplicantMentorConnect = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const user = useUserContext()?.user;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        const headers = jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {};
        const resp = await axios.get(`${apiUrl}/api/mentor-connect/getAllMeetings`, {
          headers,
          signal: controller.signal,
        });

        // Support both shapes: plain array OR { items: [...] }
        const payload = resp.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : [];

        setMeetings(list);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("MentorConnect fetch error:", err);
          setError("Failed to fetch sessions. Please try again.");
          setMeetings([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // ---------- helpers ----------
  // Accepts LocalDate as [yyyy,mm,dd] or "yyyy-mm-dd"
  // Accepts LocalTime as [hh,mm,ss?] or "hh:mm[:ss]"
  const buildStartDate = (dateVal, timeVal) => {
    try {
      let y, m, d, hh = 0, mm = 0, ss = 0;

      if (Array.isArray(dateVal)) {
        [y, m, d] = dateVal;
      } else if (typeof dateVal === "string") {
        const dt = new Date(dateVal);
        if (!isNaN(dt.getTime())) {
          y = dt.getFullYear();
          m = dt.getMonth() + 1;
          d = dt.getDate();
        } else {
          const parts = dateVal.split("-").map((x) => parseInt(x, 10));
          [y, m, d] = parts;
        }
      }

      if (Array.isArray(timeVal)) {
        hh = timeVal[0] ?? 0;
        mm = timeVal[1] ?? 0;
        ss = timeVal[2] ?? 0;
      } else if (typeof timeVal === "string") {
        const parts = timeVal.split(":").map((x) => parseInt(x, 10));
        hh = parts[0] ?? 0;
        mm = parts[1] ?? 0;
        ss = parts[2] ?? 0;
      }

      if (y == null || m == null || d == null) return null;
      const dt = new Date(y, (m ?? 1) - 1, d, hh, mm, ss, 0);
      return isNaN(dt.getTime()) ? null : dt;
    } catch {
      return null;
    }
  };

  const formatDuration = (mins) => {
    const n = Number(mins);
    if (!Number.isFinite(n)) return "";
    if (n < 60) return `${n} mins`;
    const h = Math.floor(n / 60);
    const r = n % 60;
    return r ? `${h} hr ${r} mins` : `${h} hr${h > 1 ? "s" : ""}`;
  };

  const computeStatus = (m) => {
    if (m.status && typeof m.status === "string") return m.status; // use backend if present
    const start = buildStartDate(m.date, m.startTime);
    if (!start) return "Expired";
    const mins = Number(m.durationMinutes ?? m.duration ?? 60) || 60;
    const end = new Date(start.getTime() + mins * 60000);
    const now = new Date();
    if (now < start) return "Upcoming";
    if (now >= start && now < end) return "Active";
    return "Expired";
  };

  const toGoogleUTC = (d) => {
    const p = (x) => String(x).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(
      d.getUTCHours()
    )}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
  };

  const buildGoogleCalendarUrl = (m) => {
    const title = m.title ?? "Mentor Session";
    const details = [
      m.description || "",
      m.meetLink ? `Join: ${m.meetLink}` : "",
      "MentorSphere — bitLabs Jobs",
    ]
      .filter(Boolean)
      .join("\n\n");

    const start = buildStartDate(m.date, m.startTime);
    if (!start) {
      return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        title
      )}&details=${encodeURIComponent(details)}`;
    }
    const mins = Number(m.durationMinutes ?? m.duration ?? 60) || 60;
    const end = new Date(start.getTime() + mins * 60000);
    const dates = `${toGoogleUTC(start)}/${toGoogleUTC(end)}`;

    return (
      "https://www.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(m.meetLink ?? "")}` +
      `&dates=${encodeURIComponent(dates)}`
    );
  };

  const copyLink = async (link) => {
    if (!link) return alert("No link available.");
    try {
      await navigator.clipboard.writeText(link);
      alert("Meet link copied!");
    } catch {
      alert("Unable to copy. Please copy manually.");
    }
  };

  // ---------- search/filter ----------
  const normalized = (s) => (s || "").toString().toLowerCase().trim();
  const filteredMeetings = useMemo(() => {
    const q = normalized(query);
    if (!q) return meetings;

    return meetings.filter((m) => {
      const hay = [
        m.title,
        m.description,
        m.mentorName,
        m.technology,
        m.mentorRole,
      ]
        .map(normalized)
        .join(" ");
      return hay.includes(q);
    });
  }, [meetings, query]);

  // ---------- styles ----------
  const styles = {
    grid: `
      .mentor-grid { display:flex; flex-wrap:wrap; gap:18px; margin-top:12px; }
      .mentor-card { flex:1 1 calc(33.333% - 18px); max-width:calc(33.333% - 18px); }
      @media (max-width: 992px) { .mentor-card { flex:1 1 calc(50% - 18px); max-width:calc(50% - 18px); } }
      @media (max-width: 640px) { .mentor-card { flex:1 1 100%; max-width:100%; } }
      .page-title-wrap { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .search-input { width:280px; max-width:40vw; border:1px solid #E5E7EB; border-radius:10px; padding:10px 12px; font-size:14px; }
      @media (max-width:640px){ .search-input{ width:100%; max-width:none; } .page-title-wrap{ flex-direction:column; align-items:stretch; } }
    `,
  };

  const Card = ({ m }) => {
    const status = computeStatus(m);
    const banner = m.bannerImageUrl || m.banner || DummyBanner;
    const avatar = m.mentorProfileUrl || m.mentorImage || m.photoUrl || DummyMentor;
    const duration = formatDuration(m.durationMinutes ?? m.duration ?? 60);
    const gcalUrl = buildGoogleCalendarUrl(m);

    // Button rules
    const startEnabled = status === "Active";
    const addCalEnabled = status === "Active" || status === "Upcoming";

    const statusColor =
      status === "Active" ? "#22c55e" : status === "Upcoming" ? "#F59E0B" : "#9CA3AF";

    return (
      <div
  className="mentor-card"
  style={{
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #EEF2F7",
    boxShadow: "0 12px 24px rgba(17,24,39,0.06)",
    padding: 12,                  // ⬅️ add padding on all sides
  }}
>
        {/* Banner */}
        <div style={{ width: "100%", height: 160, borderRadius: 6, overflow: "hidden" }}>
          <img
            src={banner}
            alt={m.title || "Mentor session"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DummyBanner;
            }}
          />
        </div>

        {/* Body */}
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Header row: Status (left) — Copy link (right) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                background: statusColor,
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                padding: "6px 10px",
                borderRadius: 999,
                boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
              }}
            >
              {status}
            </span>

            <button
              onClick={() => copyLink(m.meetLink)}
              style={{
                background: "transparent",
                color: "#ef6c00",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Copy link
            </button>
          </div>

          {/* Title/desc/duration */}
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{m.title}</div>
          {m.description ? (
            <div style={{ fontSize: 14, color: "#475569" }}>{m.description}</div>
          ) : null}
          <div style={{ fontSize: 12, color: "#ef6c00", fontWeight: 700 }}>
            Duration: {duration}
          </div>

          {/* Mentor row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={avatar}
              alt={m.mentorName || "Mentor"}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #FFE0C2",
                background: "#fff",
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DummyMentor;
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                {m.mentorName || "Mentor"}
              </span>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>
                {m.mentorRole || "Career coach"}
              </span>
            </div>
          </div>

          {/* CTA row */}
          <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
            <button
              onClick={() =>
                startEnabled && m.meetLink
                  ? window.open(m.meetLink, "_blank", "noopener,noreferrer")
                  : null
              }
              disabled={!startEnabled || !m.meetLink}
              style={{
                flex: 1,
                background: startEnabled
                  ? "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)"
                  : "#F3F4F6",
                color: startEnabled ? "#fff" : "#9CA3AF",
                border: 0,
                padding: "12px 16px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: startEnabled ? "pointer" : "not-allowed",
                boxShadow: startEnabled ? "0 8px 18px rgba(249,115,22,0.25)" : "none",
              }}
            >
              Start now
            </button>

            <button
              onClick={() =>
                (status === "Active" || status === "Upcoming")
                  ? window.open(gcalUrl, "_blank", "noopener,noreferrer")
                  : null
              }
              disabled={!(status === "Active" || status === "Upcoming")}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: (status === "Active" || status === "Upcoming") ? "#F8FAFC" : "#F3F4F6",
                color: (status === "Active" || status === "Upcoming") ? "#0F172A" : "#9CA3AF",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 800,
                fontSize: 14,
                cursor: (status === "Active" || status === "Upcoming") ? "pointer" : "not-allowed",
              }}
            >
              Add Calendar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard__content" style={{ paddingTop: 4, paddingBottom: 8 }}>
      <style>{styles.grid}</style>

      <section className="page-title-dashboard" style={{ marginBottom: 12 }}>
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              {/* Title + Search aligned like screenshot */}
              <div className="page-title-wrap">
                <div className="title-dashboard">
                  <div className="title-dash">MentorSphere</div>
                </div>
                <input
                  className="search-input"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
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
                {loading ? (
                  <div style={{ padding: 18 }}>Loading sessions…</div>
                ) : error ? (
                  <div style={{ color: "#b91c1c" }}>{error}</div>
                ) : filteredMeetings.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
                    No mentor sessions match your search.
                  </div>
                ) : (
                  <div className="mentor-grid">
                    {filteredMeetings
                      .slice() // defensive copy before sort
                      .sort((a, b) => {
                        const ta = buildStartDate(a.date, a.startTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
                        const tb = buildStartDate(b.date, b.startTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
                        return ta - tb;
                      })
                      .map((m) => (
                        <Card key={m.meetingId ?? m.meeting_id ?? m.id} m={m} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApplicantMentorConnect;
