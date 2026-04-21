"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  Search,
  Users,
  BookOpen,
  X,
  SlidersHorizontal,
  ChevronDown,
  SearchX,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  Calendar,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────
const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const CARD_ANIM = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  "All", "Development", "Design", "Data Science", "Mobile", "DevOps", "Languages", "Soft Skills",
];

const CATEGORY_MAP = {
  Development: ["React", "Node.js", "Python", "Java", "TypeScript", "Next.js", "Express", "Django", "Spring Boot", "C++", "PHP"],
  Design: ["Figma", "UI/UX Design", "Illustrator", "Photoshop", "Canva", "Motion Design", "3D Modeling"],
  "Data Science": ["Machine Learning", "Data Analysis", "TensorFlow", "PyTorch", "Pandas", "SQL", "Power BI", "Tableau"],
  Mobile: ["Flutter", "React Native", "Kotlin", "Swift", "Android", "iOS"],
  DevOps: ["Docker", "AWS", "Linux", "CI/CD", "Kubernetes", "Git"],
  Languages: ["English", "German", "Japanese", "French", "Spanish"],
  "Soft Skills": ["Public Speaking", "Leadership", "Communication", "Project Management"],
};

const SORT_OPTIONS = [
  { id: "recent", label: "Most recent" },
  { id: "rating", label: "Top rated" },
  { id: "sessions", label: "Most sessions" },
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, rgba(232,184,75,0.25) 0%, rgba(232,184,75,0.05) 100%)",
  "linear-gradient(135deg, rgba(96,165,250,0.2) 0%, rgba(96,165,250,0.04) 100%)",
  "linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0.04) 100%)",
  "linear-gradient(135deg, rgba(29,158,117,0.2) 0%, rgba(29,158,117,0.04) 100%)",
  "linear-gradient(135deg, rgba(251,146,60,0.2) 0%, rgba(251,146,60,0.04) 100%)",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getGradient(id = "") {
  const idx = id.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

// ─── ExploreHeader ────────────────────────────────────────────────────────────
function ExploreHeader({ view, onViewChange, searchQuery, onSearchChange }) {
  const inputRef = useRef(null);

  return (
    <div
      className="sticky top-0 z-30 px-4 py-5 md:px-8"
      style={{
        background: "rgba(14,12,10,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1a1814",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>
              Explore
            </h1>
            <p className="text-xs" style={{ color: "#6a6050" }}>
              Discover skills & connect with learners
            </p>
          </div>

          {/* View toggle */}
          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: "#141210", border: "1px solid #2a2520" }}
          >
            {[
              { id: "skills", icon: BookOpen, label: "Skills" },
              { id: "people", icon: Users, label: "People" },
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onViewChange(id)}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                style={{ color: view === id ? "#0e0c0a" : "#6a6050" }}
              >
                {view === id && (
                  <motion.div
                    layoutId="explore-view-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "#e8b84b" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon size={12} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative"
        >
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#4a4438" }}
          />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              view === "skills"
                ? "Search skills — React, Python, Figma…"
                : "Search students by name…"
            }
            className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all"
            style={{
              background: "#141210",
              border: "1px solid #2a2520",
              color: "#f5f0e8",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
            onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: "#2a2520" }}
            >
              <X size={10} style={{ color: "#8a8070" }} />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({
  view,
  category,
  onCategoryChange,
  skillType,
  onSkillTypeChange,
  department,
  onDepartmentChange,
  departments,
  sortBy,
  onSortChange,
  categories,
  resultCount,
}) {
  const scrollRef = useRef(null);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="mt-4 space-y-3">
      {/* Row 1: category chips (skills view) or dept chips (people view) */}
      <div className="flex items-center gap-3">
        <div
          ref={scrollRef}
          className="flex flex-1 gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {view === "skills"
            ? categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onCategoryChange(cat)}
                  className="shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all"
                  style={
                    category === cat
                      ? {
                          background: "#e8b84b",
                          color: "#0e0c0a",
                        }
                      : {
                          background: "#141210",
                          color: "#6a6050",
                          border: "1px solid #2a2520",
                        }
                  }
                >
                  {cat}
                </motion.button>
              ))
            : departments.map((dept) => (
                <motion.button
                  key={dept}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onDepartmentChange(dept)}
                  className="shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all"
                  style={
                    department === dept
                      ? { background: "#e8b84b", color: "#0e0c0a" }
                      : { background: "#141210", color: "#6a6050", border: "1px solid #2a2520" }
                  }
                >
                  {dept}
                </motion.button>
              ))}
        </div>
      </div>

      {/* Row 2: teach/learn toggle + sort + result count */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Teach / Learn toggle (skills view only) */}
          {view === "skills" && (
            <div
              className="flex items-center gap-0.5 rounded-xl p-0.5"
              style={{ background: "#141210", border: "1px solid #2a2520" }}
            >
              {[
                { id: "teach", label: "Teaching", activeColor: "#e8b84b", activeBg: "rgba(232,184,75,0.1)" },
                { id: "learn", label: "Learning", activeColor: "#1d9e75", activeBg: "rgba(29,158,117,0.1)" },
              ].map(({ id, label, activeColor, activeBg }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSkillTypeChange(id)}
                  className="relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: skillType === id ? activeBg : "transparent",
                    color: skillType === id ? activeColor : "#4a4438",
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Result count */}
          <span className="text-xs" style={{ color: "#4a4438" }}>
            {resultCount} {view === "skills" ? "skills" : "people"} found
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all"
            style={{ background: "#141210", border: "1px solid #2a2520", color: "#8a8070" }}
          >
            <SlidersHorizontal size={11} />
            {SORT_OPTIONS.find((o) => o.id === sortBy)?.label}
            <ChevronDown size={10} style={{ transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </motion.button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border py-1 shadow-xl"
                style={{ background: "#141210", borderColor: "#2a2520" }}
                onMouseLeave={() => setSortOpen(false)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { onSortChange(opt.id); setSortOpen(false); }}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-xs transition-colors"
                    style={{
                      color: sortBy === opt.id ? "#e8b84b" : "#8a8070",
                      background: sortBy === opt.id ? "rgba(232,184,75,0.05)" : "transparent",
                    }}
                  >
                    {opt.label}
                    {sortBy === opt.id && (
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#e8b84b" }} />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── SkillCard ────────────────────────────────────────────────────────────────
function SkillCard({ skill, isRequested, onRequest }) {
  const provider = skill?.user;
  const initials = getInitials(provider?.name);
  const gradient = getGradient(provider?.id || "");

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-colors"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      <div className="flex flex-1 flex-col p-4">
        {/* Skill name */}
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(232,184,75,0.08)" }}
          >
            <BookOpen size={14} style={{ color: "#e8b84b" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {skill?.name}
          </p>
        </div>

        {/* Provider info */}
        {provider && (
          <div className="mb-3 flex items-center gap-2">
            {provider.avatar_url ? (
              <img src={provider.avatar_url} alt={provider.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium"
                style={{ background: gradient, color: "#e8b84b", border: "1px solid rgba(232,184,75,0.12)" }}
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium" style={{ color: "#c8bfb0" }}>
                {provider.name}
              </p>
              {provider.department && (
                <p className="flex items-center gap-0.5 truncate text-xs" style={{ color: "#4a4438" }}>
                  <GraduationCap size={9} />
                  {provider.department}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Request button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRequest}
          disabled={isRequested}
          className="mt-2 w-full rounded-xl py-2.5 text-xs font-medium transition-all"
          style={
            isRequested
              ? { background: "rgba(29,158,117,0.1)", color: "#1d9e75" }
              : {
                  background: "rgba(232,184,75,0.08)",
                  color: "#e8b84b",
                  border: "1px solid rgba(232,184,75,0.15)",
                }
          }
        >
          {isRequested ? "✓ Requested" : "Request Session"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── UserCard ─────────────────────────────────────────────────────────────────
function UserCard({ user, currentUserId, onRequest }) {
  const [expanded, setExpanded] = useState(false);
  const initials = getInitials(user.name);
  const teachSkills = (user.user_skills || [])
    .map((us) => us.skill)
    .filter((s) => s && s.category === "Teaching");
  const learnSkills = (user.user_skills || [])
    .map((us) => us.skill)
    .filter((s) => s && s.category === "Learning");
  const gradient = getGradient(user.id);

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-colors"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      {/* Header band */}
      <div
        className="relative overflow-hidden px-4 pb-3 pt-4"
        style={{ borderBottom: "1px solid #1e1c18" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: gradient }}
        />
        <div className="relative flex items-start gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-medium"
              style={{ background: gradient, color: "#e8b84b", border: "1px solid rgba(232,184,75,0.12)" }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" style={{ color: "#f5f0e8" }}>
              {user.name}
            </p>
            {user.department && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs" style={{ color: "#6a6050" }}>
                <GraduationCap size={10} />
                {user.department}
              </p>
            )}
          </div>
        </div>
        {user.bio && (
          <p
            className="relative mt-2 line-clamp-2 text-xs leading-relaxed"
            style={{ color: "#6a6050" }}
          >
            {user.bio}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Teach skills */}
        {teachSkills.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1">
              <BookOpen size={10} style={{ color: "#e8b84b" }} />
              <span className="text-xs" style={{ color: "#4a4438" }}>Teaches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teachSkills.slice(0, expanded ? undefined : 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() => onRequest(s)}
                  className="rounded-lg px-2 py-1 text-xs transition-all hover:border-amber-500/30"
                  style={{
                    background: "rgba(232,184,75,0.06)",
                    color: "#8a8070",
                    border: "1px solid rgba(232,184,75,0.1)",
                  }}
                >
                  {s.name}
                </button>
              ))}
              {!expanded && teachSkills.length > 3 && (
                <button
                  onClick={() => setExpanded(true)}
                  className="rounded-lg px-2 py-1 text-xs"
                  style={{ color: "#4a4438" }}
                >
                  +{teachSkills.length - 3}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Learn skills */}
        {learnSkills.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1">
              <Sparkles size={10} style={{ color: "#1d9e75" }} />
              <span className="text-xs" style={{ color: "#4a4438" }}>Wants to learn</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {learnSkills.slice(0, expanded ? undefined : 3).map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg px-2 py-1 text-xs"
                  style={{
                    background: "rgba(29,158,117,0.06)",
                    color: "#6a6050",
                    border: "1px solid rgba(29,158,117,0.1)",
                  }}
                >
                  {s.name}
                </span>
              ))}
              {!expanded && learnSkills.length > 3 && (
                <button
                  onClick={() => setExpanded(true)}
                  className="rounded-lg px-2 py-1 text-xs"
                  style={{ color: "#4a4438" }}
                >
                  +{learnSkills.length - 3}
                </button>
              )}
            </div>
          </div>
        )}

        {teachSkills.length === 0 && learnSkills.length === 0 && (
          <p className="text-xs italic" style={{ color: "#2a2520" }}>
            No skills listed yet
          </p>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <motion.a
            href={`/chat?user=${user.id}`}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all"
            style={{
              border: "1px solid #2a2520",
              color: "#6a6050",
            }}
          >
            <MessageCircle size={11} />
            Message
          </motion.a>
          <motion.a
            href={`/profile?id=${user.id}`}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all"
            style={{
              background: "rgba(232,184,75,0.08)",
              color: "#e8b84b",
              border: "1px solid rgba(232,184,75,0.15)",
            }}
          >
            View profile
            <ArrowUpRight size={10} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── EmptyExplore ─────────────────────────────────────────────────────────────
function EmptyExplore({ type, query, onClear }) {
  const isSkills = type === "skills";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "#141210", border: "1px solid #2a2520" }}
      >
        {query ? (
          <SearchX size={22} style={{ color: "#3a342c" }} />
        ) : isSkills ? (
          <BookOpen size={22} style={{ color: "#3a342c" }} />
        ) : (
          <Users size={22} style={{ color: "#3a342c" }} />
        )}
      </div>

      <p className="mt-4 text-sm font-medium" style={{ color: "#4a4438" }}>
        {query
          ? `No results for "${query}"`
          : isSkills
            ? "No skills found"
            : "No students found"}
      </p>
      <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>
        {query
          ? "Try a different search or clear the filters"
          : isSkills
            ? "Be the first to add this skill"
            : "Try a different department filter"}
      </p>

      <div className="mt-5 flex gap-2">
        {query && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClear}
            className="rounded-xl px-4 py-2 text-xs font-medium"
            style={{
              background: "rgba(232,184,75,0.08)",
              color: "#e8b84b",
              border: "1px solid rgba(232,184,75,0.15)",
            }}
          >
            Clear search
          </motion.button>
        )}
        {isSkills && (
          <motion.a
            href="/profile?tab=skills"
            whileTap={{ scale: 0.97 }}
            className="rounded-xl px-4 py-2 text-xs font-medium"
            style={{ border: "1px solid #2a2520", color: "#6a6050" }}
          >
            Add your skills
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// ─── RequestModal ─────────────────────────────────────────────────────────────
function RequestModal({ skill, provider, onConfirm, onClose }) {
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const initials = getInitials(provider?.name);
  const skillName = skill?.skill_name || "Session";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await onConfirm({
      skillId: skill?.id,
      providerId: provider?.id,
      scheduledTime: scheduledTime || null,
      message,
    });
    if (err) {
      setError("Failed to send request. Please try again.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(onClose, 1800);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 250 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl"
        style={{ background: "#0a0908", border: "1px solid #2a2520", borderBottom: "none" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "#2a2520" }} />
        </div>

        {/* Success state */}
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
            <p className="mt-4 text-base font-medium" style={{ color: "#f5f0e8" }}>
              Request sent!
            </p>
            <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>
              {provider?.name} will be notified
            </p>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #1a1814" }}
            >
              <h2 className="text-base font-medium" style={{ color: "#f5f0e8" }}>
                Request session
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

            {/* Provider + skill summary */}
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
              <div className="flex items-center gap-3">
                {provider?.avatar_url ? (
                  <img src={provider.avatar_url} alt={provider.name} className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium"
                    style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
                  >
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                    {provider?.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {provider?.department && (
                      <span className="flex items-center gap-0.5 text-xs" style={{ color: "#6a6050" }}>
                        <GraduationCap size={9} />
                        {provider.department}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-auto">
                  <span
                    className="rounded-xl px-2.5 py-1 text-xs font-medium"
                    style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
                  >
                    {skillName}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 px-6 py-5">
              {/* Date picker */}
              <div>
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#8a8070" }}
                >
                  <Calendar size={11} />
                  Preferred time <span style={{ color: "#3a342c" }}>(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  min={minDate}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "#141210",
                    border: "1px solid #2a2520",
                    color: scheduledTime ? "#f5f0e8" : "#4a4438",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                />
              </div>

              {/* Message */}
              <div>
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#8a8070" }}
                >
                  <MessageSquare size={11} />
                  Message <span style={{ color: "#3a342c" }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hey! I'd love to learn ${skillName} from you…`}
                  rows={3}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "#141210",
                    border: "1px solid #2a2520",
                    color: "#f5f0e8",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#b05252" }}>
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex gap-3 px-6 py-4"
              style={{ borderTop: "1px solid #1a1814" }}
            >
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
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
                style={{
                  background: loading ? "#1a1814" : "#e8b84b",
                  color: loading ? "#3a342c" : "#0e0c0a",
                }}
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                {loading ? "Sending…" : "Send request"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton({ view }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
          className="rounded-2xl border p-5"
          style={{ background: "#141210", borderColor: "#1e1c18", height: view === "skills" ? 160 : 200 }}
        />
      ))}
    </div>
  );
}

// ─── Main Explore Page ────────────────────────────────────────────────────────
export default function ExplorePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("skills"); // "skills" | "people"
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillType, setSkillType] = useState("teach"); // "teach" | "learn"
  const [department, setDepartment] = useState("All");
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "rating" | "sessions"

  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState(["All"]);

  const [requestTarget, setRequestTarget] = useState(null); // { skill, provider }
  const [requested, setRequested] = useState(new Set()); // skill ids already requested

  // ── Fetch current user ───────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    init();
  }, [supabase]);

  // ── Fetch skills + users ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);

    if (view === "skills") {
      let query = supabase
        .from("skills")
        .select(`
          id, name, category, created_at
        `)
        .eq("category", skillType === "teach" ? "Teaching" : "Learning");

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (category !== "All" && CATEGORY_MAP[category]) {
        query = query.in("name", CATEGORY_MAP[category]);
      }

      query = query.order("created_at", { ascending: false }).limit(40);

      const { data, error } = await query;
      if (!error) setSkills(data || []);
    } else {
      let query = supabase
        .from("profiles")
        .select(`
          id, name, department, bio, avatar_url, created_at,
          user_skills (skill:skill_id (id, name, category))
        `)
        .neq("id", currentUser?.id ?? "00000000-0000-0000-0000-000000000000");

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }
      if (department !== "All") {
        query = query.ilike("department", `%${department}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(40);
      if (!error) {
        setUsers(data || []);
        const depts = [...new Set((data || []).map((u) => u.department).filter(Boolean))];
        setDepartments(["All", ...depts.slice(0, 8)]);
      }
    }

    setLoading(false);
  }, [supabase, view, skillType, category, searchQuery, department, sortBy, currentUser]);

  useEffect(() => {
    const t = setTimeout(fetchData, searchQuery ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchData, searchQuery]);

  // ── Send session request ─────────────────────────────────────────────────
  const handleRequest = async ({ skillId, providerId, scheduledTime, message }) => {
    const { error } = await supabase.from("sessions").insert({
      requester_id: currentUser.id,
      provider_id: providerId,
      skill_id: skillId,
      status: "pending",
      scheduled_time: scheduledTime || null,
      message,
    });
    if (!error) {
      setRequested((prev) => new Set([...prev, skillId]));
      setRequestTarget(null);
    }
    return { error };
  };

  // ── Filter data for display ──────────────────────────────────────────────
  const displaySkills = skills;
  const displayUsers = users;

  return (
    <div className="min-h-screen" style={{ background: "#0e0c0a" }}>
      {/* Page header with search */}
      <ExploreHeader
        view={view}
        onViewChange={setView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
        {/* Filter bar */}
        <FilterBar
          view={view}
          category={category}
          onCategoryChange={setCategory}
          skillType={skillType}
          onSkillTypeChange={setSkillType}
          department={department}
          onDepartmentChange={setDepartment}
          departments={departments}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={SKILL_CATEGORIES}
          resultCount={view === "skills" ? displaySkills.length : displayUsers.length}
        />

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <LoadingSkeleton view={view} />
          ) : (
            <AnimatePresence mode="wait">
              {view === "skills" ? (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {displaySkills.length === 0 ? (
                    <EmptyExplore type="skills" query={searchQuery} onClear={() => { setSearchQuery(""); setCategory("All"); }} />
                  ) : (
                    <motion.div
                      variants={STAGGER}
                      initial="hidden"
                      animate="visible"
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {displaySkills.map((skill) => (
                        <motion.div key={skill.id} variants={CARD_ANIM}>
                          <SkillCard
                            skill={skill}
                            isRequested={requested.has(skill.id)}
                            onRequest={() =>
                              setRequestTarget({
                                skill,
                                provider: skill.user,
                              })
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="people"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {displayUsers.length === 0 ? (
                    <EmptyExplore type="people" query={searchQuery} onClear={() => { setSearchQuery(""); setDepartment("All"); }} />
                  ) : (
                    <motion.div
                      variants={STAGGER}
                      initial="hidden"
                      animate="visible"
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {displayUsers.map((user) => (
                        <motion.div key={user.id} variants={CARD_ANIM}>
                          <UserCard
                            user={user}
                            currentUserId={currentUser?.id}
                            onRequest={(skill) =>
                              setRequestTarget({ skill, provider: user })
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Request session modal */}
      <AnimatePresence>
        {requestTarget && (
          <RequestModal
            skill={requestTarget.skill}
            provider={requestTarget.provider}
            onConfirm={handleRequest}
            onClose={() => setRequestTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
