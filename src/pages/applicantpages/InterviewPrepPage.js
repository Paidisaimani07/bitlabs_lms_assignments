// InterviewPrepPage.js
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../../components/common/UserProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Snackbar from "../../components/common/Snackbar";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./InterviewPrepPage.css"
import botImage from '../../images/dashboard/mobilebanners/Bot.png';

function InterviewPrepPage() {
  const { user } = useUserContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [openOptionsId, setOpenOptionsId] = useState(null);
  const [savedChats, setSavedChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [queuedMessage, setQueuedMessage] = useState("");
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const textInputRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const resendTimeoutRef = useRef(null);
  const [snackbars, setSnackbars] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, chatId: null, title: '' });
  const [titleModal, setTitleModal] = useState({ open: false, mode: null, chatId: null, value: '' });
  const [isTitleSubmitting, setIsTitleSubmitting] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const isExistingChat = savedChats.some(c => c.id === currentChatId);



const formatResponse = (rawResponse) => {
  try {
    let text = "";

    // If object → read its FIRST string-like field
    if (typeof rawResponse === "object" && rawResponse !== null) {
      const key = Object.keys(rawResponse)[0];
      text = rawResponse[key] ?? rawResponse;
    } else {
      // Try parsing if it's a JSON string
      const parsed = JSON.parse(rawResponse);
      const key = Object.keys(parsed)[0];
      text = parsed[key] ?? parsed;
    }

    text = String(text).trim();

    // 🔥 1. Remove backticks
    text = text.replace(/^\s*`+|`+\s*$/g, "");

    // 🔥 2. Remove escaped quotes
    text = text.replace(/\\"/g, '"');

    // 🔥 3. Convert \n to real newlines
    text = text.replace(/\\n/g, "\n");

    // 🔥 4. Remove wrappers like { "response": "..." }
    text = text.replace(/^\s*\{\s*"response"\s*:\s*"([\s\S]*?)"\s*\}\s*$/i, "$1");

    // 🔥 5. Remove cases like => {"response": {...}}
    text = text.replace(/^\s*\{\s*"response"\s*:\s*\{([\s\S]*?)\}\s*\}\s*$/i, "$1");

    // 🔥 6. Remove leftover leading/trailing braces or quotes
    text = text.replace(/^[{\s"]+|[}\s"]+$/g, "");

    return text.trim();

  } catch (err) {
    console.error("formatResponse error:", err);
    return rawResponse;
  }
};







  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  useEffect(() => {
    const onGlobalMouseDown = (e) => {
      if (!openOptionsId) return;
      const withinOptions = e.target?.closest?.('[data-role="options-btn"], [data-role="options-menu"]');
      if (!withinOptions) {
        setOpenOptionsId(null);
      }
    };
    document.addEventListener('mousedown', onGlobalMouseDown);
    return () => document.removeEventListener('mousedown', onGlobalMouseDown);
  }, [openOptionsId]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        if (!user?.id) return;
        const jwtToken = localStorage.getItem('jwtToken');
        const resp = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setApplicantProfile(resp?.data || null);

      } catch (e) {
        console.error('Failed to fetch applicant skills', e);
        setApplicantProfile(null);
      }
    };
    fetchSkills();
  }, [user?.id]);

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

  const focusInput = () => {
    setTimeout(() => textInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    focusInput();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
      const jwtToken = localStorage.getItem("jwtToken");

      const postBody = {
        applicantId: user?.id ?? null,
        chatId: currentChatId ?? null,
        request: queuedMessage,
      };

      const { data } = await axios.post(
        `${apiUrl}/aiPrepModel/postQuery`,
        postBody,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (data?.chatId) setCurrentChatId(data.chatId);

      const reply = formatResponse(data);
      setMessages(prev => [...prev, { sender: "bot", text: reply }]);

      if (currentChatId) {
        const jwtToken2 = localStorage.getItem("jwtToken");

        const chatArray = [
          ...messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            message: m.text,
            time: new Date().toISOString(),
          })),
          { role: "assistant", message: reply, time: new Date().toISOString() }
        ];

        const payload = {
          savedChat: JSON.stringify(chatArray)
        };

        await axios.put(
          `${apiUrl}/aiPrepChat/${currentChatId}/updateChatDetails/${user?.id}`,
          payload,
          { headers: jwtToken2 ? { Authorization: `Bearer ${jwtToken2}` } : undefined }
        );
      }

      setQueuedMessage("");
      setCooldownRemaining(0);
      setIsCoolingDown(false);
      clearCooldownTimers();
      setInput("");

    } catch (err) {
      console.error("Chat resend error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "⚠️ Connection error. Try again." }
      ]);
    } finally {
      setIsLoading(false);
      focusInput();
    }
  };

const sendMessage = async () => {
  if (!input.trim() || isLoading || isCoolingDown) return;

  const userMessage = input.trim();
  setIsLoading(true);
  setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
  focusInput();

  try {
    const jwtToken = localStorage.getItem("jwtToken");

    const postBody = {
      applicantId: user?.id ?? null,
      chatId: currentChatId ?? null,
      request: userMessage
    };

    const { data } = await axios.post(
      `${apiUrl}/aiPrepModel/postQuery`,
      postBody,
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );

    // backend gives a chatId → update
    if (data?.chatId) setCurrentChatId(data.chatId);

    const reply = formatResponse(data);
    setMessages(prev => [...prev, { sender: "bot", text: reply }]);

    setInput("");

  } catch (err) {
    console.error("Chat error:", err);
    setMessages(prev => [
      ...prev,
      { sender: "bot", text: "⚠️ Connection error. Try again." }
    ]);
  } finally {
    setIsLoading(false);
    setTimeout(() => textInputRef.current?.focus(), 0);
  }
};



 const startNewChat = async () => {
  try {
    const isExistingChat =
      currentChatId && savedChats.some(c => c.id === currentChatId);

    // Save ONLY if this chat is NEW (not yet saved)
    if (messages.length > 0 && currentChatId && !isExistingChat) {

      const jwtToken = localStorage.getItem("jwtToken");

      // Title from first user message
      const firstUserMsg =
        messages.find(m => m.sender === "user")?.text || "Untitled Chat";

      const trimmedTitle =
        firstUserMsg.length > 35
          ? firstUserMsg.substring(0, 35) + "..."
          : firstUserMsg;

      // Format messages for backend
      const chatArray = messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        message: m.text,
        time: new Date().toISOString(),
      }));

      const payload = {
        title: trimmedTitle,
        savedChat: JSON.stringify(chatArray),
      };

      // SAVE
      await axios.put(
        `${apiUrl}/aiPrepChat/${currentChatId}/updateChatDetails/${user?.id}`,
        payload,
        { headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined }
      );

      // Add to local list
      const newChat = {
        id: currentChatId,
        title: trimmedTitle,
        createdAt: Date.now()
      };

      setSavedChats(prev => [...prev, newChat]);
      persistSavedChats([...savedChats, newChat]);

      addSnackbar({
        message: "Chat saved successfully before starting a new one.",
        type: "success"
      });
    }

    // reset for brand new chat
    setMessages([]);
    setCurrentChatId(null);
    setShowDropdown(false);
    focusInput();

  } catch (error) {
    console.error("Failed to save chat before new chat:", error);

    addSnackbar({
      message: "Unable to save previous chat. Starting new chat anyway.",
      type: "error"
    });

    setMessages([]);
    setCurrentChatId(null);
    setShowDropdown(false);
    focusInput();
  }
};



  const loadChat = async (id) => {
  const chat = savedChats.find(c => c.id === id);
  setCurrentChatId(id); // this tells startNewChat() it is an existing chat
  setIsLoading(true);

  try {
    const jwtToken = localStorage.getItem("jwtToken");

    const { data } = await axios.get(
      `${apiUrl}/aiPrepChat/${id}/getChatDetailsById/${user?.id}`,
      { headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined }
    );

    let messagesArr = [];

    if (data?.savedChat) {
      try {
        const parsed = JSON.parse(data.savedChat);
        messagesArr = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.messages)
          ? parsed.messages
          : [];
      } catch (err) {
        messagesArr = [];
      }
    }

    const mapped = messagesArr.map(m => ({
      sender: m.role === "user" ? "user" : "bot",
      text: m.message ?? m.content ?? m.text ?? "",
      timestamp: m.time ?? m.timestamp ?? undefined,
    }));

    setMessages(mapped);

  } catch (e) {
    console.error("Failed to load saved chat content", e);
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

  const closeTitleModal = () => setTitleModal({ open: false, mode: null, chatId: null, value: '' });


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
    const msg = input.trim();
    if (!msg) return;
    setInput("");          
    sendMessage(msg);      
  }
};


  const handleClearChat = () => {
    setMessages([]);
    setShowDropdown(false);
    focusInput();
  };

  const handleExportChat = async (chatId) => {
  try {
    const jwtToken = localStorage.getItem("jwtToken");

    // ✅ Fetch FULL chat from API (REAL source of truth)
    const { data } = await axios.get(
      `${apiUrl}/aiPrepChat/${chatId}/getChatDetailsById/${user?.id}`,
      { headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined }
    );

    let messagesArr = [];

    if (data?.savedChat) {
      try {
        const parsed = JSON.parse(data.savedChat);
        messagesArr = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.messages)
          ? parsed.messages
          : [];
      } catch (err) {
        messagesArr = [];
      }
    }

    // ❗ If still no messages, stop
    if (!messagesArr.length) {
      addSnackbar({ message: "No messages found to export.", type: "error" });
      return;
    }

    // Build hidden export element
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.padding = "20px";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.maxWidth = "800px";
    element.style.margin = "0 auto";

    const title = document.createElement("h1");
    title.textContent = data.title || "Chat Export";
    title.style.textAlign = "center";
    title.style.marginBottom = "20px";
    title.style.color = "#333";
    element.appendChild(title);

    const date = document.createElement("p");
    date.textContent = `Exported on: ${new Date().toLocaleString()}`;
    date.style.textAlign = "center";
    date.style.marginBottom = "30px";
    date.style.color = "#666";
    element.appendChild(date);

    // Render all messages into element
    messagesArr.forEach((msg) => {
      const messageDiv = document.createElement("div");
      messageDiv.style.marginBottom = "15px";
      messageDiv.style.padding = "10px 15px";
      messageDiv.style.borderRadius = "8px";
      messageDiv.style.maxWidth = "80%";

      if (msg.role === "user") {
        messageDiv.style.marginLeft = "auto";
        messageDiv.style.backgroundColor = "#fdf3e9";
        messageDiv.style.border = "1px solid #f0e0d0";
      } else {
        messageDiv.style.backgroundColor = "#f5f5f5";
        messageDiv.style.border = "1px solid #e0e0e0";
      }

      const content = document.createElement("div");
      content.innerHTML = (msg.message || msg.content || msg.text || "")
        .replace(/\n/g, "<br>")
        .trim();

      messageDiv.appendChild(content);

      const time = document.createElement("div");
      time.textContent = new Date(msg.time || msg.timestamp || Date.now()).toLocaleString();
      time.style.fontSize = "0.8em";
      time.style.color = "#666";
      time.style.marginTop = "5px";
      time.style.textAlign = "right";

      messageDiv.appendChild(time);
      element.appendChild(messageDiv);
    });

    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    document.body.removeChild(element);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

    const fileName = `chat_${data.title || "export"}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");

    pdf.save(fileName);
  } catch (error) {
    console.error("Error exporting chat:", error);
    addSnackbar({ message: "Failed to export chat.", type: "error" });
  }
};


  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content ai-chat-prep" >
        <div className="ai-perp">
          <div className="ai-top-buttons">
            <button className="ai-new-chat" onClick={startNewChat}>New chat</button>
            <button className="ai-clear-chat" onClick={handleClearChat}>Clear chat</button>
          </div>
          {/* Sidebar */}
          <div className="interview-prep-dashboard-content">
            <aside
              className={`interview-prep-sidebar ${isMobile ? "interview-prep-mobile" : ""
                }`}
            >
              <div className="interview-prep-sidebar-header">
                <span>
                  <img src={botImage} alt="Bot icon" />
                </span>
                <h2>Ask Newton!</h2>
              </div>

              <div className="ai-sidebar-saved-content">
                <div
                  className="interview-prep-chats-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <h3 className="interview-prep-chats-header">Saved chats</h3>
                  <span className="dropdown-icon">{sidebarOpen ? "▲" : "▼"}</span>
                </div>

                <div
                  className={`interview-prep-chats-list-wrapper ${sidebarOpen ? "open" : ""
                    }`}
                >
                  <div className="interview-prep-chats-list">
                    {savedChats.length === 0 ? (
                      <div className="interview-prep-no-chats">No saved chats yet</div>
                    ) : (
                      <ul className="interview-prep-chat-list" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {savedChats.map((c) => (
                          <li
                            key={c.id}
                            className={`interview-prep-chat-item ${selectedChatId === c.id ? "selected" : ""
                              }`}
                            onClick={() => {
                              loadChat(c.id);
                              setSelectedChatId(c.id);
                            }}
                            title={new Date(c.createdAt).toLocaleString()}
                          >
                            <div className="interview-prep-chat-info">
                              <span className="interview-prep-chat-title">{c.title}</span>
                            </div>

                            <span
                              className="interview-prep-chat-options"
                              data-role="options-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenOptionsId(openOptionsId === c.id ? null : c.id);
                              }}
                            >
                              ⋮
                            </span>

                            {openOptionsId === c.id && (
                              <div
                                className="interview-prep-options-menu"
                                data-role="options-menu"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span
                                  className="interview-prep-option-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportChat(c.id);
                                    setOpenOptionsId(null);
                                  }}
                                >
                                  Export chat
                                </span>
                                <span
                                  className="interview-prep-option-btn"
                                  onClick={() => openDeleteConfirm(c.id)}
                                >
                                  Delete chat
                                </span>
                              </div>
                            )}

                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="interview-prep-main">

              <div className="interview-prep-chat-container">

                {isCoolingDown && (
                  <div className="interview-prep-cooldown-notice">
                    We’re a bit busy right now. Your last message will be sent automatically in {formatSeconds(cooldownRemaining)}.
                    <div className="interview-prep-cooldown-actions">
                      <button
                        className="interview-prep-cooldown-btn"
                        onClick={sendNow}
                        disabled={!queuedMessage || isLoading}
                      >
                        Send now
                      </button>
                      <button
                        className="interview-prep-cooldown-btn"
                        onClick={cancelCooldown}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="interview-prep-messages">
                  {messages.length === 0 ? (
                    <div className="interview-prep-welcome-message">
                     Hello! What can I help you with today?
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`interview-prep-message ${msg.sender === 'user' ? 'interview-prep-user-message' : 'interview-prep-assistant-message'}`}
                      >
                        <div className="interview-prep-message-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => (
                                <p className="interview-prep-markdown-p" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="interview-prep-markdown-li" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="interview-prep-markdown-ul" {...props} />
                              ),
                              code: ({ node, inline, ...props }) =>
                                inline ? (
                                  <code className="interview-prep-markdown-inline-code" {...props} />
                                ) : (
                                  <pre className="interview-prep-markdown-code-block">
                                    <code {...props} />
                                  </pre>
                                ),
                              h1: ({ node, ...props }) => (
                                <h1 className="interview-prep-markdown-h1" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="interview-prep-markdown-h2" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="interview-prep-markdown-h3" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="interview-prep-markdown-ol" {...props} />
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
                    <div className="interview-prep-typing-indicator">
                      <div className="interview-prep-typing-dots">
                        <span className="interview-prep-typing-dot"></span>
                        <span className="interview-prep-typing-dot"></span>
                        <span className="interview-prep-typing-dot"></span>
                      </div>
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} className="interview-prep-chat-end" />
                </div>

                <div className="interview-prep-input-container">
  <input
    type="text"
    className="interview-prep-chat-input"
    value={input}
    onChange={(e) => {
      const v = e.target.value;
      setInput(v);
      if (isCoolingDown) setQueuedMessage(v);
    }}
    placeholder="Ask newton!"
    onKeyDown={handleKeyPress}
    disabled={isLoading || isCoolingDown}
    aria-label="Chat input"
    ref={textInputRef}
  />

  <span
    onClick={() => (sendMessage(), setInput(""))}
    aria-label="Send message"
    style={{
      cursor: input.trim() ? "pointer" : "default",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="14.976"
      viewBox="0 0 16 14.976"
    >
      <g transform="translate(-11.874 -14.302)">
        <path
          d="M27.633,21.411,12.471,14.342a.42.42,0,0,0-.571.527l2.238,6.5h6.782a.42.42,0,1,1,0,.839H14.139L11.9,28.723a.43.43,0,0,0-.021.136.42.42,0,0,0,.6.38L27.633,22.17a.42.42,0,0,0,0-.759Z"
          style={{
            fill: input.trim() ? "#F97316" : "#d3d3d3", // ACTIVE / INACTIVE COLOR
            transition: "0.2s ease",
          }}
        />
      </g>
    </svg>
  </span>
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
                className="interview-prep-snackbar"
              />
            ))}

            <div
              className={`interview-prep-modal ${confirmDelete.open ? 'interview-prep-modal-show' : ''}`}
              style={{ display: confirmDelete.open ? 'flex' : 'none', zIndex: 3000 }}
              tabIndex="-1"
              role="dialog"
              onClick={(e) => { if (e.target === e.currentTarget) closeDeleteConfirm(); }}
            >
              <div className="interview-prep-modal-dialog" role="document">
                <div className="interview-prep-modal-content">

                  <div className="interview-prep-modal-body">
                    <p>
                      You are about to delete <b>{confirmDelete.title}</b>. This action cannot be undone.
                    </p>
                  </div>
                  <div className="interview-prep-modal-footer">
                    <button
                      type="button"
                      className="ai-clear-chat"
                      onClick={closeDeleteConfirm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="ai-new-chat"
                      onClick={confirmDeleteChat}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPrepPage;
