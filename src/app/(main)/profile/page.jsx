"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useRole } from "@/context/RoleContext";
import {
  Edit2,
  MapPin,
  BookOpen,
  Calendar,
  Star,
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
  Wifi,
  WifiOff,
  BookMarked,
  Award,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Zap,
  Upload,
  Download,
  Trash2,
  Shield,
  Users,
  ChevronDown,
  Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────────────────────────────────────

const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

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
  "Django",
  "Spring Boot",
  "Swift",
  "C++",
];

const STATUS_CONFIG = {
  pending: {
    color: "#e8b84b",
    bg: "rgba(232,184,75,0.1)",
    label: "Pending",
    icon: Clock,
  },
  accepted: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    label: "Upcoming",
    icon: Loader2,
  },
  completed: {
    color: "#1d9e75",
    bg: "rgba(29,158,117,0.1)",
    label: "Completed",
    icon: CheckCircle2,
  },
  rejected: {
    color: "#b05252",
    bg: "rgba(176,82,82,0.1)",
    label: "Declined",
    icon: XCircle,
  },
};

const LEVEL_COLORS = {
  Beginner: {
    bg: "rgba(29,158,117,0.12)",
    border: "rgba(29,158,117,0.3)",
    text: "#1d9e75",
    bar: "#1d9e75",
    iconBg: "rgba(29,158,117,0.1)",
    iconBorder: "rgba(29,158,117,0.25)",
  },
  Intermediate: {
    bg: "rgba(232,184,75,0.12)",
    border: "rgba(232,184,75,0.3)",
    text: "#e8b84b",
    bar: "#e8b84b",
    iconBg: "rgba(232,184,75,0.1)",
    iconBorder: "rgba(232,184,75,0.25)",
  },
  Advanced: {
    bg: "rgba(192,132,252,0.12)",
    border: "rgba(192,132,252,0.3)",
    text: "#c084fc",
    bar: "#c084fc",
    iconBg: "rgba(192,132,252,0.1)",
    iconBorder: "rgba(192,132,252,0.25)",
  },
};

const LEVEL_PROGRESS = { Beginner: 30, Intermediate: 65, Advanced: 100 };

// ─────────────────────────────────────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};



// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({
  url,
  name,
  size = 9,
  textSize = "xs",
  radius = "xl",
  border = false,
}) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cls = `flex shrink-0 items-center justify-center font-medium`;
  const style = {
    width: `${size * 4}px`,
    height: `${size * 4}px`,
    borderRadius:
      radius === "full" ? "9999px" : radius === "xl" ? "12px" : "8px",
    background: "rgba(232,184,75,0.1)",
    color: "#e8b84b",
    fontSize: textSize === "xs" ? "12px" : textSize === "sm" ? "14px" : "16px",
    border: border ? "1px solid #2a2520" : "none",
  };
  return url ? (
    <img src={url} alt={name} style={{ ...style, objectFit: "cover" }} />
  ) : (
    <div className={cls} style={style}>
      {initials}
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} style={{ color: "#e8b84b" }} />}
        <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(232,184,75,0.08)",
          border: "1px solid rgba(232,184,75,0.15)",
        }}
      >
        <Icon size={20} style={{ color: "#e8b84b" }} />
      </div>
      <p className="mb-1 text-sm font-medium" style={{ color: "#8a8070" }}>
        {title}
      </p>
      <p className="text-xs mb-3" style={{ color: "#4a4438" }}>
        {subtitle}
      </p>
      {action}
    </div>
  );
}

function StarRow({ score, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= score ? "#e8b84b" : "#2a2520",
            fill: i <= score ? "#e8b84b" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ background: "#1a1814" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Hero
// ─────────────────────────────────────────────────────────────────────────────

function ProfileHero({
  profile,
  user,
  role,
  completedCount,
  avgRating,
  totalSessions,
  isAvailable,
  onAvailabilityToggle,
  onEdit,
  isOwnProfile,
}) {
  const name = profile?.name || user?.email?.split("@")[0] || "Student";
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 md:p-6"
      style={{ background: "#0a0908", borderColor: "#2a2520" }}
    >
      {/* Top row: edit button */}
      {isOwnProfile && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white/5 transition-colors"
            style={{ borderColor: "rgba(232,184,75,0.2)", color: "#e8b84b" }}
          >
            <Edit2 size={11} /> Edit
          </motion.button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Avatar + Identity */}
        <div className="flex items-start gap-4 pr-20">
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="h-20 w-20 rounded-2xl object-cover"
                style={{ border: "2px solid #2a2520" }}
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-medium"
                style={{
                  background: "#141210",
                  border: "1px solid #2a2520",
                  color: "#e8b84b",
                }}
              >
                {name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            {/* Online indicator */}
            <div
              className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 flex items-center justify-center"
              style={{ background: "#0a0908", borderColor: "#0a0908" }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: "#1d9e75" }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1
              className="text-xl font-medium leading-tight"
              style={{ color: "#f5f0e8" }}
            >
              {name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {profile?.department && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#8a8070" }}
                >
                  <BookMarked size={10} /> {profile.department}
                </span>
              )}
              {profile?.location && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#8a8070" }}
                >
                  <MapPin size={10} /> {profile.location}
                </span>
              )}
              {joinedDate && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#8a8070" }}
                >
                  <Calendar size={10} /> Joined {joinedDate}
                </span>
              )}
            </div>
            {profile?.bio && (
              <p
                className="mt-2.5 text-xs leading-relaxed"
                style={{ color: "#6a6050" }}
              >
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <Divider />

        {/* Stats row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(232,184,75,0.07)" }}
            >
              <CheckCircle2 size={13} style={{ color: "#e8b84b" }} />
            </div>
            <div>
              <p
                className="text-sm font-medium leading-none"
                style={{ color: "#f5f0e8" }}
              >
                {completedCount || 0}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>
                Sessions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(232,184,75,0.07)" }}
            >
              <Star size={13} style={{ color: "#e8b84b" }} />
            </div>
            <div>
              <p
                className="text-sm font-medium leading-none"
                style={{ color: "#f5f0e8" }}
              >
                {avgRating || "—"}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>
                Rating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(232,184,75,0.07)" }}
            >
              <Users size={13} style={{ color: "#e8b84b" }} />
            </div>
            <div>
              <p
                className="text-sm font-medium leading-none"
                style={{ color: "#f5f0e8" }}
              >
                {totalSessions || 0}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>
                Total
              </p>
            </div>
          </div>

          {/* Availability toggle — tutor only */}
          {isOwnProfile && role === "tutor" && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onAvailabilityToggle}
              className="ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: isAvailable
                  ? "rgba(29,158,117,0.1)"
                  : "transparent",
                borderColor: isAvailable ? "rgba(29,158,117,0.35)" : "#2a2520",
                color: isAvailable ? "#1d9e75" : "#6a6050",
              }}
            >
              {isAvailable ? (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  Available
                </>
              ) : (
                <>
                  <WifiOff size={9} />
                  Unavailable
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor First-Time Setup Prompt
// ─────────────────────────────────────────────────────────────────────────────

function TutorSetupPrompt({ onDismiss, onSetup }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#0a0908", borderColor: "rgba(232,184,75,0.25)" }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "rgba(232,184,75,0.12)",
              border: "1px solid rgba(232,184,75,0.2)",
            }}
          >
            <Sparkles size={18} style={{ color: "#e8b84b" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
              Set up your tutor profile
            </p>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: "#6a6050" }}
            >
              Add the skills you can teach so students can find and request
              sessions with you.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSetup}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
            style={{ background: "#e8b84b", color: "#0e0c0a" }}
          >
            <Plus size={14} /> Add Teaching Skills
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            className="rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: "#2a2520", color: "#6a6050" }}
          >
            Later
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

//─────────────────────────────────────────────────────────────────────────────
// Streak calculator — counts consecutive days with a completed session
// ─────────────────────────────────────────────────────────────────────────────
 
function calcStreak(sessions) {
  const days = [
    ...new Set(
      sessions
        .filter((s) => s.status === "completed")
        .map((s) => new Date(s.created_at).toDateString())
    ),
  ];
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.includes(d.toDateString())) count++;
    else if (i > 0) break;
  }
  return count;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// SkillProgressCard — one card per learning skill
// ─────────────────────────────────────────────────────────────────────────────
 
function SkillProgressCard({ skill, sessCount, assessments, nextSession, index }) {
  const level = skill.proficiency_level || "Beginner";
  const col = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
  const progress = LEVEL_PROGRESS[level] || 28;
 
  // Latest assessment score for this skill
  const skillAssessments = (assessments || []).filter(
    (a) => a.skill_name?.toLowerCase() === skill.skill_name?.toLowerCase()
  );
  const latestScore =
    skillAssessments.length > 0
      ? skillAssessments[skillAssessments.length - 1].score
      : null;
 
  const hasNoAssessment = skillAssessments.length === 0;
 
  const nextDateStr = nextSession?.scheduled_time
    ? new Date(nextSession.scheduled_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
 
  return (
    <motion.div
      key={skill.id || index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      {/* ── Top section ── */}
      <div className="p-3.5">
        {/* Header row: icon + name + level badge + score */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2.5">
            {/* Colored icon box */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: col.iconBg,
                border: `1px solid ${col.iconBorder}`,
              }}
            >
              <BookOpen size={14} style={{ color: col.text }} />
            </div>
 
            <div>
              <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {skill.skill_name}
              </p>
              {/* Level badge */}
              <span
                className="mt-1 inline-block rounded-md px-2 py-0.5 text-[9px] font-semibold tracking-wide"
                style={{
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                  color: col.text,
                  letterSpacing: "0.05em",
                }}
              >
                {level.toUpperCase()}
              </span>
            </div>
          </div>
 
          {/* Latest assessment score — top right */}
          {latestScore !== null && (
            <div className="text-right shrink-0">
              <p
                className="text-lg font-medium leading-none"
                style={{ color: col.text }}
              >
                {latestScore}%
              </p>
              <p className="mt-1 text-[9px]" style={{ color: "#6a6050" }}>
                last score
              </p>
            </div>
          )}
        </div>
 
        {/* Progress bar */}
        <div
          className="h-1 w-full rounded-full overflow-hidden mb-1.5"
          style={{ background: "#2a2520" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: col.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.0, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="text-[10px]" style={{ color: "#4a4438" }}>
          {progress}% through {level}
        </p>
      </div>
 
      {/* ── Stats footer: sessions | next session ── */}
      <div
        className="grid grid-cols-2"
        style={{ borderTop: "1px solid #1a1814" }}
      >
        <div className="p-3" style={{ borderRight: "1px solid #1a1814" }}>
          <p className="text-base font-medium" style={{ color: "#f5f0e8" }}>
            {sessCount}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: "#6a6050" }}>
            sessions done
          </p>
        </div>
        <div className="p-3">
          {nextDateStr ? (
            <>
              <p
                className="text-xs font-medium"
                style={{ color: "#1d9e75" }}
              >
                {nextDateStr}
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: "#6a6050" }}>
                next session
              </p>
            </>
          ) : (
            <>
              <p className="text-xs" style={{ color: "#4a4438" }}>
                —
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: "#4a4438" }}>
                no upcoming
              </p>
            </>
          )}
        </div>
      </div>
 
      {/* ── No assessment nudge ── */}
      {hasNoAssessment && (
        <div
          className="flex items-center gap-1.5 px-3.5 py-2.5"
          style={{ borderTop: "1px solid #1a1814" }}
        >
          <Brain size={11} style={{ color: "#e8b84b" }} />
          <p className="text-[11px]" style={{ color: "#6a6050" }}>
            No assessment yet —{" "}
            <span
              className="cursor-pointer"
              style={{ color: "#e8b84b" }}
              onClick={() => router.push("/assessment")}
            >
              take one now
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// StudentLearningSection — drop-in replacement
// ─────────────────────────────────────────────────────────────────────────────
 
function StudentLearningSection({ skills, sessions, assessments = [] }) {
  const learnSkills = skills.filter((s) => s.type === "learn");
 
  // Sessions completed per skill name
  const completedBySkill = {};
  sessions
    .filter((s) => s.status === "completed")
    .forEach((s) => {
      const sk = s.skill?.skill_name || s.skill?.name;
      if (sk) completedBySkill[sk] = (completedBySkill[sk] || 0) + 1;
    });
 
  // Next upcoming session per skill
  const nextSessionBySkill = {};
  sessions
    .filter(
      (s) =>
        s.status === "accepted" &&
        s.scheduled_time &&
        new Date(s.scheduled_time) > new Date()
    )
    .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
    .forEach((s) => {
      const sk = s.skill?.skill_name || s.skill?.name;
      if (sk && !nextSessionBySkill[sk]) nextSessionBySkill[sk] = s;
    });
 
  // Streak
  const streak = calcStreak(sessions);
 
  return (
    <div className="space-y-3">
      <SectionCard>
        {/* ── Section header with streak badge ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: "#e8b84b" }} />
            <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
              Learning Progress
            </span>
          </div>
 
          {streak > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{
                background: "rgba(251,146,60,0.09)",
                border: "1px solid rgba(251,146,60,0.2)",
              }}
            >
              <Flame size={11} style={{ color: "#fb923c" }} />
              <span
                className="text-[11px] font-semibold"
                style={{ color: "#fb923c" }}
              >
                {streak} day streak
              </span>
            </div>
          )}
        </div>
 
        <div className="px-5 pb-5">
          {learnSkills.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No skills added yet"
              subtitle="Complete the setup wizard to add skills you want to learn"
            />
          ) : (
            <div className="space-y-3">
              {learnSkills.map((skill, i) => (
                <SkillProgressCard
                  key={skill.id || i}
                  skill={skill}
                  sessCount={completedBySkill[skill.skill_name] || 0}
                  assessments={assessments}
                  nextSession={nextSessionBySkill[skill.skill_name] || null}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
 


// ─────────────────────────────────────────────────────────────────────────────
// Tutor Courses Section
// ─────────────────────────────────────────────────────────────────────────────

function TutorCoursesSection({
  courses,
  isOwnProfile,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
}) {
  const teachSkills = courses || [];

  return (
    <div className="space-y-3">
      <SectionCard>
      <SectionHeader
        icon={BookOpen}
        title="Courses Offered"
        action={
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
            >
              {teachSkills.length} course{teachSkills.length !== 1 ? "s" : ""}
            </span>
            {isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAddCourse}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                style={{
                  background: "rgba(232,184,75,0.08)",
                  color: "#e8b84b",
                  border: "1px solid rgba(232,184,75,0.2)",
                }}
              >
                <Plus size={10} /> Add
              </motion.button>
            )}
          </div>
        }
      />
      <div className="px-5 pb-5">
        {teachSkills.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            subtitle="Add skills you can teach to appear in Explore"
          />
        ) : (
          <div className="space-y-3">
            {teachSkills.map((skill, i) => {
              const col =
                LEVEL_COLORS[skill.level] ||
                LEVEL_COLORS.Intermediate;
              const levelBadge =
                skill.level === "Advanced"
                  ? "Beginner -> Advanced"
                  : skill.level || "Beginner";
              const syllabus = [
                `Level 1 — Foundations of ${skill.skill_name}`,
                `Level 2 — Core concepts & practice`,
                `Level 3 — Advanced techniques`,
                `Level 4 — Real-world projects`,
              ];
              return (
                <motion.div
                  key={skill.id || i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="rounded-xl border p-4"
                  style={{ background: "#141210", borderColor: "#2a2520" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                        {skill.title || skill.skill_name}
                      </p>
                    </div>
                    <span
                      className="rounded-lg px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: col.bg,
                        border: `1px solid ${col.border}`,
                        color: col.text,
                      }}
                    >
                      {levelBadge}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#8a8070" }}>
                    {skill.short_description ||
                      skill.description ||
                      `A structured path from foundations to advanced ${skill.skill_name}. Each session includes notes and exercises.`}
                  </p>

                  <div className="mt-2 space-y-1.5">
                    {syllabus.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: "#6a6050" }}
                      >
                        <div
                          className="h-1 w-1 rounded-full shrink-0"
                          style={{ background: "#e8b84b" }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  {isOwnProfile ? (
                    <div className="mt-3 flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onEditCourse?.(skill)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl border py-2 text-xs"
                        style={{
                          borderColor: "#2a2520",
                          color: "#8a8070",
                        }}
                      >
                        <Edit2 size={11} />
                        Edit details
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onDeleteCourse?.(skill)}
                        className="flex items-center justify-center rounded-xl border px-3 py-2 text-xs"
                        style={{
                          borderColor: "rgba(176,82,82,0.35)",
                          color: "#b05252",
                        }}
                      >
                        <Trash2 size={11} />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="mt-4 w-full rounded-xl py-3 text-sm font-medium"
                      style={{
                        background: "#e8b84b",
                        color: "#0e0c0a",
                      }}
                    >
                      Request this Course
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      </SectionCard>
    </div>
  );
}

function CourseEditorModal({ initialSkill, onClose, onSave }) {
  const [form, setForm] = useState({
    title: initialSkill?.title || initialSkill?.skill_name || "",
    skill_name: initialSkill?.skill_name || "",
    level: initialSkill?.level || "Beginner",
    summary: initialSkill?.short_description || "",
    duration: initialSkill?.duration_text || "",
    prerequisites: initialSkill?.prerequisites || "",
    outcomes: initialSkill?.outcomes || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setErr("Course title is required");
      return;
    }
    const normalizedSkill = form.skill_name.trim() || form.title.trim();

    const chunks = [];
    if (form.summary.trim()) chunks.push(`Summary: ${form.summary.trim()}`);
    if (form.duration.trim()) chunks.push(`Duration: ${form.duration.trim()}`);
    if (form.prerequisites.trim())
      chunks.push(`Prerequisites: ${form.prerequisites.trim()}`);
    if (form.outcomes.trim()) chunks.push(`Outcomes: ${form.outcomes.trim()}`);
    const description = chunks.join("\n");

    setSaving(true);
    const { error } = await onSave({
      ...initialSkill,
      title: form.title.trim(),
      skill_name: normalizedSkill,
      level: form.level,
      short_description: form.summary.trim(),
      description,
      duration_text: form.duration.trim(),
      prerequisites: form.prerequisites.trim(),
      outcomes: form.outcomes.trim(),
    });
    setSaving(false);

    if (error) {
      setErr(error.message || "Could not save course");
      return;
    }
    onClose();
  };

  const inputStyle = {
    background: "#141210",
    borderColor: "#2a2520",
    color: "#f5f0e8",
  };
  const inputCls =
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";

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
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {initialSkill?.id ? "Edit Course" : "Add Course"}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/5"
          >
            <X size={14} style={{ color: "#6a6050" }} />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Course title
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Python Basics Bootcamp"
              className={inputCls}
              style={inputStyle}
              list="skill_suggestions"
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Primary skill
            </label>
            <input
              value={form.skill_name}
              onChange={(e) => set("skill_name", e.target.value)}
              placeholder="e.g. Python"
              className={inputCls}
              style={inputStyle}
              list="skill_suggestions"
            />
            <datalist id="skill_suggestions">
              {SKILL_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Level
            </label>
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Summary
            </label>
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="What students will learn in this course"
              rows={3}
              className={`${inputCls} resize-none`}
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "#8a8070" }}
              >
                Duration
              </label>
              <input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. 4 weeks"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "#8a8070" }}
              >
                Prerequisites
              </label>
              <input
                value={form.prerequisites}
                onChange={(e) => set("prerequisites", e.target.value)}
                placeholder="Optional"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Outcomes
            </label>
            <textarea
              value={form.outcomes}
              onChange={(e) => set("outcomes", e.target.value)}
              placeholder="What students should achieve by the end"
              rows={2}
              className={`${inputCls} resize-none`}
              style={inputStyle}
            />
          </div>

          {err && (
            <p className="text-xs" style={{ color: "#b05252" }}>
              {err}
            </p>
          )}

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
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
              style={{
                background: saving ? "#1a1814" : "#e8b84b",
                color: saving ? "#3a342c" : "#0e0c0a",
              }}
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving..." : "Save Course"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor Incoming Requests Section
// ─────────────────────────────────────────────────────────────────────────────

function TutorRequestsSection({ sessions, userId }) {
  const supabase = createSupabaseClient();
  const [items, setItems] = useState(
    sessions.filter((s) => s.provider_id === userId),
  );

  const handle = async (sessionId, action) => {
    const status = action === "accept" ? "accepted" : "rejected";
    const { error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId);
    if (!error)
      setItems((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status } : s)),
      );
  };

  const pending = items.filter((s) => s.status === "pending");
  const upcoming = items.filter((s) => s.status === "accepted");
  const past = items.filter((s) =>
    ["completed", "rejected"].includes(s.status),
  );

  return (
    <SectionCard>
      <SectionHeader
        icon={Zap}
        title="Incoming Requests"
        action={
          pending.length > 0 && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium"
              style={{ background: "#e8b84b", color: "#0e0c0a" }}
            >
              {pending.length}
            </span>
          )
        }
      />
      <div className="px-5 pb-5 space-y-4">
        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "#4a4438" }}
            >
              Awaiting response
            </p>
            <div className="space-y-2">
              {pending.map((s, i) => (
                <motion.div
                  key={s.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="rounded-xl border p-3.5"
                  style={{
                    background: "#141210",
                    borderColor: "rgba(232,184,75,0.15)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar
                      name={s.requester?.name}
                      url={s.requester?.avatar_url}
                      size={9}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#f5f0e8" }}
                      >
                        {s.requester?.name || "Student"}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#8a8070" }}
                      >
                        Wants to learn:{" "}
                        <span style={{ color: "#e8b84b" }}>
                          {s.skill?.skill_name || "Skill"}
                        </span>
                      </p>
                      {s.scheduled_time && (
                        <p
                          className="text-xs mt-1 flex items-center gap-1"
                          style={{ color: "#6a6050" }}
                        >
                          <Clock size={9} />
                          {new Date(s.scheduled_time).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handle(s.id, "reject")}
                      className="flex-1 rounded-xl border py-2 text-xs font-medium"
                      style={{ borderColor: "#2a2520", color: "#6a6050" }}
                    >
                      Decline
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handle(s.id, "accept")}
                      className="flex-1 rounded-xl py-2 text-xs font-medium"
                      style={{ background: "#e8b84b", color: "#0e0c0a" }}
                    >
                      Accept
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "#4a4438" }}
            >
              Upcoming
            </p>
            <div className="space-y-2">
              {upcoming.map((s, i) => (
                <SessionRow key={s.id} session={s} userId={userId} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "#4a4438" }}
            >
              Past
            </p>
            <div className="space-y-2">
              {past.map((s, i) => (
                <SessionRow key={s.id} session={s} userId={userId} index={i} />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No requests yet"
            subtitle="Students who find you in Explore will send requests here"
          />
        )}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Notes Upload Section (inside completed session)
// ─────────────────────────────────────────────────────────────────────────────

function SessionNotesPanel({ session, isOwnProfile, isTutor }) {
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
      const { data, error } = await supabase.storage
        .from("skillbridge-notes")
        .upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage
          .from("skillbridge-notes")
          .getPublicUrl(path);
        const newNote = {
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
        };
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        await supabase
          .from("sessions")
          .update({ notes: updatedNotes })
          .eq("id", session.id);
      }
    } finally {
      setUploading(false);
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
  if (!isTutor && !isOwnProfile && notes.length === 0) return null;

  return (
    <div
      className="mt-3 rounded-xl border overflow-hidden"
      style={{ borderColor: "#2a2520" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{
          background: "#0e0c0a",
          borderBottom:
            notes.length > 0 || isTutor ? "1px solid #1a1814" : "none",
        }}
      >
        <FileText size={11} style={{ color: "#e8b84b" }} />
        <span className="text-[11px] font-medium" style={{ color: "#8a8070" }}>
          Session notes
        </span>
        {isTutor && isOwnProfile && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              className="hidden"
              onChange={handleUpload}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[10px]"
              style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
            >
              {uploading ? (
                <Loader2 size={9} className="animate-spin" />
              ) : (
                <Upload size={9} />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </motion.button>
          </>
        )}
      </div>
      {notes.length > 0 && (
        <div className="divide-y" style={{ "--tw-divide-opacity": 1 }}>
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-3 py-2.5"
              style={{ background: "#0a0908", borderColor: "#1a1814" }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "#141210", border: "1px solid #2a2520" }}
              >
                <FileText size={11} style={{ color: "#e8b84b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: "#f5f0e8" }}>
                  {note.name}
                </p>
                <p className="text-[10px]" style={{ color: "#4a4438" }}>
                  {note.size ? `${Math.round(note.size / 1024)} KB` : ""}
                </p>
              </div>
              <a href={note.url} target="_blank" rel="noreferrer">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px]"
                  style={{
                    background: "rgba(29,158,117,0.1)",
                    color: "#1d9e75",
                  }}
                >
                  <Download size={9} /> View
                </motion.button>
              </a>
              {isTutor && isOwnProfile && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(idx)}
                  className="rounded-lg p-1 hover:bg-white/5"
                >
                  <Trash2 size={11} style={{ color: "#4a4438" }} />
                </motion.button>
              )}
            </div>
          ))}
        </div>
      )}
      {notes.length === 0 && isTutor && isOwnProfile && (
        <p className="px-3 py-2.5 text-[11px]" style={{ color: "#4a4438" }}>
          Upload notes for the student to download
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Row
// ─────────────────────────────────────────────────────────────────────────────

function SessionRow({
  session: s,
  userId,
  index,
  showNotes = false,
  isTutor = false,
}) {
  const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isRequester = s.requester_id === userId;
  const other = isRequester ? s.provider : s.requester;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="rounded-xl border p-3.5"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      <div className="flex items-start gap-3">
        <Avatar name={other?.name} url={other?.avatar_url} size={9} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {other?.name || "User"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                {s.skill?.skill_name || s.skill?.name || "Session"}
              </p>
            </div>
            <span
              className="flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px]"
              style={{
                background: cfg.bg,
                borderColor: cfg.color + "40",
                color: cfg.color,
              }}
            >
              <StatusIcon
                size={8}
                className={s.status === "accepted" ? "animate-spin" : ""}
              />
              {cfg.label}
            </span>
          </div>
          {s.scheduled_time && (
            <p
              className="mt-1 flex items-center gap-1 text-xs"
              style={{ color: "#6a6050" }}
            >
              <Clock size={9} />
              {new Date(s.scheduled_time).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
      {showNotes && (
        <SessionNotesPanel session={s} isOwnProfile isTutor={isTutor} />
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session History (Student view)
// ─────────────────────────────────────────────────────────────────────────────

function StudentSessionsSection({ sessions, userId }) {
  const visible = sessions.slice(0, 6);
  return (
    <SectionCard>
      <SectionHeader icon={Calendar} title="Session History" />
      <div className="px-5 pb-5">
        {visible.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No sessions yet"
            subtitle="Your sessions will appear here once you get started"
          />
        ) : (
          <div className="space-y-2">
            {visible.map((s, i) => (
              <SessionRow
                key={s.id}
                session={s}
                userId={userId}
                index={i}
                showNotes
                isTutor={false}
              />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ratings & Reviews
// ─────────────────────────────────────────────────────────────────────────────

function RatingsSection({ ratings, avgRating }) {
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.score === star).length,
    pct: ratings.length
      ? Math.round(
          (ratings.filter((r) => r.score === star).length / ratings.length) *
            100,
        )
      : 0,
  }));

  return (
    <SectionCard>
      <SectionHeader icon={Star} title="Ratings & Reviews" />
      <div className="px-5 pb-5">
        {ratings.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            subtitle="Reviews appear after completed sessions"
          />
        ) : (
          <>
            <div
              className="mb-4 flex items-center gap-5 rounded-xl border p-4"
              style={{ background: "#141210", borderColor: "#2a2520" }}
            >
              <div className="text-center shrink-0">
                <div
                  className="text-3xl font-medium"
                  style={{ color: "#e8b84b" }}
                >
                  {avgRating}
                </div>
                <StarRow score={Math.round(parseFloat(avgRating || 0))} />
                <div className="mt-1 text-[10px]" style={{ color: "#6a6050" }}>
                  {ratings.length} reviews
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {dist.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span
                      className="w-2 text-right text-[10px] shrink-0"
                      style={{ color: "#6a6050" }}
                    >
                      {star}
                    </span>
                    <div
                      className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ background: "#2a2520" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "#e8b84b" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {ratings.map((r, i) => (
                <motion.div
                  key={r.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="rounded-xl border p-3.5"
                  style={{ background: "#141210", borderColor: "#2a2520" }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={r.rater?.name}
                      url={r.rater?.avatar_url}
                      size={8}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p
                            className="text-xs font-medium"
                            style={{ color: "#f5f0e8" }}
                          >
                            {r.rater?.name || "Anonymous"}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: "#4a4438" }}
                          >
                            {new Date(r.created_at).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )}
                          </p>
                        </div>
                        <StarRow score={r.score} size={10} />
                      </div>
                      {r.feedback && (
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "#8a8070" }}
                        >
                          {r.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Edit Modal
// ─────────────────────────────────────────────────────────────────────────────

function ProfileEditModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    department: profile?.department || "",
    location: profile?.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErr("Name is required");
      return;
    }
    setSaving(true);
    const { error } = await onSave(form);
    if (error) {
      setErr(error.message);
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "#141210",
    borderColor: "#2a2520",
    color: "#f5f0e8",
  };
  const inputCls =
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";

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
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            Edit Profile
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/5"
          >
            <X size={14} style={{ color: "#6a6050" }} />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Display name
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Location
            </label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, College"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "#8a8070" }}
            >
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell others about yourself…"
              rows={3}
              className={`${inputCls} resize-none`}
              style={inputStyle}
            />
          </div>
          {err && (
            <p
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#b05252" }}
            >
              <AlertCircle size={11} /> {err}
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
            style={{
              background: saving ? "#1a1814" : "#e8b84b",
              color: saving ? "#3a342c" : "#0e0c0a",
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const supabase = createSupabaseClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useRole();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [showTutorSetup, setShowTutorSetup] = useState(false);
  const [courseEditorSkill, setCourseEditorSkill] = useState(null);

  useEffect(() => {
    function onRoleChange(event) {
      const nextRole = event?.detail;
      if (nextRole !== "student" && nextRole !== "tutor") return;

      setActiveTab("main");

      if (nextRole === "tutor" && isOwnProfile) {
        const hasTeachSkills = skills.some((s) => s.type === "teach");
        const hasCourses = courses.length > 0;
        if (!hasTeachSkills && !hasCourses) setShowTutorSetup(true);
      }
    }

    window.addEventListener("sb_role_change", onRoleChange);
    return () => window.removeEventListener("sb_role_change", onRoleChange);
  }, [isOwnProfile, skills, courses]);

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

      const uid = searchParams.get("id") || authUser.id;
      setIsOwnProfile(uid === authUser.id);

      const [
        { data: profileData },
        { data: skillsData },
        { data: coursesData },
        { data: sessionsData },
        { data: ratingsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("user_skills").select("*, skill:skill_id(*)").eq("user_id", uid),
        supabase
          .from("courses")
          .select("*")
          .eq("tutor_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("sessions")
          .select(
            "*, requester:requester_id(name,avatar_url), provider:provider_id(name,avatar_url), skill:skill_id(skill_name,name)",
          )
          .or(`requester_id.eq.${uid},provider_id.eq.${uid}`)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("ratings")
          .select("*, rater:rater_id(name,avatar_url)")
          .eq("rated_id", uid)
          .order("created_at", { ascending: false }),
      ]);

      const nextSkills = (skillsData || []).map(us => ({
        ...us.skill,
        type: us.type,
        user_skill_id: us.id,
        skill_id: us.skill_id
      })).filter(s => s.name || s.skill_name);

      const teachSkillMap = new Map(
        nextSkills
          .filter((s) => s.type === "teach")
          .map((s) => [String(s.name || s.skill_name || "").toLowerCase(), s.skill_id]),
      );
      const mappedCourses = (coursesData || []).map((c) => ({
        ...c,
        skill_id:
          c.skill_id ||
          teachSkillMap.get(String(c.name || c.skill_name || "").toLowerCase()) ||
          null,
      }));

      setProfile(profileData);
      setSkills(nextSkills);
      setCourses(mappedCourses);
      setSessions(sessionsData || []);
      setRatings(ratingsData || []);
      setIsAvailable(profileData?.is_available || false);
      setLoading(false);
    }
    fetchAll();
  }, [supabase, searchParams, router]);

  const handleAvailabilityToggle = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    const { error } = await supabase
      .from("profiles")
      .update({ is_available: next })
      .eq("id", user.id);
    if (error) console.error("Availability toggle failed:", error.message);
  };

  const handleProfileUpdate = async (data) => {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id)
      .select()
      .single();
    if (!error) {
      setProfile(updated);
      setEditOpen(false);
    }
    return { error };
  };

  const handleCourseSave = async (course) => {
    if (!user?.id) return { error: new Error("Not authenticated") };

    const normalizedSkill = String(course.skill_name || "")
      .trim()
      .toLowerCase();
    let resolvedSkillId = null;

    if (normalizedSkill) {
      const existingTeach = skills.find(
        (s) =>
          s.type === "teach" &&
          String(s.name || s.skill_name || "").trim().toLowerCase() === normalizedSkill,
      );

      if (existingTeach?.skill_id || existingTeach?.id) {
        resolvedSkillId = existingTeach.skill_id || existingTeach.id;
      } else {
        // 1. Ensure global skill exists
        let globalSkill;
        const { data: existingGlobal } = await supabase
          .from("skills")
          .select("*")
          .ilike("name", course.skill_name)
          .single();

        if (existingGlobal) {
          globalSkill = existingGlobal;
        } else {
          const { data: newGlobal, error: gError } = await supabase
            .from("skills")
            .insert({ name: course.skill_name })
            .select()
            .single();
          if (gError) return { error: gError };
          globalSkill = newGlobal;
        }
        
        // 2. Link to user in user_skills table
        const { data: userSkill, error: usError } = await supabase
          .from("user_skills")
          .insert({
            user_id: user.id,
            skill_id: globalSkill.id,
            type: "teach"
          })
          .select("*, skill:skill_id(*)")
          .single();

        if (usError) return { error: usError };
        
        if (userSkill) {
          const mapped = { ...userSkill.skill, type: userSkill.type, skill_id: userSkill.skill_id };
          resolvedSkillId = mapped.skill_id;
          setSkills((prev) => [mapped, ...prev]);
        }
      }
    }

    if (course?.id) {
      const { data: updated, error } = await supabase
        .from("courses")
        .update({
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
        .eq("id", course.id)
        .eq("tutor_id", user.id)
        .select()
        .single();

      if (!error && updated) {
        setCourses((prev) =>
          prev.map((s) =>
            s.id === updated.id
              ? { ...updated, skill_id: resolvedSkillId || s.skill_id || null }
              : s,
          ),
        );
      }
      return { error };
    }

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

    if (!error && inserted) {
      setCourses((prev) => [
        { ...inserted, skill_id: resolvedSkillId || null },
        ...prev,
      ]);
      setShowTutorSetup(false);
    }
    return { error };
  };

  const handleCourseDelete = async (course) => {
    if (!course?.id || !user?.id) return;
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id)
      .eq("tutor_id", user.id);
    if (!error) {
      setCourses((prev) => prev.filter((s) => s.id !== course.id));
    }
  };

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1)
      : null;

  // Tab config — student only (tutor uses stacked layout)
  const STUDENT_TABS = [
    { id: "main", label: "Learning" },
    { id: "sessions", label: "Sessions" },
    { id: "ratings", label: "Reviews" },
  ];

  // Loading
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
          <Loader2 size={14} className="animate-spin" /> Loading profile…
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-8 lg:px-12"
      style={{ background: "#0e0c0a" }}
    >
      <div className="mx-auto max-w-2xl space-y-3">
        {/* Hero */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <ProfileHero
            profile={profile}
            user={user}
            role={role}
            completedCount={completedSessions.length}
            avgRating={avgRating}
            totalSessions={sessions.length}
            isAvailable={isAvailable}
            onAvailabilityToggle={handleAvailabilityToggle}
            onEdit={() => setEditOpen(true)}
            isOwnProfile={isOwnProfile}
          />
        </motion.div>

        {/* Tutor setup prompt */}
        <AnimatePresence>
          {showTutorSetup && role === "tutor" && (
            <TutorSetupPrompt
              onDismiss={() => setShowTutorSetup(false)}
              onSetup={() => {
                setShowTutorSetup(false);
                router.push("/profile?setup=true");
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Tutor: stacked layout (no tabs) ── */}
        {role === "tutor" && (
          <motion.div
            key="tutor-stacked"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {/* Courses Offered */}
            <TutorCoursesSection
              courses={courses}
              isOwnProfile={isOwnProfile}
              onAddCourse={() => setCourseEditorSkill({})}
              onEditCourse={(skill) => setCourseEditorSkill(skill)}
              onDeleteCourse={handleCourseDelete}
            />

            {/* Ratings & Reviews */}
            <RatingsSection ratings={ratings} avgRating={avgRating} />
          </motion.div>
        )}

        {/* ── Student: tab bar ── */}
        {role === "student" && (
          <>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="flex gap-1 rounded-xl p-1"
              style={{ background: "#0a0908", border: "1px solid #2a2520" }}
            >
              {STUDENT_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="relative flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors"
                  style={{ color: activeTab === id ? "#0e0c0a" : "#6a6050" }}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="profile-tab"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: "#e8b84b", zIndex: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`student-${activeTab}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "main" && (
                  <StudentLearningSection skills={skills} sessions={sessions} />
                )}
                {activeTab === "sessions" && (
                  <StudentSessionsSection sessions={sessions} userId={user?.id} />
                )}
                {activeTab === "ratings" && (
                  <RatingsSection ratings={ratings} avgRating={avgRating} />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editOpen && (
          <ProfileEditModal
            profile={profile}
            onSave={handleProfileUpdate}
            onClose={() => setEditOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {courseEditorSkill && (
          <CourseEditorModal
            initialSkill={courseEditorSkill?.id ? courseEditorSkill : null}
            onClose={() => setCourseEditorSkill(null)}
            onSave={handleCourseSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
