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
  Users,
  Award,
  Video,
  Edit3,
  Check,
  BookMarked,
  GraduationCap,
  Layers,
  ClipboardList,
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

const SKILL_SUGGESTIONS = [
  "React", "Python", "Node.js", "Figma", "Machine Learning",
  "Data Structures", "Flutter", "SQL", "UI/UX Design", "Java",
  "Kotlin", "Docker", "Git", "TypeScript", "AWS", "MongoDB",
  "Django", "Spring Boot", "Swift", "C++",
];

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

function StatCard({ icon: Icon, value, label, sub, color = "#e8b84b", index = 0 }) {
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
        <p className="text-2xl font-semibold leading-none" style={{ color: "#f5f0e8" }}>
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
// Notes Panel (uses resources table)
// ─────────────────────────────────────────────────────────────────────────────

function NotesPanel({ session, isTutor }) {
  const supabase = createSupabaseClient();
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (session.status !== "completed") return;
    supabase
      .from("resources")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setResources(data || []));
  }, [session.id, session.status]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `session-resources/${session.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("skillbridge-notes")
        .upload(path, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage
          .from("skillbridge-notes")
          .getPublicUrl(path);
        const { data: inserted } = await supabase
          .from("resources")
          .insert({
            session_id: session.id,
            course_id: session.course_id || null,
            tutor_id: session.tutor_id,
            student_id: session.student_id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size,
            resource_type: file.type,
            title: file.name,
          })
          .select()
          .single();
        if (inserted) setResources((prev) => [inserted, ...prev]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("resources").delete().eq("id", id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  if (session.status !== "completed") return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid #1a1814" }}>
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "#0e0c0a" }}>
        <FileText size={11} style={{ color: "#e8b84b" }} />
        <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "#4a4438" }}>
          {isTutor ? "Session Resources — Upload for Student" : "Resources & Notes"}
        </span>
        {resources.length > 0 && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
          >
            {resources.length}
          </span>
        )}
        {isTutor && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.zip"
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
                <><Loader2 size={9} className="animate-spin" /> Uploading…</>
              ) : (
                <><Upload size={9} /> Upload</>
              )}
            </motion.button>
          </>
        )}
      </div>

      {resources.length > 0 ? (
        <div style={{ background: "#0a0908" }}>
          {resources.map((r) => (
            <div
              key={r.id}
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
                <p className="text-xs font-medium truncate" style={{ color: "#f5f0e8" }}>
                  {r.title || r.file_name}
                </p>
                {r.file_size && (
                  <p className="text-[10px]" style={{ color: "#4a4438" }}>
                    {Math.round(r.file_size / 1024)} KB · Uploaded by tutor
                  </p>
                )}
              </div>
              <a href={r.file_url} target="_blank" rel="noreferrer">
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
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg p-1.5 hover:bg-white/5"
                >
                  <Trash2 size={11} style={{ color: "#3a3428" }} />
                </motion.button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 py-2.5 text-[11px]" style={{ color: "#3a3428", background: "#0a0908" }}>
          {isTutor
            ? "No resources uploaded yet — share notes, slides, or files with the student"
            : "No resources uploaded by tutor yet"}
        </p>
      )}

      {isTutor && (
        <motion.div
          whileTap={{ scale: 0.99 }}
          onClick={() => fileRef.current?.click()}
          className="mx-3 mb-3 mt-2 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed py-4 cursor-pointer"
          style={{ borderColor: "#2a2520", background: "#0a0908" }}
        >
          <Plus size={14} style={{ color: "#3a3428" }} />
          <p className="text-xs" style={{ color: "#6a6050" }}>Add resource</p>
          <p className="text-[10px]" style={{ color: "#3a3428" }}>
            PDF, image, doc, zip · max 10 MB
          </p>
        </motion.div>
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

  const revieweeId =
    raterId === session.student_id
      ? session.tutor_id
      : session.student_id;

  const handleSubmit = async () => {
    if (score === 0) return;
    setSubmitting(true);
    // Check if already rated
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("session_id", session.id)
      .eq("reviewer_id", raterId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("reviews").insert({
        session_id: session.id,
        reviewer_id: raterId,
        reviewee_id: revieweeId,
        score,
        comment: feedback,
      });
    }
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
              {session.course?.title || session.course?.skill_name || "Session"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
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
              style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)" }}
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
              <p className="text-xs" style={{ color: "#8a8070" }}>How was the session?</p>
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
                        fill: i <= (hovered || score) ? "#e8b84b" : "transparent",
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
              <label className="mb-1.5 block text-xs" style={{ color: "#6a6050" }}>
                Leave a note (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you think of the session?"
                rows={3}
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-xs outline-none"
                style={{ background: "#141210", borderColor: "#2a2520", color: "#f5f0e8", fontFamily: "inherit" }}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={score === 0 || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
              style={{
                background: score === 0 ? "#141210" : submitting ? "#c9a040" : "#e8b84b",
                color: score === 0 ? "#3a3428" : "#0e0c0a",
                border: score === 0 ? "1px solid #2a2520" : "none",
                cursor: score === 0 ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              ) : "Submit Rating"}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Date + Time Slot Picker
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_TIME_SLOTS = [
  { id: "morning",   label: "Morning",   sub: "8 – 12 AM",  hour: 9  },
  { id: "afternoon", label: "Afternoon", sub: "12 – 5 PM",  hour: 14 },
  { id: "evening",   label: "Evening",   sub: "5 – 9 PM",   hour: 18 },
];

function buildSessionDates(count = 10) {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function SessionDatePicker({ onChange, accentColor = "#1d9e75" }) {
  const dates = buildSessionDates(10);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const pick = (date, slotIdx) => {
    const d = date !== undefined ? date : selectedDate;
    const s = slotIdx !== undefined ? slotIdx : selectedSlot;
    if (date !== undefined) setSelectedDate(date);
    if (slotIdx !== undefined) setSelectedSlot(slotIdx);
    if (d && s !== null && s !== undefined) {
      const dt = new Date(d);
      dt.setHours(SESSION_TIME_SLOTS[s].hour, 0, 0, 0);
      onChange(dt.toISOString());
    }
  };

  const fmt = (d) => {
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const top = d.toDateString() === tomorrow.toDateString() ? "Tmrw" : d.toLocaleDateString("en-US", { weekday: "short" });
    const bot = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { top, bot };
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs font-medium" style={{ color: "#8a8070" }}>Proposed date</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {dates.map((d, i) => {
            const { top, bot } = fmt(d);
            const active = selectedDate?.toDateString() === d.toDateString();
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => pick(d, undefined)}
                className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 transition-colors"
                style={{ background: active ? "#e8b84b" : "#141210", borderColor: active ? "#e8b84b" : "#2a2520", minWidth: 54 }}
              >
                <span className="text-[10px] font-semibold" style={{ color: active ? "#0e0c0a" : "#6a6050" }}>{top}</span>
                <span className="text-xs font-bold" style={{ color: active ? "#0e0c0a" : "#f5f0e8" }}>{bot.split(" ")[1]}</span>
                <span className="text-[9px]" style={{ color: active ? "rgba(0,0,0,0.45)" : "#3a3428" }}>{bot.split(" ")[0]}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <p className="mb-2 text-xs font-medium" style={{ color: "#8a8070" }}>Proposed time</p>
          <div className="grid grid-cols-3 gap-2">
            {SESSION_TIME_SLOTS.map((s, i) => {
              const active = selectedSlot === i;
              return (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => pick(undefined, i)}
                  className="flex flex-col items-center gap-0.5 rounded-xl border py-3 transition-colors"
                  style={{
                    background: active ? `${accentColor}18` : "#141210",
                    borderColor: active ? `${accentColor}70` : "#2a2520",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: active ? accentColor : "#c8bfb0" }}>{s.label}</span>
                  <span className="text-[10px]" style={{ color: active ? accentColor : "#4a4438" }}>{s.sub}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accept & Propose Time Modal (Tutor → on accepting a request)
// ─────────────────────────────────────────────────────────────────────────────

function AcceptModal({ session, onClose, onConfirm }) {
  const [scheduledTime, setScheduledTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm(session.id, { scheduledTime, meetingLink, message });
    setSubmitting(false);
  };

  const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";
  const inputStyle = { background: "#141210", borderColor: "#2a2520", color: "#f5f0e8" };

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
        className="w-full max-w-sm rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4 shrink-0"
          style={{ borderColor: "#1a1814" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
              Accept & Schedule
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6a6050" }}>
              Propose a time slot for {session.student?.name || "the student"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
            <X size={14} style={{ color: "#6a6050" }} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3.5">
          <SessionDatePicker onChange={setScheduledTime} accentColor="#1d9e75" />

          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>
              Meeting link (optional — add later)
            </label>
            <input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/... or LiveKit room"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>
              Message to student (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Looking forward to this session! Please review basics beforehand."
              rows={3}
              className={`${inputCls} resize-none`}
              style={inputStyle}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm"
              style={{ borderColor: "#2a2520", color: "#6a6050" }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
              style={{ background: submitting ? "#c9a040" : "#1d9e75", color: "#f5f0e8" }}
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {submitting ? "Confirming…" : "Accept & Send"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Course Modal (for tutors, now in Sessions page)
// ──────────────────────────────────────────────────────────────────���──────────

function AddCourseModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    skill_name: "",
    level: "Beginner",
    summary: "",
    duration: "",
    prerequisites: "",
    outcomes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setErr("Course title is required"); return; }
    setSaving(true);
    const { error } = await onSave({
      title: form.title.trim(),
      skill_name: form.skill_name.trim() || form.title.trim(),
      level: form.level,
      short_description: form.summary.trim(),
      description: [
        form.summary.trim() && `Summary: ${form.summary.trim()}`,
        form.duration.trim() && `Duration: ${form.duration.trim()}`,
        form.prerequisites.trim() && `Prerequisites: ${form.prerequisites.trim()}`,
        form.outcomes.trim() && `Outcomes: ${form.outcomes.trim()}`,
      ].filter(Boolean).join("\n"),
      duration_text: form.duration.trim(),
      prerequisites: form.prerequisites.trim(),
      outcomes: form.outcomes.trim(),
    });
    setSaving(false);
    if (error) { setErr(error.message || "Could not save course"); return; }
    onClose();
  };

  const inputStyle = { background: "#141210", borderColor: "#2a2520", color: "#f5f0e8" };
  const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 md:items-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
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
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>New Course</p>
            <p className="text-xs mt-0.5" style={{ color: "#6a6050" }}>Students can request this from Explore</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
            <X size={14} style={{ color: "#6a6050" }} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Course title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Python Basics Bootcamp" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Primary skill</label>
            <input value={form.skill_name} onChange={(e) => set("skill_name", e.target.value)} placeholder="e.g. Python" className={inputCls} style={inputStyle} list="skill_sugg" />
            <datalist id="skill_sugg">
              {SKILL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Level</label>
            <select value={form.level} onChange={(e) => set("level", e.target.value)} className={inputCls} style={inputStyle}>
              {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Summary</label>
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="What students will learn" rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Duration</label>
              <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 4 weeks" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Prerequisites</label>
              <input value={form.prerequisites} onChange={(e) => set("prerequisites", e.target.value)} placeholder="Optional" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Outcomes</label>
            <textarea value={form.outcomes} onChange={(e) => set("outcomes", e.target.value)} placeholder="What students achieve by the end" rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          {err && <p className="text-xs" style={{ color: "#b05252" }}>{err}</p>}
          <div className="flex gap-2 pt-1">
            <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm" style={{ borderColor: "#2a2520", color: "#6a6050" }}>Cancel</motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
              style={{ background: saving ? "#1a1814" : "#e8b84b", color: saving ? "#3a342c" : "#0e0c0a" }}
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving..." : "Add Course"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Bar
// ─────────────────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ background: "#0a0908", border: "1px solid #2a2520" }}>
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
                background: active === id ? "rgba(0,0,0,0.18)" : "rgba(232,184,75,0.18)",
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

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 mt-1" style={{ color: "#4a4438" }}>
      {children}
    </p>
  );
}

function fmtTime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today · ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} — ${new Date(d.getTime() + 3600000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function canJoinSession(s) {
  return (
    s.status === "accepted" &&
    s.scheduled_at &&
    s.meeting_link &&
    Math.abs(new Date(s.scheduled_at) - Date.now()) <= 15 * 60 * 1000
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Session Card
// ─────────────────────────────────────────────────────────────────────────────

function StudentSessionCard({ session: s, userId, onRate, index }) {
  const other = s.student_id === userId ? s.tutor : s.student;
  const isPending = s.status === "pending";
  const isUpcoming = s.status === "accepted";
  const isCompleted = s.status === "completed";
  const jn = canJoinSession(s);
  const timeStr = fmtTime(s.scheduled_at);
  const preferredStr = fmtTime(s.preferred_time);
  const courseTitle = s.course?.title || s.course?.skill_name || "Session";

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
        borderColor: isPending ? "rgba(232,184,75,0.2)" : "#2a2520",
      }}
    >
      {isPending && <div style={{ height: 2, background: "rgba(232,184,75,0.35)" }} />}
      {isUpcoming && <div style={{ height: 2, background: "rgba(29,158,117,0.5)" }} />}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={other?.name} url={other?.avatar_url} size={10} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#f5f0e8" }}>
                  {courseTitle}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                  {other?.name || "Tutor"} · Tutor
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            {isPending && preferredStr && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#8a8070" }}>
                <Clock size={10} /> Preferred: {preferredStr}
              </p>
            )}
            {!isPending && timeStr && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#6a6050" }}>
                <Calendar size={10} /> {timeStr}
              </p>
            )}
            {s.tutor_message && (
              <p
                className="mt-2 rounded-lg border-l-2 pl-2.5 text-xs italic leading-relaxed"
                style={{ color: "#6a6050", borderColor: "#1d9e75" }}
              >
                {`"${s.tutor_message}"`}
              </p>
            )}
            {isCompleted && s.duration_minutes && (
              <span className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: "#6a6050" }}>
                <Clock size={9} /> {s.duration_minutes} min session
              </span>
            )}
          </div>
        </div>

        {/* Pending — awaiting tutor */}
        {isPending && (
          <div
            className="mt-3 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium"
            style={{ background: "rgba(232,184,75,0.05)", borderColor: "rgba(232,184,75,0.18)", color: "#8a8070" }}
          >
            <Clock size={12} style={{ color: "#e8b84b" }} />
            <span>Awaiting tutor response</span>
          </div>
        )}

        {/* Live join */}
        {jn && (
          <motion.a
            href={s.meeting_link}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.97 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: "#1d9e75", color: "#f5f0e8" }}
          >
            <Video size={14} /> Join Live Session
          </motion.a>
        )}

        {/* Upcoming — waiting */}
        {isUpcoming && !jn && (
          <div className="mt-3 flex gap-2">
            <div
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium"
              style={{ background: "rgba(29,158,117,0.06)", borderColor: "rgba(29,158,117,0.18)", color: "#1d9e75" }}
            >
              <Calendar size={12} /> Session scheduled
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium"
              style={{ borderColor: "#2a2520", color: "#6a6050" }}
            >
              <MessageSquare size={12} /> Message
            </motion.button>
          </div>
        )}

        {/* Rate */}
        {isCompleted && s.student_id === userId && (
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

        {/* Notes from tutor */}
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
    if (action === "accept") {
      await onAccept(s);
    } else {
      await onDecline(s.id);
    }
    setLoading(null);
  };

  const timeStr = fmtTime(s.scheduled_at);
  const courseTitle = s.course?.title || s.course?.skill_name || "a skill";

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
      {/* Gold top stripe */}
      <div style={{ height: 2, background: "rgba(232,184,75,0.4)" }} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar name={s.student?.name} url={s.student?.avatar_url} size={10} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>
                  {s.student?.name || "Student"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                  Wants to learn:{" "}
                  <span style={{ color: "#e8b84b", fontWeight: 500 }}>{courseTitle}</span>
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>

            {/* Requested time slot from student */}
            {s.preferred_time && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#6a6050" }}>
                <Clock size={10} /> Preferred: {fmtTime(s.preferred_time)}
              </p>
            )}
            {timeStr && !s.preferred_time && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#6a6050" }}>
                <Calendar size={10} /> {timeStr}
              </p>
            )}

            {s.tutor_message && (
              <p
                className="mt-2 rounded-lg border-l-2 pl-2.5 text-xs italic leading-relaxed"
                style={{ color: "#6a6050", borderColor: "#3a342c" }}
              >
                {`"${s.tutor_message}"`}
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
            style={{ borderColor: "#2a2520", color: "#6a6050" }}
          >
            {loading === "decline" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            Decline
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handle("accept")}
            disabled={!!loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: loading === "accept" ? "#c9a040" : "#1d9e75", color: "#f5f0e8" }}
          >
            {loading === "accept" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Accept & Schedule
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
  const timeStr = fmtTime(s.scheduled_at);
  const courseTitle = s.course?.title || s.course?.skill_name || "Session";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#0a0908", borderColor: isUpcoming ? "rgba(29,158,117,0.28)" : "#2a2520" }}
    >
      {isUpcoming && <div style={{ height: 2, background: "rgba(29,158,117,0.5)" }} />}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={s.student?.name} url={s.student?.avatar_url} size={10} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#f5f0e8" }}>
                  {courseTitle}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                  with {s.student?.name || "Student"}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            {timeStr && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#6a6050" }}>
                <Calendar size={10} /> {timeStr}
              </p>
            )}
            {isCompleted && s.duration_minutes && (
              <span className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: "#6a6050" }}>
                <Clock size={9} /> {s.duration_minutes} min session
              </span>
            )}
          </div>
        </div>

        {/* Live join */}
        {jn && (
          <motion.a
            href={s.meeting_link}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.97 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: "#1d9e75", color: "#f5f0e8" }}
          >
            <Video size={14} /> Start Live Session
          </motion.a>
        )}

        {/* Upcoming actions */}
        {isUpcoming && !jn && (
          <div className="mt-3 flex gap-2">
            <div
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium"
              style={{ background: "rgba(29,158,117,0.06)", borderColor: "rgba(29,158,117,0.18)", color: "#1d9e75" }}
            >
              <Calendar size={12} /> Session scheduled
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium"
              style={{ borderColor: "#2a2520", color: "#6a6050" }}
            >
              <MessageSquare size={12} />
            </motion.button>
          </div>
        )}

        {/* Completed actions */}
        {isCompleted && (
          <>
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
                onClick={() => onRate(s)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold"
                style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.2)" }}
              >
                <Star size={12} /> Rate Student
              </motion.button>
            </div>
            {/* Resources Panel */}
            <NotesPanel session={s} isTutor={s.tutor_id === userId} />
            <p className="mt-1.5 text-center text-[10px]" style={{ color: "#3a3428" }}>
              Student downloads resources as read-only
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
  const router = useRouter();
  const [tab, setTab] = useState("requests");

  const outgoing = sessions.filter((s) => s.student_id === userId);

  // Requests: pending (not yet accepted by tutor)
  const requests = outgoing.filter((s) => s.status === "pending");

  // Confirmed: accepted sessions — split into live (joinable now) and upcoming (not yet)
  const confirmed = outgoing
    .filter((s) => s.status === "accepted")
    .sort((a, b) => new Date(a.scheduled_at || 0) - new Date(b.scheduled_at || 0));
  const live = confirmed.filter((s) => canJoinSession(s));
  const upcoming = confirmed.filter((s) => !canJoinSession(s));

  // Done: completed (and declined)
  const completed = outgoing.filter((s) => s.status === "completed");
  const declined = outgoing.filter((s) => s.status === "rejected");

  const TABS = [
    { id: "requests",  label: "Requests",  count: requests.length,  icon: Inbox },
    { id: "confirmed", label: "Confirmed", count: confirmed.length, icon: Calendar },
    { id: "done",      label: "Done",      count: 0,                icon: CheckCircle2 },
  ];

  const renderContent = () => {
    // ── Requests tab ──────────────────────────────────────────────────────────
    if (tab === "requests") {
      return requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No pending requests"
          subtitle="Sessions you request from Explore appear here until the tutor responds"
          cta="Browse Tutors"
          onCta={() => router.push("/explore")}
        />
      ) : (
        <>
          <SectionLabel>Awaiting tutor response · {requests.length}</SectionLabel>
          {requests.map((s, i) => (
            <StudentSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i} />
          ))}
        </>
      );
    }

    // ── Confirmed tab ─────────────────────────────────────────────────────────
    if (tab === "confirmed") {
      return confirmed.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No confirmed sessions yet"
          subtitle="Tutors will accept your requests and schedule a time — check back soon"
          cta="Browse Tutors"
          onCta={() => router.push("/explore")}
        />
      ) : (
        <>
          {live.length > 0 && (
            <>
              <SectionLabel>Live now · {live.length}</SectionLabel>
              {live.map((s, i) => (
                <StudentSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i} />
              ))}
            </>
          )}
          {upcoming.length > 0 && (
            <>
              <SectionLabel>Upcoming · {upcoming.length}</SectionLabel>
              {upcoming.map((s, i) => (
                <StudentSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i + live.length} />
              ))}
            </>
          )}
        </>
      );
    }

    // ── Done tab ──────────────────────────────────────────────────────────────
    const all = [...completed, ...declined];
    return all.length === 0 ? (
      <EmptyState icon={CheckCircle2} title="No completed sessions yet" subtitle="Finished sessions appear here with notes and resources from your tutor" />
    ) : (
      <>
        {completed.length > 0 && (
          <>
            <SectionLabel>Completed · {completed.length}</SectionLabel>
            {completed.map((s, i) => (
              <StudentSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i} />
            ))}
          </>
        )}
        {declined.length > 0 && (
          <>
            <SectionLabel>Declined · {declined.length}</SectionLabel>
            {declined.map((s, i) => (
              <StudentSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i + completed.length} />
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

// ────────────────────────────────────────────����─────────────────��──────────────
// Tutor Courses List (inside Sessions page)
// ──��──────────────────────────────────────────────────────────────────────────

function TutorCoursesList({ courses, onAddCourse }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid #1a1814" }}
      >
        <div className="flex items-center gap-2">
          <Layers size={13} style={{ color: "#e8b84b" }} />
          <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>My Courses</span>
          <span
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
          >
            {courses.length}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddCourse}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium"
          style={{ background: "rgba(232,184,75,0.08)", borderColor: "rgba(232,184,75,0.2)", color: "#e8b84b" }}
        >
          <Plus size={11} /> Add Course
        </motion.button>
      </div>

      {courses.length === 0 ? (
        <div className="py-10 flex flex-col items-center text-center px-4">
          <BookOpen size={20} style={{ color: "#3a3428" }} className="mb-2" />
          <p className="text-sm font-medium" style={{ color: "#6a6050" }}>No courses yet</p>
          <p className="text-xs mt-1" style={{ color: "#3a3428" }}>
            Add a course to start receiving student requests
          </p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "#1a1814" }}>
          {courses.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.15)" }}
              >
                <BookOpen size={14} style={{ color: "#e8b84b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#f5f0e8" }}>
                  {c.title || c.skill_name}
                </p>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#6a6050" }}>
                  {c.short_description || c.description || `${c.level || "Beginner"} level`}
                </p>
              </div>
              <span
                className="shrink-0 rounded-lg px-2 py-0.5 text-[10px]"
                style={{
                  background: "rgba(232,184,75,0.08)",
                  color: "#e8b84b",
                  border: "1px solid rgba(232,184,75,0.15)",
                }}
              >
                {c.level || "Beginner"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor View
// ─────────────────────────────────────────────────────────────────────────────

function TutorView({ sessions, courses, userId, onAccept, onDecline, onRate, onAddCourse }) {
  const [tab, setTab] = useState("incoming");

  const incoming = sessions.filter((s) => s.tutor_id === userId && s.status === "pending");
  const upcoming = sessions.filter((s) => s.tutor_id === userId && s.status === "accepted");
  const completed = sessions.filter((s) => s.tutor_id === userId && s.status === "completed");
  const declined = sessions.filter((s) => s.tutor_id === userId && s.status === "rejected");

  const TABS = [
    { id: "incoming", label: "Incoming", count: incoming.length, icon: Inbox },
    { id: "upcoming", label: "Confirmed", count: upcoming.length, icon: Calendar },
    { id: "done", label: "Done", count: 0, icon: CheckCircle2 },
  ];

  const renderContent = () => {
    if (tab === "incoming") {
      return incoming.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No incoming requests"
          subtitle="When students request your courses, they'll appear here"
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
        <EmptyState icon={Calendar} title="No upcoming sessions" subtitle="Accept incoming requests to fill your schedule" />
      ) : (
        <>
          <SectionLabel>Confirmed · {upcoming.length}</SectionLabel>
          {upcoming.map((s, i) => (
            <TutorSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i} />
          ))}
        </>
      );
    }

    const all = [...completed, ...declined];
    return all.length === 0 ? (
      <EmptyState icon={CheckCircle2} title="No completed sessions yet" subtitle="Teaching history and resources appear here" />
    ) : (
      <>
        {completed.length > 0 && (
          <>
            <SectionLabel>Completed · {completed.length}</SectionLabel>
            {completed.map((s, i) => (
              <TutorSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i} />
            ))}
          </>
        )}
        {declined.length > 0 && (
          <>
            <SectionLabel>Declined · {declined.length}</SectionLabel>
            {declined.map((s, i) => (
              <TutorSessionCard key={s.id} session={s} userId={userId} onRate={onRate} index={i + completed.length} />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-3">
      {/* Courses list always visible at top for tutors */}
      <TutorCoursesList courses={courses} onAddCourse={onAddCourse} />

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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rateModal, setRateModal] = useState(null);
  const [acceptModal, setAcceptModal] = useState(null);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const fetchSessions = useCallback(async (uid, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const { data } = await supabase
      .from("sessions")
      .select(`*, student:student_id(name,avatar_url), tutor:tutor_id(name,avatar_url), course:course_id(title,skill_name,level)`)
      .or(`student_id.eq.${uid},tutor_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    setSessions(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [supabase]);

  const fetchCourses = useCallback(async (uid) => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("tutor_id", uid)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setCourses(data || []);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }
      setUser(authUser);
      await Promise.all([fetchSessions(authUser.id), fetchCourses(authUser.id)]);

      const channel = supabase
        .channel("sessions-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "sessions", filter: `student_id=eq.${authUser.id}` }, () => fetchSessions(authUser.id, true))
        .on("postgres_changes", { event: "*", schema: "public", table: "sessions", filter: `tutor_id=eq.${authUser.id}` }, () => fetchSessions(authUser.id, true))
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
    init();
  }, [supabase, router, fetchSessions, fetchCourses]);

  // Accept: open propose-time modal
  const handleAcceptRequest = async (session) => {
    setAcceptModal(session);
  };

  const handleAcceptConfirm = async (sessionId, { scheduledTime, meetingLink, message }) => {
    const update = { status: "accepted" };
    if (scheduledTime) update.scheduled_at = new Date(scheduledTime).toISOString();
    if (meetingLink) update.meeting_link = meetingLink;
    if (message) update.tutor_message = message;

    const { error } = await supabase.from("sessions").update(update).eq("id", sessionId);
    if (!error) {
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, ...update } : s));
    }
    setAcceptModal(null);
  };

  const handleDecline = async (sessionId) => {
    const { error } = await supabase.from("sessions").update({ status: "rejected" }).eq("id", sessionId);
    if (!error) {
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status: "rejected" } : s));
    }
  };

  const handleCourseSave = async (course) => {
    if (!user?.id) return { error: new Error("Not authenticated") };
    const { data: inserted, error } = await supabase
      .from("courses")
      .insert({
        tutor_id: user.id,
        title: course.title,
        skill_name: course.skill_name,
        level: course.level || "Beginner",
        short_description: course.short_description || "",
        description: course.description || "",
        duration_text: course.duration_text || "",
        prerequisites: course.prerequisites || "",
        outcomes: course.outcomes || "",
        is_active: true,
        is_published: true,
      })
      .select()
      .single();
    if (!error && inserted) setCourses((prev) => [inserted, ...prev]);
    return { error };
  };

  const uid = user?.id;
  const relevantSessions = sessions.filter((s) =>
    role === "tutor" ? s.tutor_id === uid : s.student_id === uid,
  );
  const totalSessions = relevantSessions.length;
  const completedCount = relevantSessions.filter((s) => s.status === "completed").length;
  const pendingCount = relevantSessions.filter((s) => s.status === "pending").length;
  const acceptedCount = relevantSessions.filter((s) => s.status === "accepted").length;

  const nextSession = sessions
    .filter((s) => s.status === "accepted" && s.scheduled_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0e0c0a" }}>
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
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-12" style={{ background: "#0e0c0a" }}>
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "#f5f0e8" }}>
              {role === "tutor" ? "Teaching" : "Sessions"}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "#6a6050" }}>
              {role === "tutor"
                ? "Manage your courses, requests and sessions"
                : "Your learning sessions and progress"}
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
              <RefreshCw size={13} style={{ color: refreshing ? "#e8b84b" : "#6a6050" }} className={refreshing ? "animate-spin" : ""} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(role === "tutor" ? "/profile" : "/explore")}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{ background: "#0a0908", borderColor: "rgba(232,184,75,0.28)", color: "#e8b84b" }}
            >
              <BookOpen size={11} />
              {role === "tutor" ? "My Profile" : "Find Courses"}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Layers} value={role === "tutor" ? courses.length : totalSessions} label={role === "tutor" ? "Courses" : "Total"} sub={role === "tutor" ? "published" : "all sessions"} color="#e8b84b" index={1} />
          <StatCard icon={Clock} value={pendingCount + acceptedCount} label={role === "tutor" ? "Active" : "Active"} sub={`${pendingCount} pending · ${acceptedCount} confirmed`} color="#60a5fa" index={2} />
          <StatCard icon={CheckCircle2} value={completedCount} label="Done" sub="completed" color="#1d9e75" index={3} />
        </div>

        {/* Next session banner */}
        <AnimatePresence>
          {nextSession && (() => {
            const other = nextSession.student_id === uid ? nextSession.tutor : nextSession.student;
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
                style={{ background: "rgba(29,158,117,0.07)", borderColor: "rgba(29,158,117,0.22)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.25)" }}
                  >
                    <Calendar size={16} style={{ color: "#1d9e75" }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#f5f0e8" }}>
                      {nextSession.course?.title || nextSession.course?.skill_name || "Session"} · {other?.name}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#1d9e75" }}>
                      {fmtTime(nextSession.scheduled_at)}
                    </p>
                  </div>
                </div>

                {jn && nextSession.meeting_link ? (
                  <a href={nextSession.meeting_link} target="_blank" rel="noreferrer">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
                      style={{ background: "#1d9e75", color: "#f5f0e8" }}
                    >
                      <Video size={11} /> Join
                    </motion.button>
                  </a>
                ) : (
                  <span
                    className="rounded-xl px-3 py-1.5 text-xs font-medium"
                    style={{ background: "rgba(29,158,117,0.12)", color: "#1d9e75" }}
                  >
                    Upcoming
                  </span>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Role-aware content */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {role === "student" ? (
                <StudentView sessions={sessions} userId={uid} onRate={setRateModal} />
              ) : (
                <TutorView
                  sessions={sessions}
                  courses={courses}
                  userId={uid}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDecline}
                  onRate={setRateModal}
                  onAddCourse={() => setShowAddCourse(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Rate Modal */}
      <AnimatePresence>
        {rateModal && (
          <RateModal
            session={rateModal}
            raterId={uid}
            onClose={() => setRateModal(null)}
            onDone={() => { setRateModal(null); if (uid) fetchSessions(uid, true); }}
          />
        )}
      </AnimatePresence>

      {/* Accept & Schedule Modal */}
      <AnimatePresence>
        {acceptModal && (
          <AcceptModal
            session={acceptModal}
            onClose={() => setAcceptModal(null)}
            onConfirm={handleAcceptConfirm}
          />
        )}
      </AnimatePresence>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showAddCourse && (
          <AddCourseModal
            onClose={() => setShowAddCourse(false)}
            onSave={handleCourseSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
