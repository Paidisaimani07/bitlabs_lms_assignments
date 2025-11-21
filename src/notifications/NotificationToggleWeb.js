import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../services/ApplicantAPIService";
import { generateToken, deleteFcmTokenWeb } from "../notifications/firebase";
import { saveFcmTokenWeb } from "../notifications/notificationWeb";
import { useUserContext } from "../components/common/UserProvider";
import { LiaBell, LiaBellSlash } from "react-icons/lia";

export default function NotificationToggleWeb() {
  const { user } = useUserContext();

  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("notificationsMuted");
    return saved === "true";
  });

  const jwt = localStorage.getItem("jwtToken");
  const applicantId = user.id;

  useEffect(() => {
    // Optionally fetch initial mute state from server here
  }, []);

  const updateServerMute = async (isMuted, fcmToken = null) => {
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
      // 🔓 UNMUTE
      console.log("🔓 Unmuting notifications...");
      const fcmToken = await generateToken();
      if (fcmToken) {
        try {
          await saveFcmTokenWeb(applicantId, jwt, fcmToken); // ✅ pass token directly
          await updateServerMute(false, fcmToken);
        } catch (e) {
          console.error("❌ Error saving token on unmute:", e);
        }
      } else {
        console.warn("⚠️ Unable to generate token on unmute.");
      }
    } else {
      // 🔒 MUTE
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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
      }}
      onClick={handleToggle}
      onMouseEnter={(e) => {
        e.currentTarget.querySelector("span").style.color = "#f97316";
        e.currentTarget.querySelector("p").style.color = "#f97316";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.querySelector("span").style.color = muted ? "gray" : "black";
        e.currentTarget.querySelector("p").style.color = muted ? "gray" : "black";
      }}
    >
      <div aria-live="polite">
        {muted ? (
          <span style={{ color: "gray" }}>
            <LiaBellSlash />
          </span>
        ) : (
          <span style={{ color: "black" }}>
            <LiaBell />
          </span>
        )}
      </div>
      <p
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          color: muted ? "gray" : "black",
        }}
      >
        {muted ? "Unmute Notifications" : "Mute Notifications"}
      </p>
    </div>
  );
}
