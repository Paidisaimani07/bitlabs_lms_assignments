import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import "./VerifiedVideos.css";

const VerifiedVideos = () => {
  const { user } = useUserContext();
  const userId = user.id;

  const [videoList, setVideoList] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [tags, setTags] = useState(["All"]); // ✅ will update from API
  const [playingIndex, setPlayingIndex] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [isWide, setIsWide] = useState(window.innerWidth >= 1300);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 1300);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        const res = await axios.get(`${apiUrl}/videos/recommended/${userId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (res.data.length > 0) {
          setVideoList(res.data);
          setFilteredVideos(res.data);

          // ✅ Extract unique tags from API response
          const uniqueTags = [
            "All",
            ...new Set(
              res.data
                .map((v) => v.tags?.trim().toLowerCase()) // normalize
                .filter(Boolean)
            ),
          ];

          // ✅ Capitalize (beginner → Beginner)
          const formattedTags = uniqueTags.map(
            (t) => t.charAt(0).toUpperCase() + t.slice(1)
          );

          setTags(formattedTags);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userId]);

  // ✅ Apply search & filter
  useEffect(() => {
    let filtered = videoList;

    if (search.trim()) {
      filtered = filtered.filter((video) =>
        video.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter !== "All") {
      filtered = filtered.filter(
        (video) => video.tags?.trim().toLowerCase() === filter.toLowerCase()
      );
    }

    setFilteredVideos(filtered);
  }, [search, filter, videoList]);

  // ✅ Track watched
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

  return (
    <div className="oneminute-container">
      {/* ✅ Header */}
      <div className="oneminute-header">
        <h2
          className="oneminute-heading"
          style={{ marginLeft: isWide ? "330px" : "0px" }}
        >
          Trending Technologies{" "}
          <span className="oneminute-orange">Videos</span>
        </h2>

        <div className="oneminute-search-filter">
          <input
            type="text"
            placeholder="Search videos by Title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="oneminute-search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="oneminute-filter-select"
          >
            {tags.map((tag, i) => (
              <option key={i} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ Loader */}
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
            filteredVideos.map((video, index) => (
              <div key={video.videoId || index} className="oneminute-card">
                <div className="oneminute-player-wrapper">
                  <ReactPlayer
                    url={video.s3url}
                    playing={playingIndex === index}
                    controls
                    muted
                    width="100%"
                    height="200px"
                    light={video.thumbnail_url}
                    playIcon={<div className="oneminute-play-btn">▶</div>}
                    onClickPreview={() => setPlayingIndex(index)}
                    onEnded={() => handleEnded(video.videoId)}
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload",
                          disablePictureInPicture: true,
                          preload: "auto",
                        },
                      },
                    }}
                  />
                </div>

                {/* ✅ Meta */}
                <div className="oneminute-video-meta">
                  <img
                    src="/images/favicon.png"
                    alt="channel"
                    className="oneminute-avatar"
                  />
                  <p className="oneminute-title">
                    {video.title || `Video ${index + 1}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No videos found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifiedVideos;
