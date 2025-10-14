import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../../components/common/UserProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Snackbar from "../../components/common/Snackbar";

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#eff2f6",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex", 
  },

  iconLeft: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
  },

  sidebar: {
    width: "280px",
    minWidth: "240px",
    backgroundColor: "#ffffff",
    borderRight: "none",
    padding: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "width 0.2s ease, padding 0.2s ease",
  },

  sidebarMobile: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    width: "80%",
    maxWidth: "320px",
    zIndex: 1500,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  sidebarClosed: {
    width: 0,
    minWidth: 0,
    padding: 0,
    overflow: "hidden",
    borderRight: "none",
  },

  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },

  sidebarTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#121212",
  },

  sidebarButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  toggleBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#F97316",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    lineHeight: 1,
  },

  toggleBtnHover: {
    backgroundColor: "#EA580C",
  },

  openSidebarButton: {
    position: "fixed",
    top: 12,
    left: 12,
    zIndex: 2000,
    padding: "8px 10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#F97316",
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    fontWeight: 700,
  },

  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 1400,
  },

  sidebarButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#F97316",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },

  chatsSectionTitle: {
    marginTop: "8px",
    marginBottom: "4px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#121212",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  chatsList: {
    flex: 1,
    overflowY: "auto",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ffffff",
  },

  chatListItem: {
    padding: "10px 12px",
    fontSize: "14px",
    color: "#1f2937",
    cursor: "pointer",
    borderBottom: "none",
    border: "1px solid #e2e8f0",
    outline: "none",
    boxShadow: "none",
    borderRadius: 8,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    transition: "background-color 0.15s ease, box-shadow 0.15s ease",
    backgroundColor: "transparent",
    textAlign: "left",
    background: "transparent",
    width: "100%",
    marginBottom: "5px",
  },

  savedChatRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  optionsBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#334155",
    cursor: "pointer",
    padding: "6px",
    borderRadius: 8,
    display: "none",
  },

  optionsBtnVisible: {
    display: "block",
  },

  optionsMenu: {
    position: "absolute",
    right: 8,
    top: "calc(50% + 18px)",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
    zIndex: 1100,
    minWidth: 140,
  },

  optionsMenuItem: {
    display: "block",
    width: "100%",
    padding: "8px 10px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    fontSize: 13,
    color: "#1f2937",
    cursor: "pointer",
  },

  optionsMenuItemHover: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
  },

  chatListItemHover: {
    backgroundColor: "#f3f4f6", 
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
    borderRadius: 12,
  },

  chatListItemActive: {
    backgroundColor: "#ffffff",
  },

  mainContent: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },

  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    boxSizing: "border-box",
  },
  mobileContentWrapper: {
    padding: "12px",
  },
  
  header: {
    textAlign: "left",
    marginBottom: "24px",
  },

  headerText: {
    color: "#121212",
    fontSize: "28px",
    fontWeight: "600",
  },

  closeButton: {
    position: "fixed",
    top: "16px",
    right: "16px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f97316",
    color: "white",
    fontSize: "28px",
    fontWeight: "300",
    lineHeight: "36px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    padding: "0",
    margin: "0",
    textAlign: "center",
    verticalAlign: "middle",
  },

  closeButtonText: {
    display: "block",
    marginTop: "-27%",
    marginLeft: "2%",
    transform: "none",
    transition: "none",
  },

  chatWindow: {
    flex: 1,
    border: "none",
    borderRadius: "16px",
    padding: "24px",
    height: "calc(100vh - 180px)",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    scrollbarWidth: "thin",
    scrollbarColor: "#cbd5e1 #f1f5f9",
    boxSizing: "border-box",
    width: "100%",
  },

  messageContainer: {
    display: "flex",
    margin: "12px 0",
    alignItems: "flex-start",
    width: "100%",
    boxSizing: "border-box",
  },

  userMessageContainer: {
    justifyContent: "flex-end",
  },

  botMessageContainer: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    padding: "16px 20px",
    borderRadius: "18px",
    maxWidth: "75%",
    wordWrap: "break-word",
    fontSize: "15px",
    lineHeight: "1.6",
    position: "relative",
    animation: "fadeIn 0.3s ease-in",
    boxSizing: "border-box",
    textAlign: "left",
  },
  mobileMessageBubble: {
    maxWidth: "90%",
    fontSize: "14px",
  },

  userMessage: {
    backgroundColor: "#F97316",
    color: "white",
    borderBottomRightRadius: "6px",
  },

  botMessage: {
    backgroundColor: "#f5f5f2",
    color: "#334155",
    borderBottomLeftRadius: "6px",
    border: "none",
  },

  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "20px",
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },

  input: {
    flex: 1,
    padding: "12px 70px 12px 50px",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    color: "#1e293b",
  },
  mobileInput: {
    padding: "10px 56px 10px 44px",
    fontSize: "15px",
  },

  inputFocus: {
    borderColor: "#F97316",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.15)",
  },

  sendButton: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#F97316",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "15px",
    minWidth: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileSendButton: {
    padding: "10px 14px",
    minWidth: "56px",
    fontSize: "14px",
  },

  sendButtonHover: {
    backgroundColor: "#EA580C",
    transform: "translateY(-1px)",
    boxShadow: "0 8px 25px -5px rgba(249, 115, 22, 0.35)",
  },

  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },

  inputIcons: {
    position: "absolute",
    right: "60px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    gap: "8px",
    zIndex: 1,
  },

  leftIcons: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    gap: "8px",
    zIndex: 1,
  },

  dropdownContainer: {
    position: "relative",
  },

  dropdown: {
    position: "absolute",
    bottom: "100%",
    left: "0",
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    minWidth: "140px",
    marginBottom: "4px",
  },

  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151",
    transition: "all 0.2s ease",
  },

  dropdownItemHover: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
  },

  dropdownItemDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  iconButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "all 0.2s ease",
    backgroundColor: "transparent",
    fontWeight: "bold",
  },

  iconButtonHover: {
    backgroundColor: "transparent",
  },

  fileInput: {
    display: "none",
  },

  attachedFiles: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  fileChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#FFEDD5",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#9A3412",
    border: "none",
  },

  removeFileButton: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtons: {
    display: "none",
  },

  actionButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "120px",
  },

  clearButton: {
    backgroundColor: "#ef4444",
    color: "white",
  },

  clearButtonHover: {
    backgroundColor: "#dc2626",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },

  exportButton: {
    backgroundColor: "#10b981",
    color: "white",
  },

  exportButtonHover: {
    backgroundColor: "#059669",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },

  emptyState: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "16px",
    marginTop: "80px",
    fontStyle: "italic",
    padding: "20px",
    lineHeight: "1.6",
  },

  markdownComponents: {
    p: {
      margin: "8px 0",
      lineHeight: "1.6",
      textAlign: "left",
    },
    li: {
      margin: "4px 0",
      paddingLeft: "8px",
      lineHeight: "1.6",
      textAlign: "left",
    },
    ul: {
      margin: "8px 0",
      paddingLeft: "24px",
      textAlign: "left",
    },
    ol: {
      margin: "8px 0",
      paddingLeft: "24px",
      textAlign: "left",
    },
    code: {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      padding: "3px 8px",
      borderRadius: "4px",
      fontSize: "14px",
      fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    },
    pre: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      padding: "16px",
      borderRadius: "8px",
      overflow: "auto",
      margin: "12px 0",
      textAlign: "left",
    },
    a: {
      color: "#F97316",
      textDecoration: "underline",
    },
    h1: {
      fontSize: "20px",
      fontWeight: "600",
      margin: "16px 0 8px 0",
      textAlign: "left",
    },
    h2: {
      fontSize: "18px",
      fontWeight: "600",
      margin: "14px 0 6px 0",
      textAlign: "left",
    },
    h3: {
      fontSize: "16px",
      fontWeight: "600",
      margin: "12px 0 4px 0",
      textAlign: "left",
    },
  },
};

function InterviewPrepPage() {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [openOptionsId, setOpenOptionsId] = useState(null);
  const [savedChats, setSavedChats] = useState([]); // [{id, title, messages, createdAt}]
  const [currentChatId, setCurrentChatId] = useState(null);
  // Applicant context
  const [applicantSkills, setApplicantSkills] = useState([]); // ["Java", ...]
  const [applicantProfile, setApplicantProfile] = useState(null); // full profile object
  // Rate limit queueing state
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [queuedMessage, setQueuedMessage] = useState("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const textInputRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const resendTimeoutRef = useRef(null);
  // Snackbars queue (consistent with other pages)
  const [snackbars, setSnackbars] = useState([]);
  // Delete confirmation popup state
  const [confirmDelete, setConfirmDelete] = useState({ open: false, chatId: null, title: '' });
  // Title modal for Save/Rename
  const [titleModal, setTitleModal] = useState({ open: false, mode: null, chatId: null, value: '' });
  // Submission lock for title modal actions to avoid duplicate API calls
  const [isTitleSubmitting, setIsTitleSubmitting] = useState(false);

const formatResponse = (rawResponse) => {
  try {
    const jsonResponse = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    let responseText = jsonResponse.response || '';

    const nestedResponseMatch = responseText.match(/^\s*{\s*"response"\s*:\s*"([\s\S]*)"\s*}\s*$/);
    if (nestedResponseMatch && nestedResponseMatch[1]) {
      responseText = nestedResponseMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    console.log(responseText);
    return responseText;

  } catch (e) {
    console.error('Error parsing response:', e);
    return rawResponse;
  }
};



  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addSnackbar = (snackbar) => {
    setSnackbars((prev) => [...prev, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prev) => prev.filter((_, i) => i !== index));
  };

  // Close the chat options menu (3-dots) when clicking anywhere outside
  useEffect(() => {
    const onGlobalMouseDown = (e) => {
      if (!openOptionsId) return;
      // Ignore clicks on the options button or within the options menu
      const withinOptions = e.target?.closest?.('[data-role="options-btn"], [data-role="options-menu"]');
      if (!withinOptions) {
        setOpenOptionsId(null);
      }
    };
    document.addEventListener('mousedown', onGlobalMouseDown);
    return () => document.removeEventListener('mousedown', onGlobalMouseDown);
  }, [openOptionsId]);

  // Fetch applicant profile (and derive skills for local use if needed)
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        if (!user?.id) return;
        const jwtToken = localStorage.getItem('jwtToken');
        const resp = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setApplicantProfile(resp?.data || null);
        const badges = resp?.data?.applicant?.applicantSkillBadges || [];
        const required = resp?.data?.skillsRequired || [];
        const fromBadges = badges
          .filter((b) => b.flag === 'added')
          .map((b) => b?.skillBadge?.name)
          .filter(Boolean);
        const fromRequired = required
          .map((r) => r?.skillName)
          .filter(Boolean);
        // combine and dedupe while preserving order
        const combined = [...fromBadges, ...fromRequired].filter((v, i, arr) => arr.indexOf(v) === i);
        setApplicantSkills(combined);
      } catch (e) {
        console.error('Failed to fetch applicant skills', e);
        setApplicantSkills([]);
        setApplicantProfile(null);
      }
    };
    fetchSkills();
  }, [user?.id]);

  // Fetch saved chat titles from backend and show in sidebar
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        if (!user?.id) return;
        const jwtToken = localStorage.getItem('jwtToken');
        const { data } = await axios.get(`${apiUrl}/aiPrepChat/getAllChatTitles/${user.id}`, {
          headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
        });
        const list = Array.isArray(data) ? data : (data?.titles || []);
        const toJsDate = (v) => {
          try {
            if (Array.isArray(v)) {
              const [y, mo, d, h = 0, mi = 0, s = 0, nano = 0] = v;
              return new Date(y, (mo || 1) - 1, d || 1, h, mi, s, Math.floor((nano || 0) / 1e6));
            }
            return v ? new Date(v) : null;
          } catch (_) {
            return null;
          }
        };
        const mapped = list
          .map((t) => ({
            id: t.id ?? t.chatId ?? t.chatID ?? t.chat_id,
            title: t.title ?? t.name ?? 'Untitled',
            createdAt: (() => { const dt = toJsDate(t.createdAt ?? t.created_at); return dt ? dt.getTime() : undefined; })(),
          }))
          .filter((t) => t.id != null);
        if (mapped.length) setSavedChats(mapped);
      } catch (e) {
        console.error('Failed to load saved chat titles', e);
      }
    };
    fetchTitles();
  }, [user?.id]);

  // Load saved chats from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedChatsV1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedChats(parsed);
      }
    } catch (e) {
      console.error("Failed to load saved chats:", e);
    }
  }, []);

  // Focus helper to keep cursor in the input
  const focusInput = () => {
    // Defer to next tick to avoid conflicts with button focus
    setTimeout(() => textInputRef.current?.focus(), 0);
  };

  // Focus on mount
  useEffect(() => {
    focusInput();
  }, []);

  // Track viewport width for responsive behavior
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-hide sidebar on mobile, show on desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const persistSavedChats = (chats) => {
    try {
      localStorage.setItem("savedChatsV1", JSON.stringify(chats));
    } catch (e) {
      console.error("Failed to persist chats:", e);
    }
  };


  const formatSeconds = (s) => {
    const sec = Math.max(0, Math.floor(s));
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    const mm = String(m).padStart(2, '0');
    const rr = String(r).padStart(2, '0');
    return `${mm}:${rr}`;
  };

  const clearCooldownTimers = () => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
    if (resendTimeoutRef.current) {
      clearTimeout(resendTimeoutRef.current);
      resendTimeoutRef.current = null;
    }
  };

  const cancelCooldown = () => {
    clearCooldownTimers();
    setIsCoolingDown(false);
    setCooldownRemaining(0);
    // keep input as-is; do not clear queuedMessage so user can press send again
    focusInput();
  };

  const sendNow = () => {
    if (!queuedMessage || isLoading) return;
    clearCooldownTimers();
    setIsCoolingDown(false);
    setCooldownRemaining(0);
    resendQueuedMessage();
    focusInput();
  };

 const skillsRequired = (applicantProfile) => {
  if (
    applicantProfile &&
    applicantProfile.applicant &&
    Array.isArray(applicantProfile.applicant.skillsRequired)
  ) {
    return applicantProfile.applicant.skillsRequired
      .map(skill => skill.skillName) 
      .filter(Boolean); 
  }
  return [];
};

const skillsArray = skillsRequired(applicantProfile);
console.log(skillsArray); 

  const resendQueuedMessage = async () => {
    if (!queuedMessage) return;
    setIsLoading(true);
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const skillsArray = skillsRequired(applicantProfile);
      const postBody = {
        applicantProfile: applicantProfile || {},
        request: queuedMessage,
        basicDetails: applicantProfile?.basicDetails,
        skillsRequired: skillsArray,
        experienceDetails: applicantProfile?.experienceDetails,
        experience: applicantProfile?.experience,
        qualification: applicantProfile?.qualification,
        specialization: applicantProfile?.specialization,
        preferredJobLocations: applicantProfile?.preferredJobLocations,
        roles: applicantProfile?.roles,
      };
      const { data } = await axios.post(`${apiUrl}/aiPrepModel/postQuery`, postBody, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const reply = formatResponse(data);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);

      // If this is an existing chat, push update to backend
      if (currentChatId) {
        try {
          const jwtToken2 = localStorage.getItem('jwtToken');
          const existing = savedChats.find(c => c.id === currentChatId);
          const title = existing?.title || "Untitled";
          const updatedMessagesForSave = [
            ...messages,
            { sender: "bot", text: reply },
          ];
          const apiMessages = updatedMessagesForSave.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          }));
          const payload = {
            title,
            savedChat: JSON.stringify({
              messages: apiMessages,
              newMessage: { role: 'user', content: queuedMessage },
            }),
          };
          await axios.put(`${apiUrl}/aiPrepChat/${currentChatId}/updateChatDetails/${user?.id}`, payload, {
            headers: jwtToken2 ? { Authorization: `Bearer ${jwtToken2}` } : undefined,
          });
        } catch (e) {
          console.error('Failed to update existing chat (resend):', e);
        }
      }
      setQueuedMessage("");
      setIsCoolingDown(false);
      setCooldownRemaining(0);
      clearCooldownTimers();
      setInput("");
      focusInput();
    } catch (error) {
      console.error("Chat error (resend):", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, I'm having trouble connecting. Please try again." },
      ]);
      // allow user to try sending again
      setIsCoolingDown(false);
      setCooldownRemaining(0);
      clearCooldownTimers();
    } finally {
      setIsLoading(false);
      focusInput();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isCoolingDown) return;

    const userMessage = input.trim();
    setIsLoading(true);
    // Immediately show the user's message
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    focusInput();

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const postBody = {
        applicantProfile: applicantProfile || {},
        request: userMessage,
        basicDetails: applicantProfile?.basicDetails,
        skillsRequired: applicantProfile?.skillsRequired,
        experienceDetails: applicantProfile?.experienceDetails,
        experience: applicantProfile?.experience,
        qualification: applicantProfile?.qualification,
        specialization: applicantProfile?.specialization,
        preferredJobLocations: applicantProfile?.preferredJobLocations,
        roles: applicantProfile?.roles,
      };
      const { data } = await axios.post(`${apiUrl}/aiPrepModel/postQuery`, postBody, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const reply = formatResponse(data);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);

      // If this is an existing chat, update it in backend with new message
      if (currentChatId) {
        try {
          const jwtToken2 = localStorage.getItem('jwtToken');
          const existing = savedChats.find(c => c.id === currentChatId);
          const title = existing?.title || "Untitled";
          const updatedMessagesForSave = [
            ...messages,
            { sender: 'user', text: userMessage },
            { sender: 'bot', text: reply },
          ];
          const apiMessages = updatedMessagesForSave.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          }));
          const payload = {
            title,
            savedChat: JSON.stringify({
              messages: apiMessages,
              newMessage: { role: 'user', content: userMessage },
            }),
          };
          await axios.put(`${apiUrl}/aiPrepChat/${currentChatId}/updateChatDetails/${user?.id}`, payload, {
            headers: jwtToken2 ? { Authorization: `Bearer ${jwtToken2}` } : undefined,
          });
        } catch (e) {
          console.error('Failed to update existing chat:', e);
        }
      }
      setInput("");
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "⚠️ Sorry, I'm having trouble connecting to the server. Please try again in a moment." 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a brand new chat
  const startNewChat = () => {
    if (messages.length > 0) {
      addSnackbar({ message: 'Started a new chat. Previous unsaved messages were cleared.', type: 'success' });
    }
    setMessages([]);
    setAttachedFiles([]);
    setCurrentChatId(null);
    setShowDropdown(false);
    focusInput();
  };

  // Save current chat -> open title modal instead of prompt
  const saveCurrentChat = async () => {
    if (messages.length === 0) {
      addSnackbar({ message: 'Nothing to save. Send a message first.', type: 'error' });
      return;
    }
    const defaultTitle = messages[0]?.text?.slice(0, 40) || 'New conversation';
    setTitleModal({ open: true, mode: 'save', chatId: currentChatId ?? null, value: defaultTitle });
  };

  // Select a saved chat
  const loadChat = async (id) => {
    const chat = savedChats.find((c) => c.id === id);
    setCurrentChatId(id);
    setAttachedFiles([]);
    setIsLoading(true);
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const { data } = await axios.get(`${apiUrl}/aiPrepChat/${id}/getChatDetailsById/${user?.id}`, {
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
      });
      let messagesArr = [];
      if (data?.savedChat) {
        try {
          const parsed = JSON.parse(data.savedChat);
          messagesArr = Array.isArray(parsed?.messages) ? parsed.messages : [];
        } catch (_) {
          messagesArr = [];
        }
      } else if (Array.isArray(data?.messages)) {
        messagesArr = data.messages;
      }
      const mapped = messagesArr.map((m) => ({
        sender: m.role === 'user' ? 'user' : 'bot',
        text: m.content ?? m.text ?? '',
      }));
      setMessages(mapped);
    } catch (e) {
      console.error('Failed to load saved chat content', e);
      if (chat?.messages) setMessages(chat.messages);
    } finally {
      setIsLoading(false);
      focusInput();
    }
  };

  const renameChat = async (id, title) => {
    const chat = savedChats.find((c) => c.id === id);
    if (!chat || !title?.trim()) return;

    const nextTitle = title.trim();
    // Optimistically update UI
    const updatedLocal = savedChats.map(c => c.id === id ? { ...c, title: nextTitle } : c);
    setSavedChats(updatedLocal);
    persistSavedChats(updatedLocal);
    setOpenOptionsId(null);

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      let payload = { title: nextTitle };
      if (currentChatId === id && Array.isArray(messages)) {
        const apiMessages = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        payload = { ...payload, savedChat: JSON.stringify({ messages: apiMessages }) };
      }
      await axios.put(`${apiUrl}/aiPrepChat/${id}/updateChatDetails/${user?.id}`, payload, {
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
      });
      addSnackbar({ message: 'Chat renamed successfully', type: 'success' });
    } catch (e) {
      console.error('Failed to update chat title on backend:', e);
      addSnackbar({ message: 'Failed to rename chat. Please try again.', type: 'error' });
    }
  };

  const openRenameModal = (id) => {
    const chat = savedChats.find((c) => c.id === id);
    const current = chat?.title || 'Untitled chat';
    setTitleModal({ open: true, mode: 'rename', chatId: id, value: current });
  };

  const closeTitleModal = () => setTitleModal({ open: false, mode: null, chatId: null, value: '' });

  const confirmTitleChange = async () => {
    const { mode, chatId, value } = titleModal;
    if (!value?.trim()) {
      addSnackbar({ message: 'Please enter a title.', type: 'error' });
      return;
    }
    if (isTitleSubmitting) return;
    setIsTitleSubmitting(true);
    if (mode === 'rename') {
      try {
        await renameChat(chatId, value.trim());
        closeTitleModal();
      } finally {
        setIsTitleSubmitting(false);
      }
      return;
    }
    if (mode === 'save') {
      const title = value.trim();
      const apiMessages = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const jwtToken = localStorage.getItem('jwtToken');

      if (currentChatId) {
        try {
          const payload = {
            title,
            savedChat: JSON.stringify({ messages: apiMessages }),
          };
          await axios.put(`${apiUrl}/aiPrepChat/${currentChatId}/updateChatDetails/${user?.id}`, payload, {
            headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
          });
          const updatedList = savedChats.map(c => c.id === currentChatId ? { ...c, title } : c);
          setSavedChats(updatedList);
          persistSavedChats(updatedList);
          addSnackbar({ message: 'Chat saved successfully', type: 'success' });
        } catch (e) {
          console.error('Failed to update existing chat on backend:', e);
          addSnackbar({ message: 'Failed to save chat. Please try again.', type: 'error' });
        } finally {
          setIsTitleSubmitting(false);
        }
        closeTitleModal();
        return;
      }

      try {
        const payload = {
          applicantId: user?.id,
          title,
          savedChat: JSON.stringify({ messages: apiMessages }),
        };
        const { data } = await axios.post(`${apiUrl}/aiPrepChat/saveChat`, payload, {
          headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
        });
        const newId = data?.id ?? data?.chatId ?? data?.chatID ?? data?.chat_id ?? Date.now();
        const newChat = { id: newId, title, createdAt: Date.now() };
        const updated = [newChat, ...savedChats];
        setSavedChats(updated);
        setCurrentChatId(newId);
        persistSavedChats(updated);
        addSnackbar({ message: 'Chat saved successfully', type: 'success' });
      } catch (e) {
        console.error('Failed to create new chat on backend:', e);
        const fallbackId = Date.now();
        const newChat = { id: fallbackId, title, createdAt: Date.now() };
        const updated = [newChat, ...savedChats];
        setSavedChats(updated);
        setCurrentChatId(fallbackId);
        persistSavedChats(updated);
        addSnackbar({ message: 'Saved locally. Server error occurred.', type: 'error' });
      } finally {
        setIsTitleSubmitting(false);
        closeTitleModal();
      }
    }
  };

  const deleteChat = async (id) => {
    const chat = savedChats.find((c) => c.id === id);
    if (!chat) return;
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      await axios.delete(`${apiUrl}/aiPrepChat/${id}/deleteChat/${user?.id}`, {
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
      });
      const updated = savedChats.filter(c => c.id !== id);
      setSavedChats(updated);
      persistSavedChats(updated);
      if (currentChatId === id) {
        setMessages([]);
        setCurrentChatId(null);
      }
      // Show success snackbar
      addSnackbar({ message: 'Chat deleted successfully', type: 'success' });
    } catch (e) {
      console.error('Failed to delete chat on backend, removing locally anyway:', e);
      const updated = savedChats.filter(c => c.id !== id);
      setSavedChats(updated);
      persistSavedChats(updated);
      if (currentChatId === id) {
        setMessages([]);
        setCurrentChatId(null);
      }
      // Inform user about local deletion due to server error
      addSnackbar({ message: 'Removed locally. Server error deleting chat.', type: 'error' });
    }
    setOpenOptionsId(null);
  };

  const openDeleteConfirm = (id) => {
    const chat = savedChats.find((c) => c.id === id);
    setConfirmDelete({ open: true, chatId: id, title: chat?.title || 'this chat' });
  };

  const closeDeleteConfirm = () => setConfirmDelete({ open: false, chatId: null, title: '' });

  const confirmDeleteChat = async () => {
    const id = confirmDelete.chatId;
    if (!id) return;
    await deleteChat(id);
    closeDeleteConfirm();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
    setShowDropdown(false);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearChat = () => {
    setMessages([]);
    setAttachedFiles([]);
    setShowDropdown(false);
    focusInput();
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      addSnackbar({ message: 'No messages to export!', type: 'error' });
      return;
    }

    const chatContent = messages
      .map((msg) => `${msg.sender === "user" ? "You" : "Interview Bot"}: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `interview_chat_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      {isMobile && sidebarOpen && (
        <div style={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}
      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? styles.sidebarMobile : {}),
        ...(sidebarOpen ? {} : styles.sidebarClosed)
      }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>Menu</div>
          <button
            style={styles.toggleBtn}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.toggleBtnHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.toggleBtn)}
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <span style={styles.iconLeft} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M15 18L9 12L15 6" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span  style={{textTransform: 'none', display: 'inline-flex', alignItems: 'center', height: 16, lineHeight: '16px' }}>Hide</span>
          </button>
        </div>
        <div style={styles.sidebarButtons}>
          <button
            style={{...styles.sidebarButton, textTransform: 'none'}}
            onClick={startNewChat}
            title="Start a new chat"
          >
             New chat
          </button>
          <button
           style={{...styles.sidebarButton, textTransform: 'none'}}
            onClick={saveCurrentChat}
            title="Save this chat"
            disabled={messages.length === 0}
          >
             Save chat
          </button>
        </div>

        <div style={{...styles.chatsSectionTitle, textTransform: 'none'}}>Chats</div>
        <div style={styles.chatsList}>
          {savedChats.length === 0 ? (
            <div style={{ padding: "10px", color: "#64748b", fontSize: "13px" }}>
              No saved chats yet
            </div>
          ) : (
            savedChats.map((c) => (
              <div key={c.id} style={styles.savedChatRow}
                   onMouseEnter={(e) => {
                     const btn = e.currentTarget.querySelector('[data-role="options-btn"]');
                     if (btn) btn.style.display = 'block';
                   }}
                   onMouseLeave={(e) => {
                     const btn = e.currentTarget.querySelector('[data-role="options-btn"]');
                     if (btn) btn.style.display = 'none';
                   }}>
                <button
                  onClick={() => loadChat(c.id)}
                  style={{
                    ...styles.chatListItem,
                    textTransform: 'none',
                    ...(currentChatId === c.id ? styles.chatListItemActive : {}),
                  }}
                  onMouseEnter={(e) => { Object.assign(e.currentTarget.style, styles.chatListItemHover); }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderRadius = styles.chatListItem.borderRadius; }}
                  onFocus={(e) => { e.target.style.outline = 'none'; e.target.style.boxShadow = 'none'; }}
                  onBlur={(e) => { e.target.style.outline = 'none'; e.target.style.boxShadow = 'none'; }}
                  title={new Date(c.createdAt).toLocaleString()}
                >
                  {c.title}
                </button>
                <button
                  data-role="options-btn"
                  style={{...styles.optionsBtn}}
                  title="Options"
                  aria-label="Chat options"
                  onClick={(e) => { e.stopPropagation(); setOpenOptionsId(openOptionsId === c.id ? null : c.id); }}
                >
                  ⋯
                </button>
                {openOptionsId === c.id && (
                  <div data-role="options-menu" style={styles.optionsMenu} onClick={(e)=>e.stopPropagation()}>
                    <button style={styles.optionsMenuItem} onClick={() => { setOpenOptionsId(null); openRenameModal(c.id); }}
                       onMouseEnter={(e) => { Object.assign(e.currentTarget.style, styles.optionsMenuItemHover); }}
                       onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1f2937'; }}
                       >Rename</button>
                    <button
                      style={styles.optionsMenuItem}
                      onMouseEnter={(e) => { Object.assign(e.currentTarget.style, styles.optionsMenuItemHover); }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1f2937'; }}
                      onClick={() => openDeleteConfirm(c.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
      {/* Main content */}
      <div style={styles.mainContent}>
        {!sidebarOpen && (
          <button
            style={{...styles.openSidebarButton, textTransform: 'none'}}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EA580C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            ☰ Menu
          </button>
        )}
        <button
          onClick={() => navigate('/applicanthome')}
          style={styles.closeButton}
          title="Close and return to Dashboard"
          aria-label="Close"
        >
          <span style={styles.closeButtonText}>×</span>
        </button>
        <div style={{...styles.contentWrapper, ...(isMobile ? styles.mobileContentWrapper : {})}}>
          <div style={{...styles.header, ...(isMobile ? { textAlign: 'center' } : {})}}>
            <h1 style={{...styles.headerText}}>
              Ask Newton
            </h1>
          </div>
        {isCoolingDown && (
          <div style={{
            marginBottom: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #fde68a",
            backgroundColor: "#fffbeb",
            color: "#92400e",
            fontSize: "14px",
            textAlign: "left",
          }}>
            We’re a bit busy right now. Your last message will be sent automatically in {formatSeconds(cooldownRemaining)}.
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <button onClick={sendNow} disabled={!queuedMessage || isLoading} style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                background: "#F97316",
                color: "#ffffff",
                cursor: (!queuedMessage || isLoading) ? "not-allowed" : "pointer",
                opacity: (!queuedMessage || isLoading) ? 0.6 : 1,
              }}>Send now</button>
              <button onClick={cancelCooldown} disabled={isLoading} style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#f3f4f6",
                color: "#111827",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}>Cancel</button>
            </div>
          </div>
        )}
        <div style={styles.chatWindow}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              👋 Hi! I'm your interview assistant. Ask me anything to get started!
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.messageContainer,
                  ...(msg.sender === "user"
                    ? styles.userMessageContainer
                    : styles.botMessageContainer),
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(isMobile ? styles.mobileMessageBubble : {}),
                    ...(msg.sender === "user" ? styles.userMessage : styles.botMessage),
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p style={styles.markdownComponents.p} {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li style={styles.markdownComponents.li} {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul style={styles.markdownComponents.ul} {...props} />
                      ),
                      code: ({ node, inline, ...props }) => (
                        inline ? (
                          <code style={styles.markdownComponents.code} {...props} />
                        ) : (
                          <pre style={styles.markdownComponents.pre}>
                            <code {...props} />
                          </pre>
                        )
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 style={styles.markdownComponents.h1} {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 style={styles.markdownComponents.h2} {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 style={styles.markdownComponents.h3} {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol style={styles.markdownComponents.ol} {...props} />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
            {isLoading && (
          <div style={styles.botMessageContainer}>
            <div style={{...styles.messageBubble, ...styles.botMessage}}>
              <span>💭 Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Attached Files Display */}
      {attachedFiles.length > 0 && (
        <div style={styles.attachedFiles}>
          {attachedFiles.map((file, index) => (
            <div key={index} style={styles.fileChip}>
              📎 {file.name}
              <button
                onClick={() => removeFile(index)}
                style={styles.removeFileButton}
                title="Remove file"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.inputContainer}>
        {/* Single Plus Icon with Dropdown - Left Side */}
        <div style={styles.leftIcons}>
          <div style={styles.dropdownContainer} ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              style={styles.iconButton}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.iconButtonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.iconButton)}
              title="More options"
              aria-label="More options"
            >
              +
            </button>
            
            {showDropdown && (
              <div style={styles.dropdown}>
                {/* <button
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.dropdownItem}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.dropdownItemHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.dropdownItem)}
                >
                  📎 Attach File
                </button> */}
                <button
                  onClick={handleClearChat}
                  disabled={messages.length === 0}
                  style={{
                    ...styles.dropdownItem,
                    ...(messages.length === 0 ? styles.dropdownItemDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (messages.length === 0) return;
                    Object.assign(e.target.style, styles.dropdownItemHover);
                  }}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.dropdownItem)}
                >
                  🗑️ Clear Chat
                </button>
                <button
                  onClick={handleExportChat}
                  disabled={messages.length === 0}
                  style={{
                    ...styles.dropdownItem,
                    ...(messages.length === 0 ? styles.dropdownItemDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (messages.length === 0) return;
                    Object.assign(e.target.style, styles.dropdownItemHover);
                  }}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.dropdownItem)}
                >
                  📥 Export Chat
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => { const v = e.target.value; setInput(v); if (isCoolingDown) setQueuedMessage(v); }}
          placeholder="Type your question here..."
          onKeyDown={handleKeyPress}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          disabled={false}
          style={{
            ...styles.input,
            ...(isMobile ? styles.mobileInput : {}),
            ...(inputFocused ? styles.inputFocus : {}),
          }}
          aria-label="Chat input"
          ref={textInputRef}
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || isCoolingDown}
          style={{
            ...styles.sendButton,
            textTransform: 'none',
            ...(isMobile ? styles.mobileSendButton : {}),
            ...(!input.trim() || isLoading || isCoolingDown ? styles.sendButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!input.trim() || isLoading) return;
            Object.assign(e.target.style, styles.sendButtonHover);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, styles.sendButton);
          }}
          aria-label="Send message"
        >
          {isLoading ? "..." : "Send"}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileAttachment}
          style={styles.fileInput}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        />
        </div>
      </div>
      </div>

      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => handleCloseSnackbar(index)}
        />
      ))}

      {/* Delete Confirmation Modal using existing modal1 styles */}
      <div
        className={`modal1 ${confirmDelete.open ? 'show' : ''}`}
        style={{ display: confirmDelete.open ? 'flex' : 'none', zIndex: 3000 }}
        tabIndex="-1"
        role="dialog"
        onClick={(e) => { if (e.target === e.currentTarget) closeDeleteConfirm(); }}
      >
        <div className="modal1-dialog" role="document">
          <div className="modal1-content">
            <div className="modal1-header">
              <h5 className="modal1-title">Delete chat?</h5>
              <button type="button" className="close" aria-label="Close" onClick={closeDeleteConfirm}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal1-body">
              <p>
                You are about to delete <b>{confirmDelete.title}</b>. This action cannot be undone.
              </p>
            </div>
            <div className="modal1-footer">
              <button type="button" className="btn1 btn-secondary1" onClick={closeDeleteConfirm}>Cancel</button>
              <button type="button" className="btn1 btn-primary1" onClick={confirmDeleteChat}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* Title Modal (Save/Rename) using existing modal1 styles) */}
      <div
        className={`modal1 ${titleModal.open ? 'show' : ''}`}
        style={{ display: titleModal.open ? 'flex' : 'none', zIndex: 3000 }}
        tabIndex="-1"
        role="dialog"
        onClick={(e) => { if (e.target === e.currentTarget) closeTitleModal(); }}
      >
        <div className="modal1-dialog" role="document">
          <div className="modal1-content">
            <div className="modal1-header">
              <h5 className="modal1-title">{titleModal.mode === 'rename' ? 'Rename chat' : 'Save chat'}</h5>
              <button type="button" className="close" aria-label="Close" onClick={closeTitleModal}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal1-body">
              <label style={{ display: 'block', marginBottom: 8 }}>Title</label>
              <input
                type="text"
                value={titleModal.value}
                onChange={(e) => setTitleModal((prev) => ({ ...prev, value: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
                placeholder="Enter a title"
              />
            </div>
            <div className="modal1-footer">
              <button type="button" className="btn1 btn-secondary1" onClick={closeTitleModal}>Cancel</button>
              <button
                type="button"
                className="btn1 btn-primary1"
                onClick={confirmTitleChange}
                disabled={isTitleSubmitting}
                style={isTitleSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {isTitleSubmitting ? (titleModal.mode === 'rename' ? 'Renaming...' : 'Saving...') : (titleModal.mode === 'rename' ? 'Rename' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPrepPage;
