import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./ApplicantBlog.css";
import { IoArrowForwardCircleSharp } from "react-icons/io5";

export default function ApplicantBlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        const res = await axios.get(`${apiUrl}/blogs/active`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setBlogs(res.data);
        setFilteredBlogs(res.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    }
    fetchBlogs();
  }, []);

  const formatDate = (arr) => {
    if (!arr || arr.length < 6) return "";
    const [year, month, day, hour, min, sec] = arr;
    return new Date(year, month - 1, day, hour, min, sec).toLocaleDateString();
  };

  const handleLearnMore = (blogId) => {
    navigate(`/blogs/${blogId}`);
    
  };

  // If single blog view
  if (id) {
    const blog = blogs.find((b) => String(b.id) === id);
    if (!blog) return <p className="text-center mt-20">Loading...</p>;

    return (
      <div className="blog-full-view container mx-auto px-6 py-8">
        <div className="card shadow-sm blog-card full-blog flex flex-col md:flex-row gap-6 p-6">
          {/* Left Side */}
          <div className="flex-1 pr-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="blog-full-title">{blog.title}</h2>
              <p className="text-gray-500 text-sm">
                {blog.author} • {formatDate(blog.createdAt)}
              </p>
            </div>

            {/* Description as bullet points */}
            <div className="space-y-2 mb-6">
              {blog.description
                ?.split(".")
                .filter((s) => s.trim() !== "")
                .map((sentence, idx) => (
                  <p
                    key={idx}
                    className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500 text-base leading-relaxed"
                  >
                    {sentence.trim()}.
                  </p>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-3">
              {blog.content
                ?.split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, idx) => (
                  <p
                    key={idx}
                    className={`${
                      line.startsWith("##")
                        ? "font-semibold text-lg mt-4"
                        : line.startsWith("-")
                        ? "pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500"
                        : "text-base leading-relaxed"
                    }`}
                  >
                    {line.replace(/^##\s*/, "").replace(/^-/, "").trim()}
                  </p>
                ))}
            </div>

            {/* Back */}
            <div
              className="resumecard-button mt-6"
              onClick={() => navigate("/blogs")}
            >
              <Link className="button-link1">
                <span className="button button-custom">Back</span>
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="rounded-lg object-contain w-full h-auto max-h-[45vh]"
            />
          </div>
        </div>
      </div>
    );
  }

  // Blogs Grid
  return (
    <div className="dashboard__content">
      <div className="blogs-containerss">
        <div className="blogs-grid">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="blog-card-modern">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="blog-img-modern"
              />
              <div className="blog-content">
                <h4 className="blog-title">{blog.title}</h4>
                <button
                  className="learn-more-btn"
                  onClick={() => handleLearnMore(blog.id)}
                >
                  <span className="btn-text">Learn More</span>
                  <span className="btn-arrow"><IoArrowForwardCircleSharp />

</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
