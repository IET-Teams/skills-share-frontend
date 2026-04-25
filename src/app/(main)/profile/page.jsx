"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";

const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
import {
  Edit2,
  MapPin,
  BookOpen,
  Calendar,
  Star,
  GraduationCap,
  Share2,
  User,
  CheckCircle2,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Loader2,
  ArrowRight,
  XCircle,
  FileText,
  Loader2 as Spin,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical",
  "Information Technology",
  "Civil",
  "Electrical",
  "MCA",
  "MBA",
  "Other",
];

const SKILL_SUGGESTIONS = [
  "React",
  "Python",
  "Node.js",
  "Figma",
  "Machine Learning",
  "Data Structures",
  "Flutter",
  "SQL",
  "UI/UX Design",
  "Java",
  "Kotlin",
  "Docker",
  "Git",
  "TypeScript",
  "AWS",
  "MongoDB",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "PG 1st Year",
  "PG 2nd Year",
];

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "#e8b84b",
    bg: "rgba(232,184,75,0.1)",
    label: "Pending",
  },
  accepted: {
    icon: Loader2,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    label: "Accepted",
  },
  completed: {
    icon: CheckCircle2,
    color: "#1d9e75",
    bg: "rgba(29,158,117,0.1)",
    label: "Completed",
  },
  rejected: {
    icon: XCircle,
    color: "#b05252",
    bg: "rgba(176,82,82,0.1)",
    label: "Rejected",
  },
};

const inputStyle = {
  background: "#141210",
  border: "1px solid #2a2520",
  color: "#f5f0e8",
};

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeUpSm = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared tiny components
// ─────────────────────────────────────────────────────────────────────────────

function StarRow({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          style={{
            color: i <= score ? "#e8b84b" : "#2a2520",
            fill: i <= score ? "#e8b84b" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function Avatar({ url, name, size = 9, textSize = "xs", radius = "xl" }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cls = `flex h-${size} w-${size} shrink-0 items-center justify-center rounded-${radius} text-${textSize} font-medium`;
  return url ? (
    <img
      src={url}
      alt={name}
      className={`h-${size} w-${size} rounded-${radius} object-cover`}
    />
  ) : (
    <div
      className={cls}
      style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
    >
      {initials}
    </div>
  );
}

function FieldLabel({ icon: Icon, label }) {
  return (
    <label
      className="mb-1.5 flex items-center gap-1.5 text-xs font-medium"
      style={{ color: "#8a8070" }}
    >
      {Icon && <Icon size={11} />}
      {label}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileHero
// ─────────────────────────────────────────────────────────────────────────────

function ProfileHero({
  profile,
  user,
  skillCount,
  sessionCount,
  avgRating,
  onEdit,
}) {
  const name = profile?.name || user?.email?.split("@")[0] || "Student";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = [
    { icon: BookOpen, label: "Skills", value: skillCount || 0 },
    { icon: Calendar, label: "Sessions", value: sessionCount || 0 },
    { icon: Star, label: "Rating", value: avgRating || "—" },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      {/* Header band */}
      <div
        className="absolute inset-x-0 top-0 h-28 opacity-30"
        style={{
          background: "linear-gradient(180deg, #1a1610 0%, #0a0908 100%)",
        }}
      />

      <div className="relative px-6 pb-6 pt-16">
        {/* Actions */}
        <div className="absolute right-5 top-5 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "#2a2520",
            }}
          >
            <Share2 size={13} style={{ color: "#8a8070" }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium"
            style={{
              background: "rgba(232,184,75,0.08)",
              borderColor: "rgba(232,184,75,0.2)",
              color: "#e8b84b",
            }}
          >
            <Edit2 size={11} /> Edit profile
          </motion.button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-end gap-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="h-20 w-20 rounded-2xl object-cover"
                style={{ border: "3px solid #1a1814" }}
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-xl font-medium"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(232,184,75,0.2) 0%,rgba(232,184,75,0.05) 100%)",
                  border: "3px solid #1a1814",
                  color: "#e8b84b",
                }}
              >
                {initials}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2"
              style={{ background: "#1d9e75", borderColor: "#0a0908" }}
            />
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>
              {name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {profile?.department && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#8a8070" }}
                >
                  <GraduationCap size={11} />
                  {profile.department}
                </span>
              )}
              {profile?.location && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#6a6050" }}
                >
                  <MapPin size={11} />
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio ? (
          <p
            className="mt-4 max-w-xl text-sm leading-relaxed"
            style={{ color: "#8a8070" }}
          >
            {profile.bio}
          </p>
        ) : (
          <p
            className="mt-4 cursor-pointer text-sm italic"
            style={{ color: "#3a342c" }}
            onClick={onEdit}
          >
            No bio yet — click Edit profile to add one
          </p>
        )}

        <div className="my-5" style={{ borderTop: "1px solid #1a1814" }} />

        {/* Stats */}
        <div className="flex gap-8">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} style={{ color: "#e8b84b" }} />
              <div>
                <p
                  className="text-base font-medium"
                  style={{ color: "#f5f0e8" }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: "#6a6050" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillsSection
// ─────────────────────────────────────────────────────────────────────────────

function SkillPill({ skill, type, onRemove }) {
  const isTeach = type === "teach";
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
      style={{
        background: isTeach ? "rgba(232,184,75,0.08)" : "rgba(29,158,117,0.08)",
        color: isTeach ? "#e8b84b" : "#1d9e75",
        border: `1px solid ${isTeach ? "rgba(232,184,75,0.15)" : "rgba(29,158,117,0.15)"}`,
      }}
    >
      {skill.skill_name}
      {onRemove && (
        <button
          onClick={() => onRemove(skill.id)}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </motion.div>
  );
}

function SkillsSection({ skills, userId, onSkillsChange }) {
  const supabase = createSupabaseClient();
  const [adding, setAdding] = useState(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const teachSkills = skills.filter((s) => s.type === "teach");
  const learnSkills = skills.filter((s) => s.type === "learn");

  const handleAdd = async (type) => {
    const val = input.trim();
    if (!val) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("skills")
      .insert({ user_id: userId, skill_name: val, type })
      .select()
      .single();
    if (!error && data) onSkillsChange((prev) => [data, ...prev]);
    setInput("");
    setSaving(false);
  };

  const handleRemove = async (id) => {
    await supabase.from("skills").delete().eq("id", id);
    onSkillsChange((prev) => prev.filter((s) => s.id !== id));
  };

  const addFromSuggestion = async (name, type) => {
    if (skills.find((s) => s.skill_name === name && s.type === type)) return;
    const { data, error } = await supabase
      .from("skills")
      .insert({ user_id: userId, skill_name: name, type })
      .select()
      .single();
    if (!error && data) onSkillsChange((prev) => [data, ...prev]);
  };

  const usedNames = skills.map((s) => s.skill_name);
  const suggestions = SKILL_SUGGESTIONS.filter((s) => !usedNames.includes(s));

  const renderSkillBlock = ({ type, list, accentColor, borderColor, emptyMsg }) => {
    const isTeach = type === "teach";
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTeach ? (
              <BookOpen size={14} style={{ color: accentColor }} />
            ) : (
              <Sparkles size={14} style={{ color: accentColor }} />
            )}
            <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
              {isTeach ? "Skills I teach" : "Skills I want to learn"}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: `${accentColor}14`, color: "#8a8070" }}
            >
              {list.length}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAdding(adding === type ? null : type)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium"
            style={{
              background: adding === type ? `${accentColor}18` : "transparent",
              color: accentColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Plus size={11} /> Add skill
          </motion.button>
        </div>

        <AnimatePresence>
          {adding === type && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd(type);
                    if (e.key === "Escape") setAdding(null);
                  }}
                  placeholder="Skill name…"
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "#141210",
                    border: `1px solid ${borderColor}`,
                    color: "#f5f0e8",
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAdd(type)}
                  disabled={saving || !input.trim()}
                  className="rounded-xl px-4 text-sm font-medium"
                  style={
                    isTeach
                      ? { background: "#e8b84b", color: "#0e0c0a" }
                      : {
                          background: "rgba(29,158,117,0.15)",
                          color: "#1d9e75",
                          border: `1px solid ${borderColor}`,
                        }
                  }
                >
                  {saving ? "…" : "Add"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          <AnimatePresence>
            {list.length > 0 ? (
              list.map((s) => (
                <SkillPill
                  key={s.id}
                  skill={s}
                  type={type}
                  onRemove={handleRemove}
                />
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm italic"
                style={{ color: "#3a342c" }}
              >
                {emptyMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderSkillBlock({
        type: "teach",
        list: teachSkills,
        accentColor: "#e8b84b",
        borderColor: "rgba(232,184,75,0.2)",
        emptyMsg: "No teaching skills yet",
      })}
      {renderSkillBlock({
        type: "learn",
        list: learnSkills,
        accentColor: "#1d9e75",
        borderColor: "rgba(29,158,117,0.2)",
        emptyMsg: "No learning goals yet",
      })}

      {suggestions.length > 0 && (
        <div
          className="rounded-2xl border p-4"
          style={{ background: "#0a0908", borderColor: "#2a2520" }}
        >
          <p className="mb-3 text-xs" style={{ color: "#4a4438" }}>
            Quick-add popular skills
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 10).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addFromSuggestion(s, "teach")}
                  className="rounded-lg px-2.5 py-1 text-xs hover:border-[#4a4438] transition-colors"
                  style={{
                    background: "#141210",
                    color: "#6a6050",
                    border: "1px solid #2a2520",
                  }}
                  title="Add as teach"
                >
                  {s} <span style={{ color: "#e8b84b" }}>↑</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addFromSuggestion(s, "learn")}
                  className="rounded-lg px-2 py-1 text-xs hover:border-[#4a4438] transition-colors"
                  style={{
                    background: "#141210",
                    color: "#6a6050",
                    border: "1px solid #2a2520",
                  }}
                  title="Add as learn"
                >
                  <span style={{ color: "#1d9e75" }}>↓</span>
                </motion.button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: "#3a342c" }}>
            ↑ teach · ↓ learn
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SessionHistory
// ─────────────────────────────────────────────────────────────────────────────

function SessionCard({ session, userId, index }) {
  const isRequester = session.requester_id === userId;
  const other = isRequester ? session.provider : session.requester;
  const otherName = other?.name || "Unknown";
  const skillName = session.skill?.skill_name || "Session";
  const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const initials = otherName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const date = new Date(
    session.scheduled_time || session.created_at,
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      variants={fadeUpSm}
      custom={index}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors"
      style={{ border: "1px solid #1e1c18" }}
      whileHover={{
        borderColor: "#2a2520",
        background: "rgba(232,184,75,0.02)",
      }}
    >
      <div className="flex items-center gap-3">
        {other?.avatar_url ? (
          <img
            src={other.avatar_url}
            alt={otherName}
            className="h-9 w-9 rounded-xl object-cover"
          />
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-medium"
            style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b" }}
          >
            {initials}
          </div>
        )}
        <div>
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {skillName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs" style={{ color: "#6a6050" }}>
              {isRequester ? "Learning from" : "Teaching"}
            </span>
            <ArrowRight size={10} style={{ color: "#3a342c" }} />
            <span className="text-xs" style={{ color: "#8a8070" }}>
              {otherName}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs hidden sm:block" style={{ color: "#4a4438" }}>
          {date}
        </span>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <StatusIcon size={10} />
          {cfg.label}
        </div>
      </div>
    </motion.div>
  );
}

function SessionHistory({ sessions, userId }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border py-16 text-center"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
      >
        <Calendar size={28} style={{ color: "#2a2520" }} />
        <p className="mt-3 text-sm font-medium" style={{ color: "#3a342c" }}>
          No sessions yet
        </p>
        <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>
          Explore skills and request your first session
        </p>
        <motion.a
          href="/explore"
          whileTap={{ scale: 0.97 }}
          className="mt-4 rounded-xl px-4 py-2 text-xs font-medium"
          style={{
            background: "rgba(232,184,75,0.08)",
            color: "#e8b84b",
            border: "1px solid rgba(232,184,75,0.15)",
          }}
        >
          Explore skills
        </motion.a>
      </div>
    );
  }

  const completed = sessions.filter((s) => s.status === "completed");
  const active = sessions.filter((s) => s.status !== "completed");

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid #1a1814" }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: "#e8b84b" }} />
          <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            Sessions
          </span>
        </div>
        <div className="flex gap-3">
          <span className="text-xs" style={{ color: "#4a4438" }}>
            {completed.length} completed
          </span>
          <span className="text-xs" style={{ color: "#4a4438" }}>
            {active.length} active
          </span>
        </div>
      </div>
      <div className="space-y-1.5 p-3">
        {sessions.map((s, i) => (
          <SessionCard key={s.id} session={s} userId={userId} index={i} />
        ))}
      </div>
      <div className="px-5 py-3" style={{ borderTop: "1px solid #1a1814" }}>
        <a href="/sessions" className="text-xs" style={{ color: "#6a6050" }}>
          View all sessions →
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RatingsSection
// ─────────────────────────────────────────────────────────────────────────────

function RatingBar({ score, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-right text-xs" style={{ color: "#6a6050" }}>
        {score}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "#1a1814" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.6,
            delay: score * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-full rounded-full"
          style={{ background: "#e8b84b" }}
        />
      </div>
      <span className="w-4 text-xs" style={{ color: "#4a4438" }}>
        {count}
      </span>
    </div>
  );
}

function RatingsSection({ ratings, avgRating }) {
  if (!ratings || ratings.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border py-16 text-center"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
      >
        <Star size={28} style={{ color: "#2a2520" }} />
        <p className="mt-3 text-sm font-medium" style={{ color: "#3a342c" }}>
          No ratings yet
        </p>
        <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>
          Complete sessions to start receiving ratings
        </p>
      </div>
    );
  }

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    if (dist[r.score] !== undefined) dist[r.score]++;
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
      >
        <div className="flex items-start gap-8">
          <div className="text-center">
            <p className="text-4xl font-medium" style={{ color: "#f5f0e8" }}>
              {avgRating}
            </p>
            <div className="mt-1 flex justify-center">
              <StarRow score={Math.round(parseFloat(avgRating))} />
            </div>
            <p className="mt-1 text-xs" style={{ color: "#6a6050" }}>
              {ratings.length} {ratings.length === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((score) => (
              <RatingBar
                key={score}
                score={score}
                count={dist[score]}
                total={ratings.length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid #1a1814" }}
        >
          <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            Reviews
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: "#1a1814" }}>
          {ratings.map((r, i) => {
            const name = r.rater?.name || "Student";
            const initials = name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const date = new Date(r.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <motion.div
                key={r.id}
                variants={fadeUpSm}
                custom={i}
                initial="hidden"
                animate="visible"
                className="px-5 py-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {r.rater?.avatar_url ? (
                      <img
                        src={r.rater.avatar_url}
                        alt={name}
                        className="h-8 w-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-medium"
                        style={{
                          background: "rgba(232,184,75,0.08)",
                          color: "#e8b84b",
                        }}
                      >
                        {initials}
                      </div>
                    )}
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#f5f0e8" }}
                      >
                        {name}
                      </p>
                      <StarRow score={r.score} />
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "#4a4438" }}>
                    {date}
                  </span>
                </div>
                {r.feedback && (
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: "#8a8070" }}
                  >
                    "{r.feedback}"
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileEditModal
// ─────────────────────────────────────────────────────────────────────────────

function ProfileEditModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    department: profile?.department || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    location: profile?.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await onSave(form);
    if (err) setError("Failed to save. Please try again.");
    setSaving(false);
  };

  const focusGold = (e) => (e.target.style.borderColor = "#e8b84b");
  const blurReset = (e) => (e.target.style.borderColor = "#2a2520");

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl"
        style={{
          background: "#0a0908",
          border: "1px solid #2a2520",
          borderBottom: "none",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: "#2a2520" }}
          />
        </div>

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #1a1814" }}
        >
          <h2 className="text-base font-medium" style={{ color: "#f5f0e8" }}>
            Edit profile
          </h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "#141210" }}
          >
            <X size={14} style={{ color: "#8a8070" }} />
          </motion.button>
        </div>

        <div
          className="space-y-4 overflow-y-auto px-6 py-5"
          style={{ maxHeight: "60vh" }}
        >
          {[
            {
              key: "name",
              icon: User,
              label: "Full name",
              placeholder: "Your full name",
              type: "input",
            },
            {
              key: "location",
              icon: MapPin,
              label: "Location",
              placeholder: "e.g. Kozhikode, Kerala",
              type: "input",
            },
          ].map(({ key, icon, label, placeholder }) => (
            <div key={key}>
              <FieldLabel icon={icon} label={label} />
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={focusGold}
                onBlur={blurReset}
              />
            </div>
          ))}

          <div>
            <FieldLabel icon={GraduationCap} label="Department" />
            <select
              value={form.department}
              onChange={set("department")}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none"
              style={inputStyle}
              onFocus={focusGold}
              onBlur={blurReset}
            >
              <option value="" style={{ background: "#0a0908" }}>
                Select department
              </option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} style={{ background: "#0a0908" }}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel icon={FileText} label="Bio" />
            <textarea
              value={form.bio}
              onChange={set("bio")}
              placeholder="Tell others about yourself…"
              rows={4}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={focusGold}
              onBlur={blurReset}
            />
            <p className="mt-1 text-right text-xs" style={{ color: "#3a342c" }}>
              {form.bio.length}/200
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
              style={{ color: "#b05252" }}
            >
              {error}
            </motion.p>
          )}
        </div>

        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderTop: "1px solid #1a1814" }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 rounded-xl py-3 text-sm"
            style={{ border: "1px solid #2a2520", color: "#6a6050" }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
            style={{
              background: saving ? "#1a1814" : "#e8b84b",
              color: saving ? "#3a342c" : "#0e0c0a",
            }}
          >
            {saving && <Spin size={13} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileSetupWizard
// ─────────────────────────────────────────────────────────────────────────────

function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            background: i <= current ? "#e8b84b" : "#2a2520",
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

function WizardSkillTag({ skill, type, onRemove }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium"
      style={{
        background:
          type === "teach" ? "rgba(232,184,75,0.12)" : "rgba(29,158,117,0.1)",
        color: type === "teach" ? "#e8b84b" : "#1d9e75",
        border: `1px solid ${type === "teach" ? "rgba(232,184,75,0.2)" : "rgba(29,158,117,0.2)"}`,
      }}
    >
      {skill}
      <button
        onClick={() => onRemove(skill)}
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={10} />
      </button>
    </motion.span>
  );
}

function ProfileSetupWizard({ user, onComplete }) {
  const supabase = createSupabaseClient();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    department: "",
    year: "",
    bio: "",
    teachSkills: [],
    learnSkills: [],
    skillInput: "",
    learnInput: "",
  });

  const STEPS = [
    { icon: User, title: "About you", subtitle: "Let's set up your profile" },
    {
      icon: GraduationCap,
      title: "Your department",
      subtitle: "Tell us where you study",
    },
    {
      icon: BookOpen,
      title: "Skills you teach",
      subtitle: "What can you share?",
    },
    {
      icon: Sparkles,
      title: "Skills to learn",
      subtitle: "What do you want to pick up?",
    },
    {
      icon: CheckCircle2,
      title: "All done!",
      subtitle: "Your profile is ready",
    },
  ];

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const addSkill = (type) => {
    const key = type === "teach" ? "skillInput" : "learnInput";
    const listKey = type === "teach" ? "teachSkills" : "learnSkills";
    const val = form[key].trim();
    if (val && !form[listKey].includes(val))
      setForm((f) => ({ ...f, [listKey]: [...f[listKey], val], [key]: "" }));
  };

  const removeSkill = (type, skill) => {
    const key = type === "teach" ? "teachSkills" : "learnSkills";
    setForm((f) => ({ ...f, [key]: f[key].filter((s) => s !== skill) }));
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");
    const profileData = {
      name: form.name,
      department: `${form.department}${form.year ? " · " + form.year : ""}`,
      bio: form.bio,
    };
    const { error: profileErr } = await onComplete(profileData);
    if (profileErr) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    const skillRows = [
      ...form.teachSkills.map((s) => ({
        user_id: user.id,
        skill_name: s,
        type: "teach",
      })),
      ...form.learnSkills.map((s) => ({
        user_id: user.id,
        skill_name: s,
        type: "learn",
      })),
    ];
    if (skillRows.length > 0) await supabase.from("skills").insert(skillRows);
    setLoading(false);
  };

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 1;
    if (step === 1) return form.department.length > 0;
    return true;
  };
  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(232,184,75,0.1)",
              border: "1px solid rgba(232,184,75,0.2)",
            }}
          >
            <CurrentIcon size={20} style={{ color: "#e8b84b" }} />
          </div>
          <h2 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>
            {STEPS[step].title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>
            {STEPS[step].subtitle}
          </p>
        </motion.div>

        <div
          className="relative overflow-hidden rounded-2xl border px-6 py-8"
          style={{ background: "#0a0908", borderColor: "#2a2520" }}
        >
          <div className="mb-6 flex justify-center">
            <StepDots total={STEPS.length} current={step} />
          </div>

          <div style={{ minHeight: 240 }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Step 0 — name + bio */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel icon={User} label="Full name" />
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="Your name"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#e8b84b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium"
                        style={{ color: "#8a8070" }}
                      >
                        Bio <span style={{ color: "#3a342c" }}>(optional)</span>
                      </label>
                      <textarea
                        value={form.bio}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, bio: e.target.value }))
                        }
                        placeholder="Tell others about yourself…"
                        rows={3}
                        className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#e8b84b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                      />
                    </div>
                  </div>
                )}

                {/* Step 1 — department + year */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="mb-2 block text-xs font-medium"
                        style={{ color: "#8a8070" }}
                      >
                        Department
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DEPARTMENTS.map((dept) => (
                          <button
                            key={dept}
                            onClick={() =>
                              setForm((f) => ({ ...f, department: dept }))
                            }
                            className="rounded-xl px-3 py-2 text-xs font-medium transition-all"
                            style={{
                              background:
                                form.department === dept
                                  ? "#e8b84b"
                                  : "rgba(42,37,32,0.5)",
                              color:
                                form.department === dept
                                  ? "#0e0c0a"
                                  : "#8a8070",
                              border: `1px solid ${form.department === dept ? "#e8b84b" : "#2a2520"}`,
                            }}
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-xs font-medium"
                        style={{ color: "#8a8070" }}
                      >
                        Year of study
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {YEARS.map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setForm((f) => ({ ...f, year: yr }))}
                            className="rounded-xl px-3 py-2 text-xs font-medium transition-all"
                            style={{
                              background:
                                form.year === yr
                                  ? "rgba(232,184,75,0.12)"
                                  : "rgba(42,37,32,0.5)",
                              color: form.year === yr ? "#e8b84b" : "#6a6050",
                              border: `1px solid ${form.year === yr ? "rgba(232,184,75,0.3)" : "#2a2520"}`,
                            }}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 — teach skills */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        value={form.skillInput}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, skillInput: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && addSkill("teach")
                        }
                        placeholder="e.g. React, Python, Figma…"
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#e8b84b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => addSkill("teach")}
                        className="rounded-xl px-4 text-sm font-medium"
                        style={{ background: "#e8b84b", color: "#0e0c0a" }}
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {form.teachSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.teachSkills.map((s) => (
                            <WizardSkillTag
                              key={s}
                              skill={s}
                              type="teach"
                              onRemove={(sk) => removeSkill("teach", sk)}
                            />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                    <div>
                      <p className="mb-2 text-xs" style={{ color: "#4a4438" }}>
                        Popular skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SKILL_SUGGESTIONS.filter(
                          (s) => !form.teachSkills.includes(s),
                        )
                          .slice(0, 8)
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  teachSkills: [...f.teachSkills, s],
                                }))
                              }
                              className="rounded-lg px-2.5 py-1 text-xs"
                              style={{
                                background: "#141210",
                                color: "#6a6050",
                                border: "1px solid #2a2520",
                              }}
                            >
                              + {s}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 — learn skills */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        value={form.learnInput}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, learnInput: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && addSkill("learn")
                        }
                        placeholder="e.g. Machine Learning, Figma…"
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#1d9e75")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => addSkill("learn")}
                        className="rounded-xl px-4 text-sm"
                        style={{
                          background: "rgba(29,158,117,0.15)",
                          color: "#1d9e75",
                          border: "1px solid rgba(29,158,117,0.2)",
                        }}
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {form.learnSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.learnSkills.map((s) => (
                            <WizardSkillTag
                              key={s}
                              skill={s}
                              type="learn"
                              onRemove={(sk) => removeSkill("learn", sk)}
                            />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                    <div>
                      <p className="mb-2 text-xs" style={{ color: "#4a4438" }}>
                        Suggested
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SKILL_SUGGESTIONS.filter(
                          (s) =>
                            !form.learnSkills.includes(s) &&
                            !form.teachSkills.includes(s),
                        )
                          .slice(0, 8)
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  learnSkills: [...f.learnSkills, s],
                                }))
                              }
                              className="rounded-lg px-2.5 py-1 text-xs"
                              style={{
                                background: "#141210",
                                color: "#6a6050",
                                border: "1px solid #2a2520",
                              }}
                            >
                              + {s}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4 — done */}
                {step === 4 && (
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: "rgba(29,158,117,0.12)",
                        border: "1px solid rgba(29,158,117,0.2)",
                      }}
                    >
                      <CheckCircle2 size={28} style={{ color: "#1d9e75" }} />
                    </motion.div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#f5f0e8" }}
                      >
                        Welcome to SkillBridge, {form.name.split(" ")[0]}!
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "#6a6050" }}>
                        You've added {form.teachSkills.length} skills to teach
                        and {form.learnSkills.length} to learn.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 flex-wrap">
                      {form.teachSkills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-xl px-3 py-1.5 text-xs"
                          style={{
                            background: "rgba(232,184,75,0.1)",
                            color: "#e8b84b",
                            border: "1px solid rgba(232,184,75,0.15)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {form.learnSkills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-xl px-3 py-1.5 text-xs"
                          style={{
                            background: "rgba(29,158,117,0.08)",
                            color: "#1d9e75",
                            border: "1px solid rgba(29,158,117,0.15)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {error && (
                      <p className="text-xs" style={{ color: "#b05252" }}>
                        {error}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Wizard navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 && step < 4 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => go(step - 1)}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm"
                style={{ color: "#6a6050", border: "1px solid #2a2520" }}
              >
                <ChevronLeft size={14} />
                Back
              </motion.button>
            ) : (
              <div />
            )}
            {step < 3 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => go(step + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium"
                style={{
                  background: canNext() ? "#e8b84b" : "#1a1814",
                  color: canNext() ? "#0e0c0a" : "#3a342c",
                }}
              >
                Continue <ChevronRight size={14} />
              </motion.button>
            )}
            {step === 3 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => go(4)}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium"
                style={{ background: "#e8b84b", color: "#0e0c0a" }}
              >
                Finish setup <ChevronRight size={14} />
              </motion.button>
            )}
            {step === 4 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                disabled={loading}
                className="mx-auto flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium"
                style={{
                  background: loading ? "#1a1814" : "#e8b84b",
                  color: loading ? "#3a342c" : "#0e0c0a",
                }}
              >
                {loading ? "Saving…" : "Go to Dashboard"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage — default export
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const supabase = createSupabaseClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSetup = searchParams.get("setup") === "true";

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("skills");

  useEffect(() => {
    async function fetchAll() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      const [
        { data: profileData },
        { data: skillsData },
        { data: sessionsData },
        { data: ratingsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUser.id).single(),
        supabase
          .from("skills")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("sessions")
          .select(
            "*, requester:requester_id(name,avatar_url), provider:provider_id(name,avatar_url), skill:skill_id(skill_name)",
          )
          .or(`requester_id.eq.${authUser.id},provider_id.eq.${authUser.id}`)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("ratings")
          .select("*, rater:rater_id(name,avatar_url)")
          .eq("rated_id", authUser.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profileData);
      setSkills(skillsData || []);
      setSessions(sessionsData || []);
      setRatings(ratingsData || []);
      setLoading(false);
    }
    fetchAll();
  }, [supabase, router]);

  const handleProfileUpdate = async (updatedData) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updatedData)
      .eq("id", user.id)
      .select()
      .single();
    if (!error) {
      setProfile(data);
      setEditOpen(false);
    }
    return { error };
  };

  const handleSetupComplete = async (setupData) => {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...setupData });
    if (!error) {
      setProfile((prev) => ({ ...prev, ...setupData }));
      router.push("/dashboard");
    }
    return { error };
  };

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1)
      : null;

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
          className="text-sm"
          style={{ color: "#4a4438" }}
        >
          Loading profile…
        </motion.div>
      </div>
    );
  }

  // ── First-time setup ──
  if (isSetup) {
    return (
      <div className="min-h-screen" style={{ background: "#0e0c0a" }}>
        <ProfileSetupWizard user={user} onComplete={handleSetupComplete} />
      </div>
    );
  }

  // ── Main profile view ──
  const TABS = ["skills", "sessions", "ratings"];

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8 lg:px-12"
      style={{ background: "#0e0c0a" }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <ProfileHero
            profile={profile}
            user={user}
            skillCount={skills.length}
            sessionCount={sessions.length}
            avgRating={avgRating}
            onEdit={() => setEditOpen(true)}
          />
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="flex gap-1 rounded-xl p-1"
          style={{ background: "#0a0908", border: "1px solid #2a2520" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                color: activeTab === tab ? "#0e0c0a" : "#6a6050",
                background: activeTab === tab ? "#e8b84b" : "transparent",
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "#e8b84b", zIndex: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === "skills" && (
              <SkillsSection
                skills={skills}
                userId={user?.id}
                onSkillsChange={setSkills}
              />
            )}
            {activeTab === "sessions" && (
              <SessionHistory sessions={sessions} userId={user?.id} />
            )}
            {activeTab === "ratings" && (
              <RatingsSection ratings={ratings} avgRating={avgRating} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editOpen && (
          <ProfileEditModal
            profile={profile}
            onSave={handleProfileUpdate}
            onClose={() => setEditOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
