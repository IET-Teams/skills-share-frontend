"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Plus,
  X,
} from "lucide-react";

// ─── Supabase singleton (outside component to avoid re-creation) ──────────────
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SB"
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatMessageTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateHeader(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, avatar_url, size = 10, rounded = "xl" }) {
  const sizeClass = `h-${size} w-${size}`;
  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={name}
        className={`${sizeClass} rounded-${rounded} object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-${rounded} flex items-center justify-center text-sm font-medium shrink-0`}
      style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── ConversationItem ─────────────────────────────────────────────────────────
function ConversationItem({ conversation, isActive, onClick }) {
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
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        <Avatar name={conversation.name} avatar_url={conversation.avatar_url} size={10} />
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
            style={{
              color: hasUnread ? "#f5f0e8" : "#c8bfb0",
              fontWeight: hasUnread ? 500 : 400,
            }}
          >
            {conversation.name}
          </p>
          {conversation.lastMessageTime && (
            <span
              className="shrink-0 text-xs"
              style={{ color: hasUnread ? "#e8b84b" : "#3a342c" }}
            >
              {formatTime(conversation.lastMessageTime)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="truncate text-xs" style={{ color: hasUnread ? "#8a8070" : "#4a4438" }}>
            {conversation.lastMessage || (
              <span style={{ color: "#3a342c", fontStyle: "italic" }}>No messages yet</span>
            )}
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

// ─── NewChatModal ─────────────────────────────────────────────────────────────
// Searches profiles where chat_access contains "all" or current user's id
function NewChatModal({ currentUserId, existingConvoIds, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch accessible profiles on open + when query changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true);

      // Fetch profiles that:
      // 1. Are public (chat_access contains "all")  OR
      // 2. Have granted current user explicit access
      // 3. Are not the current user themselves
      let q = supabase
        .from("profiles")
        .select("id, name, department, avatar_url, chat_access")
        .neq("id", currentUserId)
        .or(
          `chat_access.cs.{"all"},chat_access.cs.{"${currentUserId}"}`
        );

      if (query.trim()) {
        q = q.ilike("name", `%${query.trim()}%`);
      }

      const { data, error } = await q.limit(20);

      if (!error && data) {
        setResults(data);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentUserId]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#141210", border: "1px solid #2a2520" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid #1e1c18" }}
        >
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            New conversation
          </p>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ color: "#6a6050" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f0e8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6a6050")}
          >
            <X size={14} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#4a4438" }}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people…"
              className="w-full rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none"
              style={{
                background: "#0e0c0a",
                border: "1px solid #2a2520",
                color: "#f5f0e8",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={16} className="animate-spin" style={{ color: "#4a4438" }} />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs" style={{ color: "#3a342c" }}>
                {query ? "No people found" : "No accessible profiles found"}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>
                Users appear here when they set their profile to public
              </p>
            </div>
          ) : (
            results.map((profile) => {
              const alreadyChattting = existingConvoIds.includes(profile.id);
              return (
                <motion.button
                  key={profile.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(profile)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Avatar name={profile.name} avatar_url={profile.avatar_url} size={9} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm" style={{ color: "#f5f0e8" }}>
                      {profile.name}
                    </p>
                    {profile.department && (
                      <p className="truncate text-xs" style={{ color: "#6a6050" }}>
                        {profile.department}
                      </p>
                    )}
                  </div>
                  {alreadyChattting && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-xs"
                      style={{
                        background: "rgba(232,184,75,0.08)",
                        color: "#8a7040",
                        border: "1px solid rgba(232,184,75,0.15)",
                      }}
                    >
                      Active
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, isMine, showAvatar, partnerName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar — only for partner's first message in a group */}
      {!isMine && showAvatar ? (
        <Avatar name={partnerName} size={7} rounded="lg" />
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
          {isMine && <CheckCheck size={11} style={{ color: "#4a4438" }} />}
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
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
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
function EmptyChat({ type, onNewChat }) {
  const config = {
    noConversations: {
      title: "No conversations yet",
      subtitle: 'Click "New chat" to message someone',
    },
    noSelected: {
      title: "Select a conversation",
      subtitle: "Pick a conversation from the sidebar to start chatting",
    },
  };
  const c = config[type] || config.noSelected;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
        style={{ background: "#141210", border: "1px solid #2a2520" }}
      >
        <MessageCircle size={24} style={{ color: "#3a342c" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#4a4438" }}>
        {c.title}
      </p>
      <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>
        {c.subtitle}
      </p>
      {type === "noConversations" && onNewChat && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNewChat}
          className="mt-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          style={{ background: "#e8b84b", color: "#0e0c0a" }}
        >
          <Plus size={15} />
          New chat
        </motion.button>
      )}
    </div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user"); // pre-open a conversation from ?user=uuid

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  // Track realtime channel so we can clean it up on activeConvoId change
  const realtimeChannelRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Fetch current user ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  // ── Build conversations list from message history ────────────────────────
  // Also pre-opens targetUserId from URL param if present
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data: allMessages, error } = await supabase
      .from("messages")
      .select("id, content, sender_id, receiver_id, created_at, read")
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchConversations error:", error.message);
      setLoading(false);
      return;
    }

    // Group messages by conversation partner
    const convosMap = new Map();
    for (const msg of allMessages || []) {
      const partnerId =
        msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
      if (!convosMap.has(partnerId)) {
        convosMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unread: 0,
        });
      }
      if (msg.receiver_id === currentUser.id && !msg.read) {
        convosMap.get(partnerId).unread += 1;
      }
    }

    const partnerIds = [...convosMap.keys()];

    // Fetch profile info for all partners
    let enriched = [];
    if (partnerIds.length > 0) {
      const { data: partners } = await supabase
        .from("profiles")
        .select("id, name, department, avatar_url")
        .in("id", partnerIds);

      enriched = partnerIds.map((pid) => {
        const conv = convosMap.get(pid);
        const partner = (partners || []).find((p) => p.id === pid) || {};
        return {
          id: pid,
          name: partner.name || "Unknown",
          department: partner.department || null,
          avatar_url: partner.avatar_url || null,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unread: conv.unread,
        };
      });

      enriched.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
    }

    setConversations(enriched);

    // ── Handle ?user=uuid URL param ──────────────────────────────────────
    // If the URL has a target user, pre-open that conversation.
    // If they're already in the list, just select them.
    // If not, fetch their profile and add a stub conversation.
    if (targetUserId) {
      const existing = enriched.find((c) => c.id === targetUserId);
      if (existing) {
        setActiveConvoId(targetUserId);
        setShowSidebar(false);
      } else {
        const { data: targetProfile } = await supabase
          .from("profiles")
          .select("id, name, department, avatar_url")
          .eq("id", targetUserId)
          .single();

        if (targetProfile) {
          const stub = {
            id: targetProfile.id,
            name: targetProfile.name,
            department: targetProfile.department || null,
            avatar_url: targetProfile.avatar_url || null,
            lastMessage: "",
            lastMessageTime: new Date().toISOString(),
            unread: 0,
          };
          setConversations((prev) => {
            // Avoid duplicates if already in list
            const exists = prev.find((c) => c.id === stub.id);
            return exists ? prev : [stub, ...prev];
          });
          setActiveConvoId(targetUserId);
          setShowSidebar(false);
        }
      }
    }

    setLoading(false);
  }, [currentUser, targetUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch messages for the active conversation ──────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !activeConvoId) return;
    setMessagesLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeConvoId}),` +
        `and(sender_id.eq.${activeConvoId},receiver_id.eq.${currentUser.id})`
      )
      .order("created_at", { ascending: true });

    if (!error) setMessages(data || []);
    setMessagesLoading(false);

    // Mark incoming messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", activeConvoId)
      .eq("receiver_id", currentUser.id)
      .eq("read", false);

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvoId ? { ...c, unread: 0 } : c))
    );
  }, [currentUser, activeConvoId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Realtime subscription ───────────────────────────────────────────────
  // Re-subscribes whenever activeConvoId changes so incoming messages from
  // the active conversation are added immediately without a refetch.
  useEffect(() => {
    if (!currentUser) return;

    // Remove previous channel before creating a new one
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`chat-realtime-${currentUser.id}`)
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

          if (newMsg.sender_id === activeConvoId) {
            // Message is from the open conversation — append it and mark read
            setMessages((prev) => [...prev, newMsg]);
            supabase.from("messages").update({ read: true }).eq("id", newMsg.id);
          } else {
            // Message is from a different conversation — bump unread counter in sidebar
            setConversations((prev) => {
              const exists = prev.find((c) => c.id === newMsg.sender_id);
              if (exists) {
                return prev.map((c) =>
                  c.id === newMsg.sender_id
                    ? {
                      ...c,
                      unread: c.unread + 1,
                      lastMessage: newMsg.content,
                      lastMessageTime: newMsg.created_at,
                    }
                    : c
                );
              }
              // Sender not in list yet — fetch their profile and add them
              supabase
                .from("profiles")
                .select("id, name, department, avatar_url")
                .eq("id", newMsg.sender_id)
                .single()
                .then(({ data: profile }) => {
                  if (profile) {
                    setConversations((p) => [
                      {
                        id: profile.id,
                        name: profile.name,
                        department: profile.department || null,
                        avatar_url: profile.avatar_url || null,
                        lastMessage: newMsg.content,
                        lastMessageTime: newMsg.created_at,
                        unread: 1,
                      },
                      ...p,
                    ]);
                  }
                });
              return prev;
            });
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeConvoId]);

  // ── Send a message ──────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content) => {
      if (!currentUser || !activeConvoId) return;

      const { data, error } = await supabase
        .from("messages")
        .insert({ sender_id: currentUser.id, receiver_id: activeConvoId, content })
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) => [...prev, data]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvoId
              ? { ...c, lastMessage: content, lastMessageTime: data.created_at }
              : c
          )
        );
      } else if (error) {
        console.error("Send message error:", error.message);
      }
    },
    [currentUser, activeConvoId]
  );

  // ── New Chat: user selected from modal ──────────────────────────────────
  const handleNewChatSelect = useCallback((profile) => {
    setShowNewChat(false);

    // Add to conversations list if not already there
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === profile.id);
      if (exists) {
        setActiveConvoId(profile.id);
        setShowSidebar(false);
        return prev;
      }
      const stub = {
        id: profile.id,
        name: profile.name,
        department: profile.department || null,
        avatar_url: profile.avatar_url || null,
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unread: 0,
      };
      setActiveConvoId(profile.id);
      setShowSidebar(false);
      return [stub, ...prev];
    });
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  const activePartner = useMemo(
    () => conversations.find((c) => c.id === activeConvoId) || null,
    [conversations, activeConvoId]
  );

  // Sidebar search filters existing conversations by name
  const filteredConversations = useMemo(
    () =>
      searchQuery.trim()
        ? conversations.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : conversations,
    [conversations, searchQuery]
  );

  // Group messages by date — memoized so it's not recalculated on every render
  const messageGroups = useMemo(() => {
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
  }, [messages]);

  const existingConvoIds = useMemo(
    () => conversations.map((c) => c.id),
    [conversations]
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && currentUser && (
          <NewChatModal
            currentUserId={currentUser.id}
            existingConvoIds={existingConvoIds}
            onSelect={handleNewChatSelect}
            onClose={() => setShowNewChat(false)}
          />
        )}
      </AnimatePresence>

      <div
        className="flex h-[calc(100vh-56px)] md:h-screen"
        style={{ background: "#0e0c0a" }}
      >
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div
          className={`${showSidebar ? "flex" : "hidden md:flex"
            } w-full flex-col md:w-80 lg:w-96 shrink-0`}
          style={{ background: "#0a0908", borderRight: "1px solid #1e1c18" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-4"
            style={{ borderBottom: "1px solid #1a1814" }}
          >
            <div>
              <h1 className="text-lg font-medium" style={{ color: "#f5f0e8" }}>
                Chat
              </h1>
              <p className="text-xs" style={{ color: "#4a4438" }}>
                {conversations.length} conversation
                {conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            {/* New Chat button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewChat(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
              style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(232,184,75,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(232,184,75,0.1)")
              }
            >
              <Plus size={13} />
              New chat
            </motion.button>
          </div>

          {/* Search bar */}
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
                style={{
                  background: "#141210",
                  border: "1px solid #1e1c18",
                  color: "#f5f0e8",
                }}
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
                  {!searchQuery && (
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="mt-3 text-xs transition-colors"
                      style={{ color: "#e8b84b" }}
                    >
                      Start one →
                    </button>
                  )}
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

        {/* ── Main Chat Area ────────────────────────────────────────── */}
        <div
          className={`${showSidebar ? "hidden md:flex" : "flex"
            } flex-1 flex-col min-w-0`}
        >
          {activeConvoId && activePartner ? (
            <>
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-4 py-3 shrink-0"
                style={{ background: "#0a0908", borderBottom: "1px solid #1a1814" }}
              >
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setShowSidebar(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl md:hidden"
                  style={{ background: "#141210" }}
                >
                  <ArrowLeft size={14} style={{ color: "#8a8070" }} />
                </motion.button>

                <Avatar
                  name={activePartner.name}
                  avatar_url={activePartner.avatar_url}
                  size={9}
                />

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "#f5f0e8" }}
                  >
                    {activePartner.name}
                  </p>
                  {activePartner.department && (
                    <p className="text-xs" style={{ color: "#6a6050" }}>
                      {activePartner.department}
                    </p>
                  )}
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
                    <Loader2
                      size={18}
                      className="animate-spin"
                      style={{ color: "#4a4438" }}
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: "#141210", border: "1px solid #2a2520" }}
                    >
                      <MessageCircle size={18} style={{ color: "#3a342c" }} />
                    </div>
                      <p className="mt-3 text-sm" style={{ color: "#4a4438" }}>
                        Start a conversation
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "#2a2520" }}>
                        Say hi to {activePartner.name}!
                      </p>
                    </div>
                  ) : (
                      messageGroups.map((item, i) => {
                        if (item.type === "date") {
                          return (
                        <div
                          key={`date-${i}`}
                          className="flex items-center justify-center py-3"
                        >
                          <span
                            className="rounded-full px-3 py-1 text-xs"
                            style={{
                              background: "#141210",
                              color: "#4a4438",
                              border: "1px solid #1e1c18",
                            }}
                          >
                            {formatDateHeader(item.date)}
                          </span>
                        </div>
                      );
                    }

                    const msg = item.data;
                    const isMine = msg.sender_id === currentUser?.id;
                    const prevItem = i > 0 ? messageGroups[i - 1] : null;
                    const showAvatar =
                      !isMine &&
                      (!prevItem ||
                        prevItem.type === "date" ||
                        prevItem.data?.sender_id !== msg.sender_id);

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
            <EmptyChat
              type={conversations.length === 0 ? "noConversations" : "noSelected"}
              onNewChat={() => setShowNewChat(true)}
            />
          )}
        </div>
      </div>
    </>
  );
}