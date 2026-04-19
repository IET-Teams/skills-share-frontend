"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  Send,
  Search,
  ArrowLeft,
  MessageCircle,
  Loader2,
  CheckCheck,
  Clock,
  GraduationCap,
  Users,
  X,
  Smile,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "SB";
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatMessageTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateHeader(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

// ─── ConversationItem ─────────────────────────────────────────────────────────
function ConversationItem({ conversation, isActive, onClick }) {
  const initials = getInitials(conversation.name);
  const hasUnread = conversation.unread > 0;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
      style={{
        background: isActive ? "rgba(232,184,75,0.06)" : "transparent",
        borderLeft: isActive ? "2px solid #e8b84b" : "2px solid transparent",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {conversation.avatar_url ? (
          <img src={conversation.avatar_url} alt={conversation.name} className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium"
            style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
          >
            {initials}
          </div>
        )}
        {/* Online dot */}
        <div
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
          style={{ background: "#1d9e75", borderColor: "#0a0908" }}
        />
      </div>

      {/* Name + last message */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p
            className="truncate text-sm"
            style={{ color: hasUnread ? "#f5f0e8" : "#c8bfb0", fontWeight: hasUnread ? 500 : 400 }}
          >
            {conversation.name}
          </p>
          <span className="shrink-0 text-xs" style={{ color: hasUnread ? "#e8b84b" : "#3a342c" }}>
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="truncate text-xs" style={{ color: hasUnread ? "#8a8070" : "#4a4438" }}>
            {conversation.lastMessage}
          </p>
          {hasUnread && (
            <span
              className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-xs font-medium"
              style={{ background: "#e8b84b", color: "#0e0c0a" }}
            >
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, isMine, showAvatar, partnerName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar (only for partner, and only when showAvatar is true) */}
      {!isMine && showAvatar ? (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium"
          style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
        >
          {getInitials(partnerName)}
        </div>
      ) : !isMine ? (
        <div className="w-7 shrink-0" />
      ) : null}

      {/* Bubble */}
      <div
        className="max-w-[75%] rounded-2xl px-3.5 py-2.5"
        style={
          isMine
            ? {
                background: "rgba(232,184,75,0.12)",
                borderBottomRightRadius: 6,
                border: "1px solid rgba(232,184,75,0.08)",
              }
            : {
                background: "#141210",
                borderBottomLeftRadius: 6,
                border: "1px solid #1e1c18",
              }
        }
      >
        <p className="text-sm leading-relaxed" style={{ color: "#f5f0e8" }}>
          {message.content}
        </p>
        <div className={`mt-1 flex items-center gap-1 ${isMine ? "justify-end" : ""}`}>
          <span className="text-xs" style={{ color: "#3a342c" }}>
            {formatMessageTime(message.created_at)}
          </span>
          {isMine && (
            <CheckCheck size={11} style={{ color: "#4a4438" }} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ChatInput ────────────────────────────────────────────────────────────────
function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex items-center gap-2 px-4 py-3"
      style={{ background: "#0a0908", borderTop: "1px solid #1a1814" }}
    >
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder="Type a message…"
        className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{ background: "#141210", border: "1px solid #2a2520", color: "#f5f0e8" }}
        onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
        onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
        disabled={disabled}
      />
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all"
        style={{
          background: text.trim() ? "#e8b84b" : "#1a1814",
          color: text.trim() ? "#0e0c0a" : "#3a342c",
        }}
      >
        <Send size={16} />
      </motion.button>
    </div>
  );
}

// ─── EmptyChat ────────────────────────────────────────────────────────────────
function EmptyChat({ type }) {
  const config = {
    noConversations: {
      icon: MessageCircle,
      title: "No conversations yet",
      subtitle: "Start a conversation by messaging someone from the Explore page",
    },
    noSelected: {
      icon: MessageCircle,
      title: "Select a conversation",
      subtitle: "Pick a conversation from the sidebar to start chatting",
    },
  };
  const c = config[type] || config.noSelected;
  const Icon = c.icon;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "#141210", border: "1px solid #2a2520" }}
      >
        <Icon size={24} style={{ color: "#3a342c" }} />
      </div>
      <p className="mt-4 text-sm font-medium" style={{ color: "#4a4438" }}>{c.title}</p>
      <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>{c.subtitle}</p>
    </div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Fetch user ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    init();
  }, [supabase]);

  // ── Build conversations list ────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    // Get all messages involving current user
    const { data: allMessages, error } = await supabase
      .from("messages")
      .select(`
        id, content, sender_id, receiver_id, created_at, read
      `)
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (error || !allMessages) {
      setLoading(false);
      return;
    }

    // Group by partner
    const convosMap = new Map();
    for (const msg of allMessages) {
      const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
      if (!convosMap.has(partnerId)) {
        convosMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unread: 0,
        });
      }
      // Count unread
      if (msg.receiver_id === currentUser.id && !msg.read) {
        const conv = convosMap.get(partnerId);
        conv.unread += 1;
      }
    }

    // Fetch partner details
    const partnerIds = [...convosMap.keys()];
    if (partnerIds.length > 0) {
      const { data: partners } = await supabase
        .from("users")
        .select("id, name, department, avatar_url")
        .in("id", partnerIds);

      const enriched = partnerIds.map((pid) => {
        const conv = convosMap.get(pid);
        const partner = (partners || []).find((p) => p.id === pid) || {};
        return {
          id: pid,
          name: partner.name || "Unknown",
          department: partner.department,
          avatar_url: partner.avatar_url,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unread: conv.unread,
        };
      });

      // Sort by most recent
      enriched.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setConversations(enriched);

      // Auto-select from URL param
      if (targetUserId) {
        const existing = enriched.find((c) => c.id === targetUserId);
        if (existing) {
          setActiveConvoId(targetUserId);
          setShowSidebar(false);
        } else {
          // Create a new conversation stub
          const { data: targetUser } = await supabase
            .from("users")
            .select("id, name, department, avatar_url")
            .eq("id", targetUserId)
            .single();

          if (targetUser) {
            const newConvo = {
              id: targetUser.id,
              name: targetUser.name,
              department: targetUser.department,
              avatar_url: targetUser.avatar_url,
              lastMessage: "",
              lastMessageTime: new Date().toISOString(),
              unread: 0,
            };
            setConversations((prev) => [newConvo, ...prev]);
            setActiveConvoId(targetUserId);
            setShowSidebar(false);
          }
        }
      }
    } else if (targetUserId) {
      // No existing conversations, but have a target user
      const { data: targetUser } = await supabase
        .from("users")
        .select("id, name, department, avatar_url")
        .eq("id", targetUserId)
        .single();

      if (targetUser) {
        const newConvo = {
          id: targetUser.id,
          name: targetUser.name,
          department: targetUser.department,
          avatar_url: targetUser.avatar_url,
          lastMessage: "",
          lastMessageTime: new Date().toISOString(),
          unread: 0,
        };
        setConversations([newConvo]);
        setActiveConvoId(targetUserId);
        setShowSidebar(false);
      }
    }

    setLoading(false);
  }, [supabase, currentUser, targetUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch messages for active conversation ──────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !activeConvoId) return;
    setMessagesLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeConvoId}),and(sender_id.eq.${activeConvoId},receiver_id.eq.${currentUser.id})`
      )
      .order("created_at", { ascending: true });

    if (!error) setMessages(data || []);
    setMessagesLoading(false);

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", activeConvoId)
      .eq("receiver_id", currentUser.id)
      .eq("read", false);

    // Update conversations unread count
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvoId ? { ...c, unread: 0 } : c))
    );
  }, [supabase, currentUser, activeConvoId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Realtime messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          // If this message is from the active conversation, add it
          if (newMsg.sender_id === activeConvoId) {
            setMessages((prev) => [...prev, newMsg]);
            // Mark as read
            supabase.from("messages").update({ read: true }).eq("id", newMsg.id);
          } else {
            // Update unread count in sidebar
            setConversations((prev) =>
              prev.map((c) =>
                c.id === newMsg.sender_id
                  ? { ...c, unread: c.unread + 1, lastMessage: newMsg.content, lastMessageTime: newMsg.created_at }
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, currentUser, activeConvoId]);

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = async (content) => {
    if (!currentUser || !activeConvoId) return;

    const newMessage = {
      sender_id: currentUser.id,
      receiver_id: activeConvoId,
      content,
    };

    const { data, error } = await supabase.from("messages").insert(newMessage).select().single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvoId
            ? { ...c, lastMessage: content, lastMessageTime: data.created_at }
            : c
        )
      );
    }
  };

  // ── Active partner info ─────────────────────────────────────────────────
  const activePartner = conversations.find((c) => c.id === activeConvoId);

  // ── Filtered conversations ──────────────────────────────────────────────
  const filteredConversations = searchQuery
    ? conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // ── Group messages by date ──────────────────────────────────────────────
  function getMessageGroups() {
    const groups = [];
    let currentDate = "";
    for (const msg of messages) {
      const date = new Date(msg.created_at).toDateString();
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ type: "date", date: msg.created_at });
      }
      groups.push({ type: "message", data: msg });
    }
    return groups;
  }

  return (
    <div
      className="flex h-[calc(100vh-56px)] md:h-screen"
      style={{ background: "#0e0c0a" }}
    >
      {/* ── Sidebar: Conversation List ──────────────────────────────── */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden md:flex"
        } w-full flex-col md:w-80 lg:w-96 shrink-0`}
        style={{ background: "#0a0908", borderRight: "1px solid #1e1c18" }}
      >
        {/* Sidebar header */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
          <h1 className="text-lg font-medium" style={{ color: "#f5f0e8" }}>Chat</h1>
          <p className="text-xs" style={{ color: "#4a4438" }}>
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#4a4438" }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none transition-all"
              style={{ background: "#141210", border: "1px solid #1e1c18", color: "#f5f0e8" }}
              onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
              onBlur={(e) => (e.target.style.borderColor = "#1e1c18")}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {loading ? (
            <div className="space-y-2 px-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                  className="h-16 rounded-xl"
                  style={{ background: "#141210" }}
                />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <MessageCircle size={20} style={{ color: "#2a2520" }} />
              <p className="mt-3 text-xs" style={{ color: "#3a342c" }}>
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConvoId === conv.id}
                onClick={() => {
                  setActiveConvoId(conv.id);
                  setShowSidebar(false);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat Area ──────────────────────────────────────────── */}
      <div
        className={`${
          showSidebar ? "hidden md:flex" : "flex"
        } flex-1 flex-col min-w-0`}
      >
        {activeConvoId && activePartner ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ background: "#0a0908", borderBottom: "1px solid #1a1814" }}
            >
              {/* Back button (mobile) */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setShowSidebar(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl md:hidden"
                style={{ background: "#141210" }}
              >
                <ArrowLeft size={14} style={{ color: "#8a8070" }} />
              </motion.button>

              {/* Partner info */}
              {activePartner.avatar_url ? (
                <img src={activePartner.avatar_url} alt={activePartner.name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium"
                  style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
                >
                  {getInitials(activePartner.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: "#f5f0e8" }}>
                  {activePartner.name}
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#1d9e75" }} />
                  <span className="text-xs" style={{ color: "#6a6050" }}>Online</span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
              style={{ background: "#0e0c0a" }}
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={18} className="animate-spin" style={{ color: "#4a4438" }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: "#141210", border: "1px solid #2a2520" }}
                  >
                    <MessageCircle size={18} style={{ color: "#3a342c" }} />
                  </div>
                  <p className="mt-3 text-sm" style={{ color: "#4a4438" }}>Start a conversation</p>
                  <p className="mt-0.5 text-xs" style={{ color: "#2a2520" }}>
                    Say hi to {activePartner.name}!
                  </p>
                </div>
              ) : (
                getMessageGroups().map((item, i) => {
                  if (item.type === "date") {
                    return (
                      <div key={`date-${i}`} className="flex items-center justify-center py-3">
                        <span
                          className="rounded-full px-3 py-1 text-xs"
                          style={{ background: "#141210", color: "#4a4438", border: "1px solid #1e1c18" }}
                        >
                          {formatDateHeader(item.date)}
                        </span>
                      </div>
                    );
                  }
                  const msg = item.data;
                  const isMine = msg.sender_id === currentUser?.id;
                  // Show avatar for first message in a group from partner
                  const prevItem = i > 0 ? getMessageGroups()[i - 1] : null;
                  const showAvatar =
                    !isMine &&
                    (!prevItem || prevItem.type === "date" || prevItem.data?.sender_id !== msg.sender_id);
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMine={isMine}
                      showAvatar={showAvatar}
                      partnerName={activePartner.name}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <ChatInput onSend={handleSend} disabled={!currentUser} />
          </>
        ) : (
          <EmptyChat type={conversations.length === 0 ? "noConversations" : "noSelected"} />
        )}
      </div>
    </div>
  );
}
