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
  const [durations, setDurations] = useState({});

  const playerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 1300);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          TechBuzz Shorts
        </h2>

 <div>
  <input
    ref={inputRef}
    type="text"
    placeholder="Search"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="search-input"
  />
  {search && (
    <i
      className="fa fa-times clear-icon"
      onClick={() => {
        setSearch("");
        inputRef.current?.focus();
      }}
      aria-label="Clear search"
    />
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
  <button
    type="button"
    className="thumb-button"
    onClick={() => handleOpenPlayer(index)}
    aria-label={`Play ${video.title || `Video ${index + 1}`}`}
  >
    <img
      src={video.thumbnail_url || "/images/default-thumb.png"}
      alt={video.title}
      className="oneminute-thumb"
      draggable={false}
    />
  </button>
</div>


                  <div className="oneminute-video-meta">
                   {/* Replace the existing <img src="/images/favicon.png" ... /> with this SVG */}
<svg
  width="36.155"
  height="31.211"
  viewBox="0 0 36.155 31.211"
  className="oneminute-avatar"
  aria-hidden="true"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="linear-gradient" y1="0.093" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0" stopColor="#f8af50" />
      <stop offset="1" stopColor="#e76d10" />
    </linearGradient>
  </defs>
  <g transform="translate(0 -35)">
    <g transform="translate(0 35)">
      <g transform="translate(0 0)">
        <path
          d="M30.031,35H6.131A6.134,6.134,0,0,0,0,41.131V60.08a6.13,6.13,0,0,0,6.131,6.131H30.024a6.13,6.13,0,0,0,6.131-6.131V41.131A6.124,6.124,0,0,0,30.031,35ZM16.3,37.86a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953v1.66a.954.954,0,0,1-.953.953h-1.66a.954.954,0,0,1-.953-.953Zm-6.583,0a.957.957,0,0,1,.946-.953h1.66a.953.953,0,0,1,.953.946V39.52a.954.954,0,0,1-.953.953h-1.66a.948.948,0,0,1-.946-.953ZM6.7,63.358a.954.954,0,0,1-.953.953H4.082a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953h1.66A.954.954,0,0,1,6.7,61.7Zm0-23.837a.948.948,0,0,1-.953.946H4.082a.953.953,0,0,1-.953-.946V37.86a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Zm6.583,23.837a.953.953,0,0,1-.946.953H10.665a.954.954,0,0,1-.953-.953V61.7a.948.948,0,0,1,.953-.946h1.66a.953.953,0,0,1,.953.946ZM11.654,54.91v-8.6a3.059,3.059,0,0,1,4.584-2.649l7.451,4.3a3.056,3.056,0,0,1,0,5.29l-7.451,4.3a3.053,3.053,0,0,1-4.584-2.642Zm8.207,8.447a.954.954,0,0,1-.953.953h-1.66a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Zm6.583,0a.957.957,0,0,1-.946.953h-1.66a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953H25.5a.948.948,0,0,1,.946.953Zm0-23.837a.957.957,0,0,1-.946.953h-1.66a.957.957,0,0,1-.953-.946V37.86a.954.954,0,0,1,.953-.953H25.5a.954.954,0,0,1,.953.953Zm6.583,23.837a.954.954,0,0,1-.953.953h-1.66a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Zm0-23.837a.954.954,0,0,1-.953.953h-1.66a.953.953,0,0,1-.953-.946V37.86a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Z"
          transform="translate(0 -35)"
          fill="url(#linear-gradient)"
        />
      </g>
    </g>
  </g>
</svg>

                    <div className="meta-texts">
                      <p className="oneminute-title">{video.title}</p>
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
            <button
              className="oneminute-modal-close"
              onClick={closeModal}
              aria-label="Close"
              style={{ borderRadius: "20px" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedVideos;
