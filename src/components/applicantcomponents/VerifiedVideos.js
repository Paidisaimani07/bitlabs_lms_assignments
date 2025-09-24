import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";

const VerifiedVideos = () => {
  const { user } = useUserContext();
  const userId = user.id;

  const [videoList, setVideoList] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
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

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        console.log("JWT Token:", jwtToken); // Debug token
        const res = await axios.get(`${apiUrl}/videos/recommended/${userId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        console.log("API Response:", res.data); // Debug API response

        if (res.data.length > 0) {
          const withThumbs = res.data.map((video) => ({
            ...video,
            thumbnailUrl: video.thumbnail_url || "/images/dummy-thumb.jpg",
          }));
          setVideoList(withThumbs);
          setFilteredVideos(withThumbs);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userId]);

  useEffect(() => {
    let filtered = videoList;

    if (search.trim()) {
      filtered = filtered.filter((video) =>
        video.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter !== "All") {
      filtered = filtered.filter((video) =>
        video.tags?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    console.log("Filtered Videos:", filtered); // Debug filtered videos
    setFilteredVideos(filtered);
  }, [search, filter, videoList]);

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
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={styles.headerSectionVideos}>
        <h2
          style={{
            ...styles.heading,
            marginLeft: isWide ? "330px" : "0px",
          }}
        >
          Trending Technologies<span style={{ color: "orange" }}>Videos</span>
        </h2>

        <div style={styles.searchFilterWrapper}>
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderWrapper}>
          <div style={styles.loader}></div>
          <p style={{ marginTop: "10px", fontWeight: "500" }}>
            Loading videos...
          </p>
        </div>
      ) : (
        <div
          style={{
            ...styles.grid,
            marginLeft: isWide ? "25%" : "20px",
          }}
        >
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => (
              <div key={video.videoId || index} style={styles.card}>
                <div style={styles.playerWrapper}>
                  <ReactPlayer
                    url={video.s3url}
                    playing={playingIndex === index}
                    controls
                    muted
                    width="100%"
                    height="200px"
                    light={video.thumbnailUrl || true}
                    playIcon={<div style={styles.playButton}>▶</div>}
                    onClickPreview={() => setPlayingIndex(index)}
                    onEnded={() => handleEnded(video.videoId)}
                    onError={(e) => console.error("Video error:", e, video.s3url)}
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

                <div style={styles.videoMeta}>
                  <img
                    src="images/favicon.png"
                    alt="channel"
                    style={styles.avatar}
                  />
                  <p style={styles.title}>
                    {video.title || `Video ${index + 1}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ marginTop: "30px", fontWeight: "500" }}>
              No videos found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "sans-serif",
  },
  headerSectionVideos: {
    marginTop: "70px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "15px",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "bold",
  },
  searchFilterWrapper: {
    display: "flex",
    gap: "10px",
    backgroundColor: "#f9f9f9",
    padding: "8px 12px",
    borderRadius: "8px",
  },
  searchInput: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "200px",
  },
  filterSelect: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    justifyItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "350px",
    textAlign: "left",
    marginBottom: "30px",
  },
  playerWrapper: {
    borderRadius: "10px",
    position: "relative",
  },
  playButton: {
    fontSize: "40px",
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: "50%",
    padding: "15px",
    cursor: "pointer",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  videoMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#ddd",
  },
  title: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111",
    lineHeight: "1.8",
  },
  loaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "250px",
  },
  loader: {
    border: "6px solid #f3f3f3",
    borderTop: "6px solid orange",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  },
};

export default VerifiedVideos;