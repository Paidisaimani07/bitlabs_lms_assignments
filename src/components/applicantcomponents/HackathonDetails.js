import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./hackathonDetails.css";
import { useUserContext } from "../common/UserProvider";
import { apiUrl } from "../../services/ApplicantAPIService";
import BackButton from "../common/BackButton";
import Snackbar from '../common/Snackbar';

const HackathonDetails = () => {
    const { id } = useParams();
    const { user } = useUserContext();
    const userId = user.id;
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [snackbars, setSnackbars] = useState([]);
    const [formData, setFormData] = useState({
        projectTitle: "",
        projectSummary: "",
        technologiesUsed: "",
        githubLink: "",
        demoLink: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const addSnackbar = (snackbar) => {
        const id = Date.now();
        setSnackbars((prevSnackbars) => [
            ...prevSnackbars,
            { ...snackbar, id }
        ]);

        setTimeout(() => {
            setSnackbars((prevSnackbars) =>
                prevSnackbars.filter((s) => s.id !== id)
            );
        }, 3000);
    };

    const handleCloseSnackbar = (id) => {
        setSnackbars((prevSnackbars) =>
            prevSnackbars.filter((snackbar) => snackbar.id !== id)
        );
    };


    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const response = await axios.get(
                    `${apiUrl}/api/hackathons/getHackathonDetails/${id}/${userId}`,
                    { headers: { Authorization: `Bearer ${jwtToken}` } }
                );
                setHackathon(response.data);
            } catch (error) {
                console.error("Error fetching hackathon details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHackathon();
    }, [id, userId]);

    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const res = await axios.get(
                    `${apiUrl}/hackathons/${id}/getRegistrationStatus/${userId}`,
                    { headers: { Authorization: `Bearer ${jwtToken}` } }
                );
                setRegistration(res.data);
            } catch (error) {
                console.error("Error while getting registration:", error);
                setRegistration(null);
            }
        };
        fetchRegistration();
    }, [id, userId]);

    const handleRegister = async () => {
        try {
            const jwtToken = localStorage.getItem("jwtToken");
            await axios.post(
                `${apiUrl}/hackathons/${id}/registerForHackathon/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${jwtToken}` } }
            );
            addSnackbar({ message: 'registration successful', type: 'success' });
            setRegistration({ registaratinStatus: true, submitStatus: false });
        } catch (err) {
            console.error(err);
            addSnackbar({ message: 'error while registring for the hackathon', type: 'error' });
        }
    };

    const handleSubmitClick = () => {
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!registration) return;

        const payload = {
            registrationId: registration.id,
            userId: userId,
            ...formData,
        };

        try {
            setSubmitting(true);
            const jwtToken = localStorage.getItem("jwtToken");
            await axios.post(`${apiUrl}/api/hackathons/${id}/submit`, payload, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            addSnackbar({ message: 'submitted successfully', type: 'success' });
            setRegistration({ ...registration, submitStatus: true });
            setShowForm(false);
        } catch (error) {
            console.error(error);
            addSnackbar({ message: 'error while submitting the response', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!hackathon) return <div>No hackathon found.</div>;

    const renderActionButton = () => {
        const status = hackathon.status.toUpperCase();

        if (!registration) {
            if (status === "UPCOMING" || status === "ACTIVE") {
                return (
                    <button className="view-button hackathon-action-button" onClick={handleRegister}>
                        Register
                    </button>
                );
            }

            if (status === "COMPLETED") {
                return (
                    <button className="view-button hackathon-action-button" disabled>
                        Not Registered
                    </button>
                );
            }
        }


        if (status === "COMPLETED") {
            return <button className="view-button hackathon-action-button" disabled>Completed</button>;
        }

        if (status === "UPCOMING" && registration.registaratinStatus) {
            return <button className="view-button hackathon-action-button" disabled>Already Registered</button>;
        }

        if (status === "ACTIVE") {
            if (!registration.submitStatus) {
                return (
                    <button className="view-button hackathon-action-button" onClick={handleSubmitClick}>
                        Submit Your Response
                    </button>
                );
            } else {
                return <button className="view-button hackathon-action-button" disabled>Response Submitted</button>;
            }
        }

        return null;
    };

    function toDateObject(value) {
        if (!value) return null;

        if (Array.isArray(value)) {
            const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nano = 0] = value;
            return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
        }

        return new Date(value);
    }

    function formatToDateString(value) {
        const date = toDateObject(value);
        return date && !isNaN(date.getTime()) ? date.toDateString() : "Invalid date";
    }



    return (<div className="dashboard__content">
        <div className="row mr-0 ml-10" style={{ marginRight: '2%' }}>
            <div className="hackathon-page-wrapper" style={{ display: "flex", gap: "30px", width: "96%", margin: "3% auto 0 auto" }}>

                <div
                    className="hackathon-details-wrapper"
                    style={{ flex: showForm ? 2 : 1, transition: "flex 0.3s" }}
                >
                    <div className="hackathon-top-section">
                        <BackButton className="hackathon-back-button" />
                        <h1 className="hackathon-title">{hackathon.title}</h1>
                    </div>

                    <div className="hackathon-body">
                        <div className="hackathon-left-column">
                            <section>
                                <h3>Description</h3>
                                <p>{hackathon.description}</p>
                            </section>

                            {hackathon.instructions && hackathon.instructions.trim() !== "" && (
                                <section>
                                    <h3>Instructions</h3>
                                    <ul>
                                        {hackathon.instructions.split("\n").map((line, index) => (
                                            <li key={index}>{line.replace(/^\d+\.\s*/, "")}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <div className="row side-by-side-section">
                                <div className="col-md-6">
                                    <section>
                                        <h3>Eligibility Criteria</h3>
                                        <div className="hackathon-tag-list">
                                            {hackathon.eligibility.split(",").map((item, index) => (
                                                <span key={index} className="hackathon-tag">{item.trim()}</span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="col-md-6">
                                    <section>
                                        <h3>Technologies to Use</h3>
                                        <div className="hackathon-tag-list">
                                            {hackathon.allowedTechnologies.split(",").map((tech, index) => (
                                                <span key={index} className="hackathon-tech-tag">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <div className="hackathon-right-column">
                            <div className="hackathon-banner-wrapper">
                                <img
                                    src={hackathon.bannerUrl}
                                    alt={hackathon.title}
                                    className="hackathon-banner"
                                    onError={(e) => (e.target.src = "https://via.placeholder.com/900x300?text=No+Image")}
                                />
                                <span className={`hackathon-status-badge ${hackathon.status.toLowerCase()}`}>
                                    {hackathon.status}
                                </span>
                            </div>
                            <section className="hackathon-info-box">
                                <div>
                                    <h3>Organized By</h3>
                                    <p>{hackathon.company}</p>
                                </div>
                                <div>
                                    <h3>Created Date</h3>
                                    <p>{formatToDateString(hackathon.createdAt)}</p>
                                </div>
                                <div>
                                    <h3>Start Date</h3>
                                    <p>{formatToDateString(hackathon.startAt)}</p>
                                </div>
                                <div>
                                    <h3>End Date</h3>
                                    <p>{formatToDateString(hackathon.endAt)}</p>
                                </div>

                            </section>

                            <div className="newCard-footer">{renderActionButton()}</div>
                        </div>
                    </div>
                </div>

                {showForm && !registration.submitStatus && (
                    <div
                        className="submit"
                        style={{
                            position: "relative",
                            flex: 1,
                            padding: "20px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            background: "#fff",
                            maxHeight: "fit-content",
                            transition: "all 0.3s",
                            marginTop: "7%",
                        }}
                    >
                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => setShowForm(false)}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "transparent",
                                border: "none",
                                fontSize: "20px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                color: "#666",
                                fontSize: "28px",
                            }}
                        >
                            ×
                        </button>
                        <h3>Submit Your Project</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label className="required">Project Title</label>
                                <input
                                    type="text"
                                    name="projectTitle"
                                    value={formData.projectTitle}
                                    onChange={handleFormChange}
                                    required
                                    minLength={5}
                                    maxLength={100}
                                    placeholder={hackathon?.title ? `${hackathon.title}` : "Enter a project title"}
                                />
                            </div>

                            <div className="form-group">
                                <label className="required">Project Summary</label>
                                <textarea
                                    name="projectSummary"
                                    value={formData.projectSummary}
                                    onChange={handleFormChange}
                                    required
                                    minLength={20}
                                    maxLength={1000}
                                    placeholder="Brefily explain your project"
                                />
                            </div>

                            <div className="form-group">
                                <label className="required">Technologies Used</label>
                                <input
                                    type="text"
                                    name="technologiesUsed"
                                    value={formData.technologiesUsed}
                                    onChange={handleFormChange}
                                    required
                                    minLength={1}
                                    maxLength={100}
                                    placeholder="Eg: C, Java"
                                />
                            </div>

                            <div className="form-group">
                                <label className="required">GitHub Link</label>
                                <input
                                    type="url"
                                    name="githubLink"
                                    value={formData.githubLink}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter a valid GitHub repository URL"
                                    pattern="https?://.+"
                                />
                            </div>

                            <div className="form-group">
                                <label>Demo Link</label>
                                <input
                                    type="url"
                                    name="demoLink"
                                    value={formData.demoLink}
                                    onChange={handleFormChange}
                                    placeholder="Enter a valid demo URL (optional)"
                                    pattern="https?://.+"
                                />
                            </div>

                            <div className="newCard-footer">
                                <button
                                    className="view-button hackathon-action-button"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {snackbars.map((snackbar) => (
                    <Snackbar
                        key={snackbar.id}
                        id={snackbar.id}
                        message={snackbar.message}
                        type={snackbar.type}
                        onClose={handleCloseSnackbar}
                        link={snackbar.link}
                        linkText={snackbar.linkText}
                    />
                ))}
            </div>
        </div>
    </div>
    );
};

export default HackathonDetails;
