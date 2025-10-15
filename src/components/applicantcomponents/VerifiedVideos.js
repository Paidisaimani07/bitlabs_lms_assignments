import React, { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import "./VerifiedVideos.css";

const preloadAll = true;

const VerifiedVideos = () => {
  const { user } = useUserContext();
  const userId = user.id;
  const inputRef = useRef(null);
  const [videoList, setVideoList] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [tags, setTags] = useState(["All"]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isWide, setIsWide] = useState(window.innerWidth >= 1300);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerBuffering, setPlayerBuffering] = useState(false);
  const [durations, setDurations] = useState({}); // store videoId → duration

  const playerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 1300);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch videos
  useEffect(() => {
    let mounted = true;
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        const res = await axios.get(`${apiUrl}/videos/recommended/${userId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (!mounted) return;
        const data = res.data || [];

        const normalized = data.map((v, idx) => ({
          videoId: v.videoId ?? idx,
          title: v.title ?? `Video ${idx + 1}`,
          s3url: v.s3url,
          thumbnail_url: v.thumbnail_url,
          tags: v.tags ?? "",
        }));

        setVideoList(normalized);
        setFilteredVideos(normalized);

        const uniqueTags = [
          "All",
          ...new Set(normalized.map((v) => v.tags?.trim().toLowerCase()).filter(Boolean)),
        ];
        const formattedTags = uniqueTags.map((t) =>
          t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)
        );
        setTags(formattedTags);

        if (preloadAll) {
          normalized.forEach((v) => {
            if (v.s3url) {
              const hv = document.createElement("video");
              hv.src = v.s3url;
              hv.preload = "auto";
              hv.muted = true;
              hv.style.display = "none";
              document.body.appendChild(hv);
            }
          });
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // search & filter
  useEffect(() => {
    let filtered = [...videoList];
    if (search.trim()) {
      filtered = filtered.filter((video) =>
        video.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter !== "All") {
      filtered = filtered.filter(
        (video) => (video.tags ?? "").trim().toLowerCase() === filter.toLowerCase()
      );
    }
    setFilteredVideos(filtered);
  }, [search, filter, videoList]);

  const handleProgress = (progress, videoId, index) => {
    if (progress.played >= 0.7 && !watchedVideos[videoId]) {
      handleEnded(videoId);
      setFilteredVideos((prev) => {
        const updated = [...prev];
        const watchedVideo = updated.splice(index, 1)[0];
        updated.push(watchedVideo);
        return updated;
      });
    }
  };

  const handleEnded = async (videoId) => {
    if (watchedVideos[videoId]) return;
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      await axios.post(
        `${apiUrl}/api/video-watch/track`,
        { applicantId: userId, videoId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setWatchedVideos((prev) => ({ ...prev, [videoId]: true }));
    } catch (err) {
      console.error("Failed to log watch:", err);
    }
  };

  const handleOpenPlayer = (index) => {
    setPlayingIndex(index);
    setPlayerReady(false);
    setPlayerBuffering(true);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setPlayingIndex(null);
    setPlayerReady(false);
    setPlayerBuffering(false);
    document.body.style.overflow = "";
  };

  const onPlayerReady = () => {
    setPlayerReady(true);
    setPlayerBuffering(false);
  };

  const onBuffer = () => setPlayerBuffering(true);
  const onBufferEnd = () => setPlayerBuffering(false);

  return (
    <div className="oneminute-container">
      <div className="oneminute-header">
        <h2
          className="oneminute-heading"
          style={{ marginLeft: isWide ? "330px" : "0px" }}
        >
          TechBuzz  <span className="oneminute-orange">Shorts</span>
        </h2>

        <div className="oneminute-search-wrapper">
          <i className="fa fa-search search-icon"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="oneminute-search-input"
          />
          {search && (
            <i
              className="fa fa-times clear-icon"
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
            ></i>
          )}
        </div>
      </div>

      {loading ? (
        <div className="oneminute-loader-wrapper">
          <div className="oneminute-loader"></div>
          <p>Loading videos...</p>
        </div>
      ) : (
        <div
          className="oneminute-grid"
          style={{ marginLeft: isWide ? "25%" : "20px" }}
        >
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => {
              const isPlayingCard = playingIndex === index && modalOpen;
              return (
                <div
                  key={video.videoId || index}
                  className={`oneminute-card ${isPlayingCard ? "playing-card" : ""}`}
                >
                  <div className="oneminute-player-wrapper">
                    <div onClick={() => handleOpenPlayer(index)} className="thumb-wrapper">
                      <img
                        src={video.thumbnail_url || "/images/default-thumb.png"}
                        alt={video.title}
                        className="oneminute-thumb"
                        draggable={false}
                      />
                    </div>
                  </div>

                  <div className="oneminute-video-meta">
                    <img
                      src="/images/favicon.png"
                      alt="channel"
                      className="oneminute-avatar"
                    />
                    <div className="meta-texts">
                      <p className="oneminute-title">
                        {video.title || `Video ${index + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No videos found.</p>
          )}
        </div>
      )}

      {modalOpen && playingIndex !== null && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div
            className="oneminute-modal-content"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {playerBuffering && (
              <div className="modal-spinner">
                <div className="spinner"></div>
                <div className="buffer-text">Buffering...</div>
              </div>
            )}

            <ReactPlayer
              ref={playerRef}
              url={filteredVideos[playingIndex].s3url}
              playing={true}
              controls={true}
              width="100%"
              height="100%"
              onReady={onPlayerReady}
              onBuffer={onBuffer}
              onBufferEnd={onBufferEnd}
              onEnded={closeModal}
              onProgress={(progress) =>
                handleProgress(progress, filteredVideos[playingIndex].videoId, playingIndex)
              }
              onDuration={(d) =>
                setDurations((prev) => ({
                  ...prev,
                  [filteredVideos[playingIndex].videoId]: d,
                }))
              }
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                    disablePictureInPicture: true,
                    preload: "auto",
                    playsInline: true,
                  },
                },
              }}
            />
            <button className="oneminute-modal-close" onClick={closeModal} aria-label="Close" style={{ borderRadius: '20px' }}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedVideos;
