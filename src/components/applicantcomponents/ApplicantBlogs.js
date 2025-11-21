import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useLocation } from "react-router-dom";
import "./ApplicantBlog.css";

export default function ApplicantBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const lastFocused = useRef(null);
  const location = useLocation();
  const hasAutoOpened = useRef(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 15;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        const res = await axios.get(
          `${apiUrl}/blogs/active?page=${page}&size=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );

        const newBlogs = res.data.content || res.data || [];

        if (!ignore) {
          if (page === 0) {
            setBlogs(newBlogs);
          } else {
            setBlogs((prev) => [...prev, ...newBlogs]);
          }
          setHasMore(!res.data.last && newBlogs.length >= pageSize);
        }
      } catch (e) {
        console.error("Error fetching blogs:", e);
        setError(
          "Failed to load blogs. Please check your connection or try again later."
        );
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const filteredBlogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [blogs, query]);

  const formatDate = (arr) => {
    if (!arr || arr.length < 6) return "";
    const [y, m, d, h, mi, s] = arr;
    return new Date(y, m - 1, d, h, mi, s).toLocaleDateString();
  };

  // Modal controls
  const openModal = (blog) => {
    lastFocused.current = document.activeElement;
    setSelected(blog);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setSelected(null);
    document.body.style.overflow = "";
    lastFocused.current?.focus?.();
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const blogId = params.get("blog");
    if (!blogId || !blogs.length || selected || hasAutoOpened.current) return;


    const blog = blogs.find(b => String(b.id) === blogId);
    if (blog) {
      hasAutoOpened.current = true;
      setTimeout(() => openModal(blog), 0);
      window.history.replaceState({}, '', '/applicant-blog-list');
    }
  }, [blogs, location.search, selected, openModal]);
  useEffect(() => {
    return () => {
      hasAutoOpened.current = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && selected && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="border-style">

      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        {/* Title + Search */}
        <div className="row extraSpace">
          <div className="col-lg-12 col-md-12">
            <div className="main-header-row">
              <h1 className="main-heading">TechVibes</h1>

              <div className="hackathon-search-box">
                <i className="fa fa-search search-icon1"></i>
                <input
                  type="text"
                  placeholder="Search TechVibes"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="hackathon-search-input"
                />
                {query && (
                  <i
                    className="fa fa-times clear-icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery("")}
                  ></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* error in Ui */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        {/* Card Grid */}
        <div className="tv-grid">
          {filteredBlogs.map((b) => (
            <article
              key={b.id}
              className="tv-card"
              onClick={() => openModal(b)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openModal(b)}
            >
              <div className="tv-media">
                <img src={b.imageUrl} alt={b.title} loading="lazy" />
              </div>

              <div className="tv-content">
                <h4 className="tv-card-title">{b.title}</h4>
                <div className="tv-footer">
                  <div className="tv-meta">
                    <span className="tv-by">By {b.author || "bitLabs"}</span>
                    <span className="tv-dot">•</span>
                    <span className="tv-date">{formatDate(b.createdAt)}</span>
                  </div>

                  {/* Orange SVG Icon Button (opens popup) */}
                  <button
                    className="tv-open"
                    title="Preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(b);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                          <path d="M18,10.82a1,1,0,0,0-1,1V19a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V8A1,1,0,0,1,5,7h7.18a1,1,0,1,0,0-2H5A3,3,0,0,0,2,8V19a3,3,0,0,0,3,3H16a3,3,0,0,0,3-3V11.82A1,1,0,0,0,18,10.82Zm3.92-8.2A1.015,1.015,0,0,0,21,2H15a1,1,0,0,0,0,2h3.59L8.29,14.29a1,1,0,1,0,1.42,1.42L20,5.41V9a1,1,0,0,0,2,0V3a1,1,0,0,0-.08-.38Z" transform="translate(-2 -2)" fill="#e87316"/>
                        </svg>
                      `,
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* Popup Modal */}
        {selected && (
          <div className="tv-modal-overlay" onClick={closeModal} aria-modal="true" role="dialog">
            <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
              <button className="tv-modal-close" onClick={closeModal} aria-label="Close"
                dangerouslySetInnerHTML={{
                  __html: `
   <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<circle cx="12" cy="12" r="9" fill="#2A4157" fill-opacity="0.24"/>
<path d="M16 8L8 16" stroke="#222222" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 8L16 16" stroke="#222222" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `,
                }}
              ></button>


              <div className="tv-modal-header">
                <div className="tv-modal-thumb">
                  <img src={selected.imageUrl} alt={selected.title} />
                </div>
                <div className="tv-modal-headtext">
                  <h3 className="tv-modal-title">{selected.title}</h3>
                  <div className="tv-meta">
                    <span className="tv-by">By {selected.author || "bitLabs"}</span>
                    <span className="tv-dot">•</span>
                    <span className="tv-date">{formatDate(selected.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="tv-modal-body">
                {selected.description && <p className="tv-modal-desc">{selected.description}</p>}
                {selected.content && (
                  <div className="tv-modal-content">
                    {selected.content.split("\n").filter(Boolean).map((line, i) => (
                      <p key={i} className={
                        line.startsWith("##") ? "tv-h2" :
                          line.startsWith("-") ? "tv-bullet" : "tv-p"
                      }>
                        {line.replace(/^##\s*/, "").replace(/^-/, "").trim()}
                      </p>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        )}
      </div>
    </div>
  );
}
