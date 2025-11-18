// src/notifications/NotificationToggleWeb.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../services/ApplicantAPIService";
import { generateToken, deleteFcmTokenWeb } from "./firebase";
import { saveFcmTokenWeb } from "./notificationWeb";
import { useUserContext } from "../components/common/UserProvider";
import { LiaBell, LiaBellSlash } from "react-icons/lia";

export default function NotificationToggleWeb() {
  const { user } = useUserContext();

  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("notificationsMuted");
    return saved === "true";
  });

  const [hovered, setHovered] = useState(false);
  const jwt = localStorage.getItem("jwtToken");
  const applicantId = user?.id; // safe guard

  useEffect(() => {
    // Optionally fetch initial mute state from server here
  }, []);

  const updateServerMute = async (isMuted, fcmToken = null) => {
    if (!applicantId) {
      console.warn("NotificationToggleWeb: no applicantId available yet.");
      return;
    }
    try {
      const endpoint = `${apiUrl}/notification/${isMuted ? "mute" : "unmute"}/${applicantId}`;
      const payload = { fcmToken };
      console.log("📡 Updating server mute state:", { isMuted, fcmToken, endpoint });
      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("✅ Server mute state updated");
    } catch (err) {
      console.error("❌ Failed to update server mute state:", err?.response?.data || err.message);
    }
  };

  const handleToggle = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem("notificationsMuted", newMuted ? "true" : "false");

    if (!newMuted) {
      // UNMUTE
      console.log("🔓 Unmuting notifications...");
      const fcmToken = await generateToken();
      if (fcmToken) {
        try {
          await saveFcmTokenWeb(applicantId, jwt, fcmToken);
          await updateServerMute(false, fcmToken);
        } catch (e) {
          console.error("❌ Error saving token on unmute:", e);
        }
      } else {
        console.warn("⚠️ Unable to generate token on unmute.");
      }
    } else {
      // MUTE
      console.log("🔒 Muting notifications...");
      try {
        const ok = await deleteFcmTokenWeb();
        if (ok) {
          await updateServerMute(true, null);
        }
      } catch (e) {
        console.error("❌ Error deleting token on mute:", e);
      }
    }
  };

  // Styling values
  const labelFontSize = 12; // <--- change this number to make label smaller/larger

  return (
    <div
      role="button"
      aria-pressed={muted}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
      onClick={handleToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
      }}
    >
      <div aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>
        {muted ? <LiaBellSlash /> : <LiaBell />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontSize: labelFontSize,
            color: hovered ? "#F97316" : (muted ? "gray" : "#111"),
            fontWeight: 600,
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {muted ? "Unmute Notifications" : "Mute Notifications"}
        </span>
        {/* optional smaller subtext (comment out if not needed)
        <small style={{ fontSize: 10, color: "#888", marginTop: 2 }}>Receive job alerts</small>
        */}
      </div>
    </div>
  );
}
