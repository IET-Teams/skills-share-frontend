"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  ChevronRight,
  ArrowUpRight,
  MessageCircle,
  Loader2,
  X,
  CalendarCheck,
  Send,
  Inbox,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Filter,
  RotateCcw,
} from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "SB";
}

function formatDate(dateStr) {
  if (!dateStr) return "Not scheduled";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    pending:   { color: "#e8b84b", bg: "rgba(232,184,75,0.1)",  label: "Pending" },
    accepted:  { color: "#1d9e75", bg: "rgba(29,158,117,0.1)",  label: "Accepted" },
    completed: { color: "#8a8070", bg: "rgba(138,128,112,0.12)", label: "Completed" },
    rejected:  { color: "#b05252", bg: "rgba(176,82,82,0.1)",   label: "Rejected" },
  };
  const c = config[status] || config.pending;
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border p-4"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: "rgba(232,184,75,0.08)" }}
        >
          <Icon size={16} style={{ color: "#e8b84b" }} />
        </div>
        <div>
          <p className="text-2xl font-medium" style={{ color: "#f5f0e8" }}>{value}</p>
          <p className="text-xs" style={{ color: "#6a6050" }}>{label}</p>
        </div>
      </div>
      {accent && (
        <span
          className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: "rgba(29,158,117,0.12)", color: "#1d9e75" }}
        >
          {accent}
        </span>
      )}
    </motion.div>
  );
}

// ─── SessionCard ──────────────────────────────────────────────────────────────
function SessionCard({ session, type, index, onAccept, onReject, onRate, currentUserId }) {
  const partner = type === "incoming" ? session.requester : session.provider;
  const initials = getInitials(partner?.name);
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === "accept") await onAccept(session.id);
      else if (action === "reject") await onReject(session.id);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border p-4 transition-colors"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: avatar + info */}
        <div className="flex items-start gap-3 min-w-0">
          {partner?.avatar_url ? (
            <img src={partner.avatar_url} alt={partner.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-medium"
              style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#f5f0e8" }}>
              {partner?.name || "Unknown"}
            </p>
            {partner?.department && (
              <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "#6a6050" }}>
                <GraduationCap size={10} />
                {partner.department}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(232,184,75,0.07)", color: "#8a8070", border: "1px solid #2a2520" }}
              >
                <BookOpen size={9} />
                {session.skill?.skill_name || "Skill"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: status + time */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={session.status} />
          <div className="text-right">
            <p className="text-xs flex items-center gap-1" style={{ color: "#4a4438" }}>
              <Clock size={10} />
              {session.scheduled_time ? formatDate(session.scheduled_time) : "Flexible"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#3a342c" }}>
              {timeAgo(session.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Message preview */}
      {session.message && (
        <div
          className="mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed"
          style={{ background: "#0a0908", color: "#6a6050", border: "1px solid #1e1c18" }}
        >
          "{session.message}"
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {/* Incoming pending: accept / reject */}
        {type === "incoming" && session.status === "pending" && (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction("accept")}
              disabled={!!actionLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-all"
              style={{ background: "rgba(29,158,117,0.1)", color: "#1d9e75", border: "1px solid rgba(29,158,117,0.15)" }}
            >
              {actionLoading === "accept" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Accept
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction("reject")}
              disabled={!!actionLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-all"
              style={{ background: "rgba(176,82,82,0.08)", color: "#b05252", border: "1px solid rgba(176,82,82,0.12)" }}
            >
              {actionLoading === "reject" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Reject
            </motion.button>
          </>
        )}

        {/* Completed & not yet rated: rate */}
        {session.status === "completed" && !session.rated && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onRate(session)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-all"
            style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.15)" }}
          >
            <Star size={12} />
            Rate session
          </motion.button>
        )}

        {/* Accepted: message */}
        {session.status === "accepted" && (
          <motion.a
            href={`/chat?user=${type === "incoming" ? session.requester_id : session.provider_id}`}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-all"
            style={{ border: "1px solid #2a2520", color: "#6a6050" }}
          >
            <MessageCircle size={12} />
            Message
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// ─── RatingModal ──────────────────────────────────────────────────────────────
function RatingModal({ session, onSubmit, onClose }) {
  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const partner = session?.requester || session?.provider;

  const handleSubmit = async () => {
    if (score === 0) return;
    setLoading(true);
    await onSubmit({ sessionId: session.id, partnerId: partner?.id, score, feedback });
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 250 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl"
        style={{ background: "#0a0908", border: "1px solid #2a2520", borderBottom: "none" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "#2a2520" }} />
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center px-6 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.2)" }}
            >
              <CheckCircle2 size={28} style={{ color: "#1d9e75" }} />
            </motion.div>
            <p className="mt-4 text-base font-medium" style={{ color: "#f5f0e8" }}>Rating submitted!</p>
            <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>Thank you for your feedback</p>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
              <h2 className="text-base font-medium" style={{ color: "#f5f0e8" }}>Rate your session</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "#141210" }}
              >
                <X size={14} style={{ color: "#8a8070" }} />
              </motion.button>
            </div>

            {/* Partner info */}
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
              <div className="flex items-center gap-3">
                {partner?.avatar_url ? (
                  <img src={partner.avatar_url} alt={partner.name} className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium"
                    style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
                  >
                    {getInitials(partner?.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{partner?.name}</p>
                  <p className="text-xs" style={{ color: "#6a6050" }}>{session?.skill?.skill_name}</p>
                </div>
              </div>
            </div>

            {/* Star rating */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: "#8a8070" }}>How was the session?</p>
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.15 }}
                      onClick={() => setScore(s)}
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-colors"
                    >
                      <Star
                        size={32}
                        style={{
                          color: s <= (hoveredStar || score) ? "#e8b84b" : "#2a2520",
                          fill: s <= (hoveredStar || score) ? "#e8b84b" : "transparent",
                          transition: "all 0.15s ease",
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
                {score > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-2 text-xs"
                    style={{ color: "#e8b84b" }}
                  >
                    {["", "Poor", "Fair", "Good", "Great", "Excellent"][score]}
                  </motion.p>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#8a8070" }}>
                  <MessageCircle size={11} />
                  Feedback <span style={{ color: "#3a342c" }}>(optional)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience…"
                  rows={3}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: "#141210", border: "1px solid #2a2520", color: "#f5f0e8" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid #1a1814" }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="flex-1 rounded-xl py-3 text-sm transition-colors"
                style={{ border: "1px solid #2a2520", color: "#6a6050" }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={score === 0 || loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
                style={{
                  background: score === 0 ? "#1a1814" : loading ? "#1a1814" : "#e8b84b",
                  color: score === 0 ? "#3a342c" : loading ? "#3a342c" : "#0e0c0a",
                }}
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                {loading ? "Submitting…" : "Submit rating"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// ─── EmptySessionState ────────────────────────────────────────────────────────
function EmptySessionState({ tab }) {
  const config = {
    incoming: {
      icon: Inbox,
      title: "No incoming requests",
      subtitle: "When someone requests a session with you, it will appear here",
    },
    outgoing: {
      icon: Send,
      title: "No outgoing requests",
      subtitle: "Explore skills and request sessions from other students",
      cta: { label: "Explore Skills", href: "/explore" },
    },
    completed: {
      icon: CheckCircle2,
      title: "No completed sessions yet",
      subtitle: "Completed sessions and their ratings will appear here",
    },
  };
  const c = config[tab] || config.incoming;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border py-16 text-center"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "#141210", border: "1px solid #2a2520" }}
      >
        <Icon size={22} style={{ color: "#3a342c" }} />
      </div>
      <p className="mt-4 text-sm font-medium" style={{ color: "#4a4438" }}>{c.title}</p>
      <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>{c.subtitle}</p>
      {c.cta && (
        <motion.a
          href={c.cta.href}
          whileTap={{ scale: 0.97 }}
          className="mt-5 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all"
          style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.15)" }}
        >
          {c.cta.label}
          <ArrowRight size={11} />
        </motion.a>
      )}
    </motion.div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
          className="rounded-2xl border p-5"
          style={{ background: "#141210", borderColor: "#1e1c18", height: 140 }}
        />
      ))}
    </div>
  );
}

// ─── Main Sessions Page ───────────────────────────────────────────────────────
export default function SessionsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");
  const [ratingTarget, setRatingTarget] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  // ── Fetch user ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    init();
  }, [supabase]);

  // ── Fetch sessions ──────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id, requester_id, provider_id, status, scheduled_time, message, created_at,
        skill:skill_id (id, skill_name),
        requester:requester_id (id, name, department, avatar_url),
        provider:provider_id (id, name, department, avatar_url)
      `)
      .or(`requester_id.eq.${currentUser.id},provider_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Check which completed sessions are already rated
      const { data: ratings } = await supabase
        .from("ratings")
        .select("session_id")
        .eq("rater_id", currentUser.id);

      const ratedSessionIds = new Set((ratings || []).map((r) => r.session_id));
      const enriched = data.map((s) => ({ ...s, rated: ratedSessionIds.has(s.id) }));

      setSessions(enriched);
      setStats({
        total: enriched.length,
        pending: enriched.filter((s) => s.status === "pending").length,
        completed: enriched.filter((s) => s.status === "completed").length,
      });
    }
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ── Realtime subscription ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("sessions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => fetchSessions()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, currentUser, fetchSessions]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleAccept = async (sessionId) => {
    await supabase.from("sessions").update({ status: "accepted" }).eq("id", sessionId);
  };

  const handleReject = async (sessionId) => {
    await supabase.from("sessions").update({ status: "rejected" }).eq("id", sessionId);
  };

  const handleRate = async ({ sessionId, partnerId, score, feedback }) => {
    await supabase.from("ratings").insert({
      session_id: sessionId,
      rater_id: currentUser.id,
      rated_id: partnerId,
      score,
      feedback,
    });
    fetchSessions();
  };

  // ── Filter sessions by tab ─────────────────────────────────────────────
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === "incoming")  return s.provider_id === currentUser?.id && s.status !== "completed";
    if (activeTab === "outgoing")  return s.requester_id === currentUser?.id && s.status !== "completed";
    if (activeTab === "completed") return s.status === "completed";
    return true;
  });

  const tabs = [
    { id: "incoming",  label: "Incoming",  icon: Inbox, count: sessions.filter((s) => s.provider_id === currentUser?.id && s.status === "pending").length },
    { id: "outgoing",  label: "Outgoing",  icon: Send,  count: sessions.filter((s) => s.requester_id === currentUser?.id && s.status === "pending").length },
    { id: "completed", label: "Completed", icon: CheckCircle2, count: stats.completed },
  ];

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12" style={{ background: "#0e0c0a" }}>
      <div className="mx-auto max-w-4xl">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium" style={{ color: "#f5f0e8" }}>Sessions</h1>
              <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>
                Manage your skill-sharing sessions
              </p>
            </div>
            <motion.a
              href="/main/explore"
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
              style={{ background: "#e8b84b", color: "#0e0c0a" }}
            >
              <BookOpen size={14} />
              Find Skills
            </motion.a>
          </motion.div>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          <StatCard icon={Calendar} label="Total sessions" value={stats.total} index={0} />
          <StatCard icon={Clock} label="Pending" value={stats.pending} accent={stats.pending > 0 ? "Action needed" : null} index={1} />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} index={2} />
        </motion.div>

        {/* ── Tab Switcher ────────────────────────────────────────────── */}
        <div
          className="mb-6 flex items-center gap-1 rounded-2xl p-1.5"
          style={{ background: "#0a0908", border: "1px solid #2a2520" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-colors"
              style={{ color: activeTab === tab.id ? "#0e0c0a" : "#6a6050" }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="session-tab-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "#e8b84b" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <tab.icon size={13} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
                  style={{
                    background: activeTab === tab.id ? "rgba(14,12,10,0.2)" : "rgba(232,184,75,0.1)",
                    color: activeTab === tab.id ? "#0e0c0a" : "#e8b84b",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Session List ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <LoadingSkeleton />
            ) : filteredSessions.length === 0 ? (
              <EmptySessionState tab={activeTab} />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredSessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    type={activeTab === "incoming" || (activeTab === "completed" && session.provider_id === currentUser?.id) ? "incoming" : "outgoing"}
                    index={i}
                    currentUserId={currentUser?.id}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onRate={(s) => setRatingTarget(s)}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Rating Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {ratingTarget && (
          <RatingModal
            session={ratingTarget}
            onSubmit={handleRate}
            onClose={() => setRatingTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
