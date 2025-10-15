import React, { useEffect, useState, useRef } from "react";
import "./hackathon.css";
import { apiUrl } from "../../services/ApplicantAPIService";
import axios from "axios";
import { useUserContext } from "../common/UserProvider";
import { useNavigate } from "react-router-dom";

const Hackathon = () => {
    const [hackathons, setHackathons] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [winners, setWinners] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem("applicantHackathonTab") || "MY");
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef(null);

    const { user } = useUserContext();
    const userId = user.id;
    const navigate = useNavigate();

    const emptyMessages = {
        MY: "Looks like you’re not in any hackathons — tap the button and discover exciting ones now!",
        RECOMMENDED: "No perfect match found? No worries — dive into other hackathons and keep the momentum going",
        ACTIVE: "Looks like there are no active hackathons at the moment — discover what’s coming next!",
        UPCOMING: "Looks like nothing’s coming up soon — see which hackathons are active now!",
        COMPLETED: "No hackathons have been completed yet — explore some active ones while you wait!"
    };

    const getApiUrlByTab = (tabKey) => {
        switch (tabKey) {
            case "RECOMMENDED": return `${apiUrl}/api/hackathons/recommended/${userId}`;
            case "ACTIVE": return `${apiUrl}/api/hackathons/active`;
            case "UPCOMING": return `${apiUrl}/api/hackathons/upcoming`;
            case "COMPLETED": return `${apiUrl}/api/hackathons/completed`;
            case "MY":
            default: return `${apiUrl}/api/hackathons/getApplicantRegisteredHackathons/${userId}`;
        }
    };

    const getEmptyImageByTab = (tabKey) => {
        switch (tabKey) {
            case "MY":
                return `/images/hackathon/empty-my.png`;
            case "RECOMMENDED":
                return `/images/hackathon/empty-recommended.png`;
            case "ACTIVE":
                return `/images/hackathon/empty-active.png`;
            case "UPCOMING":
                return `/images/hackathon/empty-upcoming.png`;
            case "COMPLETED":
                return `/images/hackathon/empty-completed.png`;
            default:
                return '';
        }
    };

    const getCtaTargetTab = (tabKey) => {
        if (tabKey === "ACTIVE") return "UPCOMING";
        if (tabKey === "UPCOMING") return "ACTIVE";
        return "ACTIVE";
    };

    const getEmptyImageSize = (tabKey) => {
        if (tabKey === "MY" || tabKey === "ACTIVE" || tabKey === "UPCOMING") return 300;
        return 220;
    };

    const toDateObject = (value) => {
        if (!value) return new Date(0);
        if (Array.isArray(value)) {
            const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nano = 0] = value;
            return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
        }
        return new Date(value);
    };

    const fetchHackathons = async (tabKey) => {
        try {
            setLoading(true);
            const jwtToken = localStorage.getItem("jwtToken");

            const hackathonsRes = await axios.get(getApiUrlByTab(tabKey), {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });

            const normalized = hackathonsRes.data.map(h => ({
                ...h,
                createdAt: h.createdAt ? new Date(h.createdAt).getTime() : 0,
            }));
            if (tabKey === "MY") {
                const actives = normalized.filter(h => h.status === "ACTIVE")
                    .sort((a, b) => toDateObject(a.endAt) - toDateObject(b.endAt));
                const upcoming = normalized.filter(h => h.status === "UPCOMING")
                    .sort((a, b) => toDateObject(a.startAt) - toDateObject(b.startAt));
                const completed = normalized.filter(h => h.status === "COMPLETED");
                setHackathons([...actives, ...upcoming, ...completed]);
            } else {
                setHackathons(normalized.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            }

            if (tabKey === "COMPLETED" || tabKey === "MY") {
                const winnerIds = [...new Set(normalized.map(h => h.winner).filter(Boolean))];
                if (winnerIds.length > 0) {
                    axios.post(
                        `${apiUrl}/applicant-image/hackathon/winners`,
                        winnerIds,
                        { headers: { Authorization: `Bearer ${jwtToken}` } }
                    )
                        .then(winnersRes => {
                            const winnersMap = {};
                            winnersRes.data.forEach(w => {
                                winnersMap[w.applicantId] = w;
                            });
                            setWinners(winnersMap);
                        })
                        .catch(err => {
                            console.error("Error fetching winners:", err);
                            setWinners({});
                        });
                } else {
                    setWinners({});
                }
            } else {
                setWinners({});
            }

        } catch (error) {
            console.error("Error fetching hackathons:", error);
            setHackathons([]);
            setWinners({});
        } finally {
            setLoading(false);
        }
    };


    const fetchRegistrations = async () => {
        try {
            const jwtToken = localStorage.getItem("jwtToken");
            const response = await axios.get(
                `${apiUrl}/hackathons/${userId}/getAllRegistrationStatus`,
                { headers: { Authorization: `Bearer ${jwtToken}` } }
            );
            setRegistrations(response.data || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            setRegistrations([]);
        }
    };

    useEffect(() => {
        setSearchQuery("");
        fetchHackathons(statusFilter);
        fetchRegistrations();
    }, [statusFilter]);

    useEffect(() => {
        try {
            localStorage.setItem("applicantHackathonTab", statusFilter);
        } catch (_) {}
    }, [statusFilter]);

    const filteredHackathons = hackathons.filter(h => {
        const titleMatch = h.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const techMatch = h.allowedTechnologies?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || techMatch;
    });

    const handleViewClick = (hackathonId) => navigate(`/applicant-hackathon-details/${hackathonId}`);

    const getRegistrationStatus = (hackathonId) => {
        const reg = registrations.find(r => r.hackathonId === hackathonId);
        if (!reg) return null;
        if (reg.submitStatus) return "Submitted";
        if (reg.registaratinStatus) return "Registered";
        return null;
    };

    return (
        <div className="dashboard__content">
            <div className="row mr-0 ml-10" style={{ marginRight: "2%" }}>
                <div className="header-container">
                    <div className="status-tabs">
                        {[
                            { key: "MY", label: "My Arena" },
                            { key: "RECOMMENDED", label: "Picks For You" },
                            { key: "ACTIVE", label: "In Action" },
                            { key: "UPCOMING", label: "On the Horizon" },
                            { key: "COMPLETED", label: "Past Battles" },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`tab ${statusFilter === tab.key ? "active" : ""}`}
                                onClick={() => setStatusFilter(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="hackathon-search-box">
                        <i className="fa fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            ref={searchInputRef}
                            className="hackathon-search-input"
                        />
                        {searchQuery && (
                            <i
                                className="fa fa-times clear-icon"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setSearchQuery("");
                                    if (searchInputRef.current) {
                                        searchInputRef.current.focus();
                                    }
                                }}
                            ></i>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading"></div>
                ) : filteredHackathons.length === 0 ? (
                    <div
                        className="no-results-message"
                        style={{
                            padding: "32px",
                            fontSize: "18px",
                            textAlign: "center",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px"
                        }}
                    >
                        <img
                            src={getEmptyImageByTab(statusFilter)}
                            alt={emptyMessages[statusFilter] || "No hackathons"}
                            style={{ width: `${getEmptyImageSize(statusFilter)}px`, height: "auto", opacity: 0.95 }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div>{emptyMessages[statusFilter]}</div>
                                <button
                                    className="cta-button"
                                    style={{ marginTop: "8px" }}
                                    onClick={() => setStatusFilter(getCtaTargetTab(statusFilter))}
                                >
                                    Explore
                                </button>
                    </div>
                ) : (
                    <div className="newCards-grid">
                        {filteredHackathons.map(hackathon => {
                            const today = new Date();
                            const startDate = new Date(hackathon.startAt);
                            const endDate = new Date(hackathon.endAt);

                            let remainingText = "";
                            if (hackathon.status === "ACTIVE") {
                                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                                remainingText = diffDays > 0 ? `Ends in ${diffDays} days` : "Ends today";
                            } else if (hackathon.status === "UPCOMING") {
                                const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                                remainingText = diffDays > 0 ? `Starts in ${diffDays} days` : "Starting soon";
                            } else if (hackathon.status === "COMPLETED") {
                                remainingText = "Completed";
                            }

                            const regStatus = getRegistrationStatus(hackathon.id);
                            const winnerInfo = winners[hackathon.winner];

                            return (
                                <div className="newCard" key={hackathon.id} style={{ position: "relative" }}>
                                    <span className={`status-badge ${hackathon.status.toLowerCase()}`}>{hackathon.status}</span>

                                    <img
                                        src={hackathon.bannerUrl}
                                        alt={hackathon.title}
                                        onError={(e) => (e.target.src = "https://via.placeholder.com/300x200?text=No+Image")}
                                    />

                                    <div className="newCard-body">
                                        <h5>{hackathon.company}</h5>
                                        <h3>{hackathon.title}</h3>
                                        <p className="tech">{hackathon.allowedTechnologies}</p>

                                        {regStatus && (
                                            <p className="registration-status">
                                                <span className="tick-circle">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16">
                                                        <path d="M13.485 1.929a.75.75 0 0 1 1.06 1.06l-8.25 8.25a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 1 1 1.06-1.06l3.72 3.72 7.72-7.72z" />
                                                    </svg>
                                                </span>
                                                {regStatus}
                                            </p>
                                        )}
                                    </div>

                                    {(statusFilter === "COMPLETED" || statusFilter === "MY") && winnerInfo?.firstName && winnerInfo?.lastName && (
                                        <div className="winner-card" data-name={`${winnerInfo.firstName} ${winnerInfo.lastName}`}>
                                            <div className="winner-card-content">
                                                <img
                                                    src={winnerInfo.imageUrl || "../images/user/avatar/image-01.jpg"}
                                                    alt={`${winnerInfo.firstName} ${winnerInfo.lastName}`}
                                                    className="winner-image"
                                                />
                                            </div>
                                            <div className="winner-overlay">
                                                <h4 className="winner-heading">Top Performer</h4>
                                                <img
                                                    src={winnerInfo.imageUrl || "../images/user/avatar/image-01.jpg"}
                                                    alt={`${winnerInfo.firstName} ${winnerInfo.lastName}`}
                                                    className="winner-image-overlay"
                                                />
                                                <span className="winner-name">
                                                    {winnerInfo.firstName} {winnerInfo.lastName}
                                                </span>
                                            </div>
                                        </div>
                                    )}


                                    <div className="newCard-footer">
                                        <p className="remaining">{remainingText}</p>
                                        <button className="view-button" onClick={() => handleViewClick(hackathon.id)}>
                                            View
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hackathon;
