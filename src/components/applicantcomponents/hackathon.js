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
        } catch (_) { }
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
            <div className="row mr-0 ml-10" style={{ marginLeft: "1%" }}>
                <div className="main-header-row">
                    <h1 className="main-heading">Innovation Arena</h1>
                    <div className="hackathon-search-box">
                        <i className="fa fa-search search-icon1"></i>
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

                <div className="header-container">
                    <div className="status-tabs">
                        {[
                            { key: "MY", label: "My Arenas" },
                            { key: "RECOMMENDED", label: "Picks For You" },
                            { key: "ACTIVE", label: "In Action" },
                            { key: "UPCOMING", label: "On The Horizon" },
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
                                remainingText = diffDays > 0 ? `Expires in ${diffDays} days` : "Expires today";
                            } else if (hackathon.status === "UPCOMING") {
                                const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                                remainingText = diffDays > 0 ? `Starts in ${diffDays} days` : "Starting soon";
                            } else if (hackathon.status === "COMPLETED") {
                                const diffDays = Math.ceil((today - endDate) / (1000 * 60 * 60 * 24));
                                remainingText = diffDays > 0 ? `Expired ${diffDays} days ago` : "Expired";
                            }

                            const regStatus = getRegistrationStatus(hackathon.id);
                            const winnerInfo = winners[hackathon.winner];

                            return (
                                <div className="newCard" key={hackathon.id}>


                                    <div className="newCard-body">
                                        <div
                                            className="newCard-header"
                                            style={hackathon.bannerUrl ? {
                                                backgroundImage: `url(${hackathon.bannerUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: '3px',
                                                marginBottom: '10px'
                                            } : {}}
                                        >
                                        </div>
                                        <div className="status-timing-row">
                                            <span className={`status-badge ${hackathon.status.toLowerCase()}`}>
                                                {hackathon.status === 'ACTIVE' ? 'Active' :
                                                    hackathon.status === 'UPCOMING' ? 'Upcoming' :
                                                        hackathon.status === 'COMPLETED' ? 'Expired' : hackathon.status}
                                            </span>
                                            <span className="timing-text">{remainingText}</span>
                                        </div>

                                        <h3 className="hackathon-title">{hackathon.title}</h3>
                                        <h5 className="company-name">{hackathon.company || 'Company'}</h5>

                                        <div className="tech-tags">
                                            {hackathon.allowedTechnologies && hackathon.allowedTechnologies.split(',').map((tech, index) => (
                                                <span key={index} className="tech-tag">{tech.trim()}</span>
                                            ))}
                                        </div>

                                        <div className="card-footer-row">
                                            {regStatus && (
                                                <div className="registration-status">
                                                    <span className="tick-circle">
                                                        {regStatus === "Registered" ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14.474" height="14.373" viewBox="0 0 14.474 17.373">
                                                                <path d="M49.942,99.447l-.245-.13a2.539,2.539,0,0,0-3.5,1.136l-.119.248-.277.037a2.539,2.539,0,0,0-2.161,2.973l.05.275-.2.193a2.539,2.539,0,0,0,0,3.674l.2.193-.05.274a2.539,2.539,0,0,0,2.161,2.973l.277.036.119.249a2.539,2.539,0,0,0,3.5,1.136l.24-.13.245.13a2.539,2.539,0,0,0,3.5-1.136l.118-.247.276-.038a2.539,2.539,0,0,0,2.163-2.973l-.05-.274.2-.193a2.539,2.539,0,0,0,0-3.674l-.2-.194.05-.274a2.539,2.539,0,0,0-2.161-2.972L53.8,100.7l-.119-.248a2.539,2.539,0,0,0-3.5-1.136Zm5.521,6.569a5.523,5.523,0,1,1-5.523-5.523A5.529,5.529,0,0,1,55.462,106.016Z" transform="translate(-42.702 -95.649)" fill="#ef8c2f" />
                                                                <path d="M206.938,260.8l.832.811-.2,1.145,1.028-.541,1.028.541-.2-1.145.832-.811-1.15-.167-.514-1.042-.514,1.042Z" transform="translate(-201.365 -250.783)" fill="#ef8c2f" />
                                                                <path d="M123.214,177.224a4.5,4.5,0,1,0,4.5-4.5A4.51,4.51,0,0,0,123.214,177.224Zm5.7-1.446,1.785.259.242.745-1.292,1.259.3,1.778-.634.461-1.6-.839-1.6.839-.634-.461.3-1.778-1.292-1.259.242-.745,1.785-.259.8-1.618h.784Z" transform="translate(-120.482 -166.858)" fill="#ef8c2f" />
                                                                <path d="M266.407,2.342a3.584,3.584,0,0,1,2.372.936L270.418,0h-5.182Z" transform="translate(-257.684 0)" fill="#ef8c2f" />
                                                                <path d="M96.927,2.518a3.52,3.52,0,0,1,2.55.135,3.585,3.585,0,0,1,.423-.158L98.653,0H93.98l1.639,3.279A3.544,3.544,0,0,1,96.927,2.518Z" transform="translate(-92.24)" fill="#ef8c2f" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" id="check_1008958" width="11.833" height="11.833" viewBox="0 0 11.833 11.833">
                                                                <g id="Group_188" data-name="Group 188">
                                                                    <path id="Path_388" data-name="Path 388" d="M5.917,0a5.917,5.917,0,1,0,5.917,5.917A5.94,5.94,0,0,0,5.917,0ZM5.2,8.608,2.61,6.017l.98-.98L5.246,6.692,8.57,3.67,9.5,4.7Z" fill="#ef8c2f" />
                                                                </g>
                                                            </svg>
                                                        )}
                                                    </span>
                                                    {regStatus}
                                                </div>
                                            )}
                                            <button className="view-button" onClick={() => handleViewClick(hackathon.id)}>
                                                View
                                            </button>
                                        </div>
                                    </div>

                                    {(statusFilter === "COMPLETED" || statusFilter === "MY") && winnerInfo?.firstName && winnerInfo?.lastName && (
                                        <div className="winner-card">
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
