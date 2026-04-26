"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useRole } from "@/context/RoleContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Wifi,
  WifiOff,
  BookOpen,
  Star,
  Send,
  X,
  AlertCircle,
  Upload,
  Download,
  FileText,
  Trash2,
  Plus,
  ChevronRight,
  Inbox,
  Zap,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  Users,
  Award,
  Activity,
  TrendingDown,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase
// ─────────────────────────────────────────────────────────────────────────────

const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#e8b84b",
    bg: "rgba(232,184,75,0.1)",
    border: "rgba(232,184,75,0.25)",
    icon: Clock,
  },
  accepted: {
    label: "Confirmed",
    color: "#1d9e75",
    bg: "rgba(29,158,117,0.1)",
    border: "rgba(29,158,117,0.3)",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "#1d9e75",
    bg: "rgba(29,158,117,0.1)",
    border: "rgba(29,158,117,0.25)",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Declined",
    color: "#b05252",
    bg: "rgba(176,82,82,0.1)",
    border: "rgba(176,82,82,0.25)",
    icon: XCircle,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ name, url, size = 10 }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const px = size * 4;
  const style = {
    width: px,
    height: px,
    borderRadius: "10px",
    background: "rgba(232,184,75,0.1)",
    color: "#e8b84b",
    fontSize: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(232,184,75,0.18)",
    letterSpacing: "0.02em",
  };
  return url ? (
    <img src={url} alt={name} style={{ ...style, objectFit: "cover" }} />
  ) : (
    <div style={style}>{initials}</div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-medium"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle, cta, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(232,184,75,0.07)",
          border: "1px solid rgba(232,184,75,0.13)",
        }}
      >
        <Icon size={22} style={{ color: "#4a4438" }} />
      </div>
      <p className="mb-1.5 text-sm font-medium" style={{ color: "#6a6050" }}>
        {title}
      </p>
      <p className="text-xs" style={{ color: "#3a3428" }}>
        {subtitle}
      </p>
      {cta && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCta}
          className="mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium"
          style={{
            background: "rgba(232,184,75,0.1)",
            color: "#e8b84b",
            border: "1px solid rgba(232,184,75,0.2)",
          }}
        >
          {cta} <ArrowRight size={11} />
        </motion.button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  color = "#e8b84b",
  index = 0,
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="rounded-2xl border p-4 flex flex-col gap-3"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ background: `${color}14`, border: `1px solid ${color}22` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p
          className="text-2xl font-semibold leading-none"
          style={{ color: "#f5f0e8" }}
        >
          {value}
        </p>
        <p className="mt-1 text-xs" style={{ color: "#6a6050" }}>
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-[10px]" style={{ color: "#3a3428" }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notes Panel
// ─────────────────────────────────────────────────────────────────────────────

function NotesPanel({ session, isTutor }) {
  const supabase = createSupabaseClient();
  const [notes, setNotes] = useState(session.notes || []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `session-notes/${session.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("skillbridge-notes")
        .upload(path, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage
          .from("skillbridge-notes")
          .getPublicUrl(path);
        const newNote = {
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
        };
        const updated = [...notes, newNote];
        setNotes(updated);
        await supabase
          .from("sessions")
          .update({ notes: updated })
          .eq("id", session.id);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (idx) => {
    const updated = notes.filter((_, i) => i !== idx);
    setNotes(updated);
    await supabase
      .from("sessions")
      .update({ notes: updated })
      .eq("id", session.id);
  };

  if (session.status !== "completed") return null;

  return (
    <div
      className="mt-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid #1a1814" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: "#0e0c0a" }}
      >
        <FileText size={11} style={{ color: "#e8b84b" }} />
        <span
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: "#4a4438" }}
        >
          Session notes — {isTutor ? "Upload for Student" : "Download"}
        </span>
        {notes.length > 0 && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
          >
            {notes.length}
          </span>
        )}
        {isTutor && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleUpload}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium"
              style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b" }}
            >
              {uploading ? (
                <>
                  <Loader2 size={9} className="animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload size={9} /> Upload
                </>
              )}
            </motion.button>
          </>
        )}
      </div>

      {/* File list */}
      {notes.length > 0 ? (
        <div style={{ background: "#0a0908" }}>
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-3 py-2.5"
              style={{ borderTop: "1px solid #141210" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "#141210", border: "1px solid #2a2520" }}
              >
                <FileText size={13} style={{ color: "#e8b84b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "#f5f0e8" }}
                >
                  {note.name}
                </p>
                {note.size && (
                  <p className="text-[10px]" style={{ color: "#4a4438" }}>
                    {Math.round(note.size / 1024)} KB · Uploaded by tutor
                  </p>
                )}
              </div>
              <a href={note.url} target="_blank" rel="noreferrer">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
                  style={{
                    background: "rgba(232,184,75,0.08)",
                    color: "#e8b84b",
                    border: "1px solid rgba(232,184,75,0.15)",
                  }}
                >
                  <Download size={9} /> View
                </motion.button>
              </a>
              {isTutor && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(idx)}
                  className="rounded-lg p-1.5 hover:bg-white/5"
                >
                  <Trash2 size={11} style={{ color: "#3a3428" }} />
                </motion.button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p
          className="px-3 py-2.5 text-[11px]"
          style={{ color: "#3a3428", background: "#0a0908" }}
        >
          {isTutor
            ? "No notes uploaded yet — share resources with the student"
            : "No notes uploaded by tutor yet"}
        </p>
      )}

      {/* Drop zone for tutor upload */}
      {isTutor && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleUpload}
          />
          <motion.div
            whileTap={{ scale: 0.99 }}
            onClick={() => fileRef.current?.click()}
            className="mx-3 mb-3 mt-2 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed py-5 cursor-pointer"
            style={{ borderColor: "#2a2520", background: "#0a0908" }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "#141210", border: "1px solid #2a2520" }}
            >
              <FileText size={16} style={{ color: "#3a3428" }} />
            </div>
            <p className="text-xs" style={{ color: "#6a6050" }}>
              Add another file
            </p>
            <p className="text-[10px]" style={{ color: "#3a3428" }}>
              PDF, image, or doc · max 10 MB
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="mt-1 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium"
              style={{
                background: "#141210",
                borderColor: "#2a2520",
                color: "#6a6050",
              }}
            >
              <Plus size={10} /> Upload
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Session Modal
// ─────────────────────────────────────────────────────────────────────────────

function RateModal({ session, raterId, onClose, onDone }) {
  const supabase = createSupabaseClient();
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const ratedId =
    raterId === session.requester_id
      ? session.provider_id
      : session.requester_id;

  const handleSubmit = async () => {
    if (score === 0) return;
    setSubmitting(true);
    await supabase.from("ratings").insert({
      session_id: session.id,
      rater_id: raterId,
      rated_id: ratedId,
      score,
      feedback,
    });
    setDone(true);
    setTimeout(onDone, 1400);
  };

  const scoreLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 md:items-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border overflow-hidden"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "#1a1814" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
              Rate this session
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6a6050" }}>
              {session.skill?.skill_name || session.skill?.name || "Session"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/5"
          >
            <X size={14} style={{ color: "#6a6050" }} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(29,158,117,0.15)",
                border: "1px solid rgba(29,158,117,0.3)",
              }}
            >
              <CheckCircle2 size={26} style={{ color: "#1d9e75" }} />
            </motion.div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
              Thanks for the feedback!
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs" style={{ color: "#8a8070" }}>
                How was the session?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.82 }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setScore(i)}
                  >
                    <Star
                      size={30}
                      style={{
                        color: i <= (hovered || score) ? "#e8b84b" : "#2a2520",
                        fill:
                          i <= (hovered || score) ? "#e8b84b" : "transparent",
                        transition: "all 0.12s",
                      }}
                    />
                  </motion.button>
                ))}
              </div>
              <div style={{ height: 18 }}>
                {score > 0 && (
                  <motion.p
                    key={score}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium"
                    style={{ color: "#e8b84b" }}
                  >
                    {scoreLabels[score]}
                  </motion.p>
                )}
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs"
                style={{ color: "#6a6050" }}
              >
                Leave a note (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you think of the session?"
                rows={3}
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-xs outline-none"
                style={{
                  background: "#141210",
                  borderColor: "#2a2520",
                  color: "#f5f0e8",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={score === 0 || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
              style={{
                background:
                  score === 0 ? "#141210" : submitting ? "#c9a040" : "#e8b84b",
                color: score === 0 ? "#3a3428" : "#0e0c0a",
                border: score === 0 ? "1px solid #2a2520" : "none",
                cursor: score === 0 ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting…
                </>
              ) : (
                "Submit Rating"
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Bar
// ─────────────────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1"
      style={{ background: "#0a0908", border: "1px solid #2a2520" }}
    >
      {tabs.map(({ id, label, count, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-colors"
          style={{ color: active === id ? "#0e0c0a" : "#6a6050" }}
        >
          {active === id && (
            <motion.div
              layoutId="sessions-tab"
              className="absolute inset-0 rounded-lg"
              style={{ background: "#e8b84b" }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.38 }}
            />
          )}
          {Icon && <Icon size={11} className="relative z-10" />}
          <span className="relative z-10">{label}</span>
          {count > 0 && (
            <span
              className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold"
              style={{
                background:
                  active === id ? "rgba(0,0,0,0.18)" : "rgba(232,184,75,0.18)",
                color: active === id ? "#0e0c0a" : "#e8b84b",
              }}
            >
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Label
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p
      className="text-[10px] font-semibold uppercase tracking-widest mb-2 mt-1"
      style={{ color: "#4a4438" }}
    >
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format date
// ─────────────────────────────────────────────────────────────────────────────

function fmtTime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today · ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} — ${new Date(d.getTime() + 3600000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canJoinSession(s) {
  return (
    s.status === "accepted" &&
    s.scheduled_time &&
    s.meeting_link &&
    Math.abs(new Date(s.scheduled_time) - Date.now()) <= 15 * 60 * 1000
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Session Card (Outgoing / Upcoming / Done)
// ─────────────────────────────────────────────────────────────────────────────

function StudentSessionCard({ session: s, userId, onRate, index }) {
  const other = s.requester_id === userId ? s.provider : s.requester;
  const isUpcoming = s.status === "accepted";
  const isCompleted = s.status === "completed";
  const jn = canJoinSession(s);
  const timeStr = fmtTime(s.scheduled_time);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "#0a0908",
        borderColor: isUpcoming
          ? "rgba(29,158,117,0.28)"
          : s.status === "pending"
            ? "rgba(232,184,75,0.18)"
            : "#2a2520",
      }}
    >
      {/* Green top stripe for upcoming */}
      {isUpcoming && (
        <div style={{ height: 2, background: "rgba(29,158,117,0.5)" }} />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={other?.name} url={other?.avatar_url} size={10} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#f5f0e8" }}
                >
                  {s.skill?.skill_name || s.skill?.name || "Session"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                  {other?.name || "Tutor"} · Tutor
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            {timeStr && (
              <p
                className="mt-1.5 flex items-center gap-1.5 text-xs"
                style={{ color: "#6a6050" }}
              >
                <Calendar size={10} /> {timeStr}
              </p>
            )}
            {/* Session meta for completed */}
            {isCompleted && (s.duration_minutes || s.student_rating) && (
              <div className="mt-1.5 flex items-center gap-3">
                {s.duration_minutes && (
                  <span
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "#6a6050" }}
                  >
                    <Clock size={9} /> {s.duration_minutes} min session
                  </span>
                )}
                {s.student_rating && (
                  <span
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "#e8b84b" }}
                  >
                    <Star size={9} fill="#e8b84b" /> Student rated{" "}
                    {s.student_rating} ★
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Join button */}
        {jn && (
          <motion.a
            href={s.meeting_link}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.97 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
            style={{
              background: "#1d9e75",
              color: "#f5f0e8",
            }}
          >
            <Wifi size={14} /> Join Session
          </motion.a>
        )}

        {/* Upcoming — Message button */}
        {isUpcoming && !jn && (
          <div className="mt-3 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium"
              style={{
                background: "rgba(29,158,117,0.08)",
                borderColor: "rgba(29,158,117,0.2)",
                color: "#1d9e75",
              }}
            >
              <WifiOff size={12} /> Session not yet live
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium"
              style={{ borderColor: "#2a2520", color: "#6a6050" }}
            >
              <MessageSquare size={12} /> Message
            </motion.button>
          </div>
        )}

        {/* Rate button */}
        {isCompleted && !s.rated_by_requester && s.requester_id === userId && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onRate(s)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
            style={{
              background: "rgba(232,184,75,0.08)",
              border: "1px solid rgba(232,184,75,0.2)",
              color: "#e8b84b",
            }}
          >
            <Star size={13} /> Rate this Session
          </motion.button>
        )}

        {/* Notes panel */}
        {isCompleted && <NotesPanel session={s} isTutor={false} />}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor Incoming Card
// ─────────────────────────────────────────────────────────────────────────────

function TutorIncomingCard({ session: s, onAccept, onDecline, index }) {
  const [loading, setLoading] = useState(null);

  const handle = async (action) => {
    setLoading(action);
    await (action === "accept" ? onAccept(s.id) : onDecline(s.id));
    setLoading(null);
  };

  const timeStr = fmtTime(s.scheduled_time);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#0a0908", borderColor: "rgba(232,184,75,0.2)" }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar
            name={s.requester?.name}
            url={s.requester?.avatar_url}
            size={10}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#f5f0e8" }}
                >
                  {s.requester?.name || "Student"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                  Wants to learn:{" "}
                  <span style={{ color: "#e8b84b", fontWeight: 500 }}>
                    {s.skill?.skill_name || s.skill?.name || "a skill"}
                  </span>
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            {timeStr && (
              <p
                className="mt-1.5 flex items-center gap-1.5 text-xs"
                style={{ color: "#6a6050" }}
              >
                <Calendar size={10} /> {timeStr}
              </p>
            )}
            {s.requester_message && (
              <p
                className="mt-2 rounded-lg border-l-2 pl-2.5 text-xs italic leading-relaxed"
                style={{ color: "#6a6050", borderColor: "#3a342c" }}
              >
                {`"${s.requester_message}"`}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handle("decline")}
            disabled={!!loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium"
            style={{
              borderColor: "#2a2520",
              color: "#6a6050",
              background: "transparent",
            }}
          >
            {loading === "decline" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <XCircle size={13} />
            )}
            Decline
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handle("accept")}
            disabled={!!loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold"
            style={{
              background: loading === "accept" ? "#c9a040" : "#1d9e75",
              color: "#f5f0e8",
              transition: "background 0.2s",
            }}
          >
            {loading === "accept" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={13} />
            )}
            Accept
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center rounded-xl border px-3 py-2.5"
            style={{ borderColor: "#2a2520", color: "#6a6050" }}
          >
            <MessageSquare size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor Session Card (Upcoming / Completed)
// ─────────────────────────────────────────────────────────────────────────────

function TutorSessionCard({ session: s, userId, onRate, index }) {
  const isUpcoming = s.status === "accepted";
  const isCompleted = s.status === "completed";
  const jn = canJoinSession(s);
  const timeStr = fmtTime(s.scheduled_time);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "#0a0908",
        borderColor: isUpcoming ? "rgba(29,158,117,0.28)" : "#2a2520",
      }}
    >
      {isUpcoming && (
        <div style={{ height: 2, background: "rgba(29,158,117,0.5)" }} />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar
            name={s.requester?.name}
            url={s.requester?.avatar_url}
            size={10}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#f5f0e8" }}
                >
                  {s.skill?.skill_name || s.skill?.name || "Session"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                  with {s.requester?.name || "Student"}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            {timeStr && (
              <p
                className="mt-1.5 flex items-center gap-1.5 text-xs"
                style={{ color: "#6a6050" }}
              >
                <Calendar size={10} /> {timeStr}
              </p>
            )}
            {isCompleted && (s.duration_minutes || s.student_rating) && (
              <div className="mt-1.5 flex items-center gap-3">
                {s.duration_minutes && (
                  <span
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "#6a6050" }}
                  >
                    <Clock size={9} /> {s.duration_minutes} min session
                  </span>
                )}
                {s.student_rating && (
                  <span
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "#e8b84b" }}
                  >
                    <Star size={9} fill="#e8b84b" /> Student rated{" "}
                    {s.student_rating} ★
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Join */}
        {jn && (
          <motion.a
            href={s.meeting_link}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.97 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: "#1d9e75", color: "#f5f0e8" }}
          >
            <Wifi size={14} /> Join Session
          </motion.a>
        )}

        {/* Upcoming message button */}
        {isUpcoming && !jn && (
          <div className="mt-3 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium"
              style={{
                background: "rgba(29,158,117,0.08)",
                borderColor: "rgba(29,158,117,0.2)",
                color: "#1d9e75",
              }}
            >
              <WifiOff size={12} /> Session not yet live
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium"
              style={{ borderColor: "#2a2520", color: "#6a6050" }}
            >
              <MessageSquare size={12} />
            </motion.button>
          </div>
        )}

        {/* Rate student */}
        {isCompleted && !s.rated_by_provider && s.provider_id === userId && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onRate(s)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
            style={{
              background: "rgba(232,184,75,0.08)",
              border: "1px solid rgba(232,184,75,0.2)",
              color: "#e8b84b",
            }}
          >
            <Star size={13} /> Rate Student
          </motion.button>
        )}

        {/* Notes */}
        {isCompleted && (
          <>
            <NotesPanel session={s} isTutor={s.provider_id === userId} />
            <div className="mt-3 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium"
                style={{ borderColor: "#2a2520", color: "#6a6050" }}
              >
                <MessageSquare size={12} /> Message student
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold"
                style={{ background: "#e8b84b", color: "#0e0c0a" }}
              >
                <Award size={12} /> Mark level up
              </motion.button>
            </div>
            <p
              className="mt-1.5 text-center text-[10px]"
              style={{ color: "#3a3428" }}
            >
              Tutor action — student sees notes as download-only
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Student View
// ─────────────────────────────────────────────────────────────────────────────

function StudentView({ sessions, userId, onRate }) {
  const [tab, setTab] = useState("upcoming");

  const outgoing = sessions.filter((s) => s.requester_id === userId);
  const upcoming = outgoing.filter((s) => s.status === "accepted");
  const pending = outgoing.filter((s) => s.status === "pending");
  const completed = outgoing.filter((s) => s.status === "completed");
  const declined = outgoing.filter((s) => s.status === "rejected");

  const TABS = [
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcoming.length,
      icon: Calendar,
    },
    {
      id: "outgoing",
      label: "Outgoing",
      count: pending.length,
      icon: ArrowRight,
    },
    { id: "done", label: "Done", count: 0, icon: CheckCircle2 },
  ];

  const renderContent = () => {
    if (tab === "upcoming") {
      return upcoming.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming sessions"
          subtitle="Accepted sessions will appear here"
          cta="Find a Tutor"
        />
      ) : (
        <>
          <SectionLabel>Confirmed · {upcoming.length}</SectionLabel>
          {upcoming.map((s, i) => (
            <StudentSessionCard
              key={s.id}
              session={s}
              userId={userId}
              onRate={onRate}
              index={i}
            />
          ))}
        </>
      );
    }

    if (tab === "outgoing") {
      return pending.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No pending requests"
          subtitle="Requests waiting for tutor response show here"
          cta="Browse Tutors"
        />
      ) : (
        <>
          <SectionLabel>Waiting for response · {pending.length}</SectionLabel>
          {pending.map((s, i) => (
            <StudentSessionCard
              key={s.id}
              session={s}
              userId={userId}
              onRate={onRate}
              index={i}
            />
          ))}
        </>
      );
    }

    // done tab
    const all = [...completed, ...declined];
    return all.length === 0 ? (
      <EmptyState
        icon={CheckCircle2}
        title="No completed sessions yet"
        subtitle="Finished sessions and their notes will appear here"
      />
    ) : (
      <>
        {completed.length > 0 && (
          <>
            <SectionLabel>Completed · {completed.length}</SectionLabel>
            {completed.map((s, i) => (
              <StudentSessionCard
                key={s.id}
                session={s}
                userId={userId}
                onRate={onRate}
                index={i}
              />
            ))}
          </>
        )}
        {declined.length > 0 && (
          <>
            <SectionLabel className="mt-3">
              Declined · {declined.length}
            </SectionLabel>
            {declined.map((s, i) => (
              <StudentSessionCard
                key={s.id}
                session={s}
                userId={userId}
                onRate={onRate}
                index={i + completed.length}
              />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-3">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor View
// ─────────────────────────────────────────────────────────────────────────────

function TutorView({ sessions, userId, onAccept, onDecline, onRate }) {
  const [tab, setTab] = useState("incoming");

  const incoming = sessions.filter(
    (s) => s.provider_id === userId && s.status === "pending",
  );
  const upcoming = sessions.filter(
    (s) => s.provider_id === userId && s.status === "accepted",
  );
  const completed = sessions.filter(
    (s) => s.provider_id === userId && s.status === "completed",
  );
  const declined = sessions.filter(
    (s) => s.provider_id === userId && s.status === "rejected",
  );

  const TABS = [
    { id: "incoming", label: "Incoming", count: incoming.length, icon: Inbox },
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcoming.length,
      icon: Calendar,
    },
    { id: "done", label: "Done", count: 0, icon: CheckCircle2 },
  ];

  const renderContent = () => {
    if (tab === "incoming") {
      return incoming.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No incoming requests"
          subtitle="When students request a session with you, they'll appear here"
        />
      ) : (
        <>
          <SectionLabel>New requests · {incoming.length}</SectionLabel>
          {incoming.map((s, i) => (
            <TutorIncomingCard
              key={s.id}
              session={s}
              onAccept={onAccept}
              onDecline={onDecline}
              index={i}
            />
          ))}
        </>
      );
    }

    if (tab === "upcoming") {
      return upcoming.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming sessions"
          subtitle="Accept incoming requests to fill your schedule"
        />
      ) : (
        <>
          <SectionLabel>Confirmed · {upcoming.length}</SectionLabel>
          {upcoming.map((s, i) => (
            <TutorSessionCard
              key={s.id}
              session={s}
              userId={userId}
              onRate={onRate}
              index={i}
            />
          ))}
        </>
      );
    }

    const all = [...completed, ...declined];
    return all.length === 0 ? (
      <EmptyState
        icon={CheckCircle2}
        title="No completed sessions yet"
        subtitle="Your teaching history and notes will appear here"
      />
    ) : (
      <>
        {completed.length > 0 && (
          <>
            <SectionLabel>Completed · {completed.length}</SectionLabel>
            {completed.map((s, i) => (
              <TutorSessionCard
                key={s.id}
                session={s}
                userId={userId}
                onRate={onRate}
                index={i}
              />
            ))}
          </>
        )}
        {declined.length > 0 && (
          <>
            <SectionLabel>Declined · {declined.length}</SectionLabel>
            {declined.map((s, i) => (
              <TutorSessionCard
                key={s.id}
                session={s}
                userId={userId}
                onRate={onRate}
                index={i + completed.length}
              />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-3">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Sessions Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const { role } = useRole();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rateModal, setRateModal] = useState(null);
  const fetchSessions = useCallback(
    async (uid, silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const { data } = await supabase
        .from("sessions")
        .select(
          `*,
          requester:requester_id(name, avatar_url),
          provider:provider_id(name, avatar_url),
          skill:skill_id(skill_name, name)`,
        )
        .or(`requester_id.eq.${uid},provider_id.eq.${uid}`)
        .order("created_at", { ascending: false });

      setSessions(data || []);
      setLoading(false);
      setRefreshing(false);
    },
    [supabase],
  );

  useEffect(() => {
    async function init() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      setUser(authUser);
      await fetchSessions(authUser.id);

      // Realtime
      const channel = supabase
        .channel("sessions-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sessions",
            filter: `requester_id=eq.${authUser.id}`,
          },
          () => fetchSessions(authUser.id, true),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sessions",
            filter: `provider_id=eq.${authUser.id}`,
          },
          () => fetchSessions(authUser.id, true),
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
    init();
  }, [supabase, router, fetchSessions]);

  const handleAccept = async (sessionId) => {
    const { error } = await supabase
      .from("sessions")
      .update({ status: "accepted" })
      .eq("id", sessionId);
    if (!error) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "accepted" } : s,
        ),
      );
    }
  };

  const handleDecline = async (sessionId) => {
    const { error } = await supabase
      .from("sessions")
      .update({ status: "rejected" })
      .eq("id", sessionId);
    if (!error) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "rejected" } : s,
        ),
      );
    }
  };

  // ── Stats ──
  const uid = user?.id;
  const relevantSessions = sessions.filter((s) =>
    role === "tutor" ? s.provider_id === uid : s.requester_id === uid,
  );
  const totalSessions = relevantSessions.length;
  const completedCount = relevantSessions.filter(
    (s) => s.status === "completed",
  ).length;
  const pendingCount = relevantSessions.filter(
    (s) => s.status === "pending",
  ).length;
  const upcomingCount = relevantSessions.filter(
    (s) => s.status === "accepted",
  ).length;

  // ── Next upcoming session ──
  const nextSession = sessions
    .filter(
      (s) =>
        s.status === "accepted" &&
        s.scheduled_time &&
        new Date(s.scheduled_time) > new Date(),
    )
    .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))[0];

  // ── Loading ──
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#0e0c0a" }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2 text-sm"
          style={{ color: "#4a4438" }}
        >
          <Loader2 size={14} className="animate-spin" />
          Loading sessions…
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-8 lg:px-12"
      style={{ background: "#0e0c0a" }}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        {/* ── Page Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "#f5f0e8" }}>
              Sessions
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "#6a6050" }}>
              {role === "tutor"
                ? "Manage student requests and your teaching schedule"
                : "Manage your skill-sharing sessions"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => uid && fetchSessions(uid, true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border"
              style={{ background: "#0a0908", borderColor: "#2a2520" }}
              title="Refresh"
            >
              <RefreshCw
                size={13}
                style={{ color: refreshing ? "#e8b84b" : "#6a6050" }}
                className={refreshing ? "animate-spin" : ""}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                router.push(role === "tutor" ? "/profile" : "/explore")
              }
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{
                background: "#0a0908",
                borderColor: "rgba(232,184,75,0.28)",
                color: "#e8b84b",
              }}
            >
              <BookOpen size={11} />
              {role === "tutor" ? "My Profile" : "Find Skills"}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Calendar}
            value={totalSessions}
            label="Total"
            sub="all sessions"
            color="#e8b84b"
            index={1}
          />
          <StatCard
            icon={Clock}
            value={pendingCount + upcomingCount}
            label={role === "tutor" ? "Pending" : "Active"}
            sub={`${upcomingCount} upcoming`}
            color="#60a5fa"
            index={2}
          />
          <StatCard
            icon={CheckCircle2}
            value={completedCount}
            label="Done"
            sub="completed"
            color="#1d9e75"
            index={3}
          />
        </div>

        {/* ── Next Upcoming Banner ── */}
        <AnimatePresence>
          {nextSession &&
            (() => {
              const other =
                nextSession.requester_id === uid
                  ? nextSession.provider
                  : nextSession.requester;
              const jn = canJoinSession(nextSession);

              return (
                <motion.div
                  key="next-banner"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.97 }}
                  custom={4}
                  className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5"
                  style={{
                    background: "rgba(29,158,117,0.07)",
                    borderColor: "rgba(29,158,117,0.22)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(29,158,117,0.15)",
                        border: "1px solid rgba(29,158,117,0.25)",
                      }}
                    >
                      <Calendar size={16} style={{ color: "#1d9e75" }} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#f5f0e8" }}
                      >
                        {nextSession.skill?.skill_name ||
                          nextSession.skill?.name ||
                          "Session"}{" "}
                        · {other?.name}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "#1d9e75" }}
                      >
                        {fmtTime(nextSession.scheduled_time)}
                      </p>
                    </div>
                  </div>

                  {jn && nextSession.meeting_link ? (
                    <a
                      href={nextSession.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
                        style={{ background: "#1d9e75", color: "#f5f0e8" }}
                      >
                        <Wifi size={11} /> Join
                      </motion.button>
                    </a>
                  ) : (
                    <span
                      className="rounded-xl px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: "rgba(29,158,117,0.12)",
                        color: "#1d9e75",
                      }}
                    >
                      Upcoming
                    </span>
                  )}
                </motion.div>
              );
            })()}
        </AnimatePresence>

        {/* ── Role-aware content ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {role === "student" ? (
                <StudentView
                  sessions={sessions}
                  userId={uid}
                  onRate={setRateModal}
                />
              ) : (
                <TutorView
                  sessions={sessions}
                  userId={uid}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onRate={setRateModal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Rate Modal ── */}
      <AnimatePresence>
        {rateModal && (
          <RateModal
            session={rateModal}
            raterId={uid}
            onClose={() => setRateModal(null)}
            onDone={() => {
              setRateModal(null);
              if (uid) fetchSessions(uid, true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
