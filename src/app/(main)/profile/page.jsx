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
  RotateCcw,
  Check,
  Flame,
  Brain,
  GraduationCap,
  Send,
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
  "Computer Science", "Electronics & Communication", "Mechanical",
  "Information Technology", "Civil", "Electrical", "MCA", "MBA", "Other",
];

const SKILL_SUGGESTIONS = [
  "React", "Python", "Node.js", "Figma", "Machine Learning", "Data Structures",
  "Flutter", "SQL", "UI/UX Design", "Java", "Kotlin", "Docker", "Git",
  "TypeScript", "AWS", "MongoDB", "Django", "Spring Boot", "Swift", "C++",
];

const LEVEL_COLORS = {
  Beginner: {
    bg: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.3)", text: "#1d9e75",
    bar: "#1d9e75", iconBg: "rgba(29,158,117,0.1)", iconBorder: "rgba(29,158,117,0.25)",
  },
  Intermediate: {
    bg: "rgba(232,184,75,0.12)", border: "rgba(232,184,75,0.3)", text: "#e8b84b",
    bar: "#e8b84b", iconBg: "rgba(232,184,75,0.1)", iconBorder: "rgba(232,184,75,0.25)",
  },
  Advanced: {
    bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)", text: "#c084fc",
    bar: "#c084fc", iconBg: "rgba(192,132,252,0.1)", iconBorder: "rgba(192,132,252,0.25)",
  },
};

const LEVEL_PROGRESS = { Beginner: 30, Intermediate: 65, Advanced: 100 };

// ─────────────────────────────────────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ url, name, size = 9, textSize = "xs", radius = "xl", border = false }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const style = {
    width: `${size * 4}px`, height: `${size * 4}px`,
    borderRadius: radius === "full" ? "9999px" : radius === "xl" ? "12px" : "8px",
    background: "rgba(232,184,75,0.1)", color: "#e8b84b",
    fontSize: textSize === "xs" ? "12px" : textSize === "sm" ? "14px" : "16px",
    border: border ? "1px solid #2a2520" : "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 500, flexShrink: 0,
  };
  return url ? (
    <img src={url} alt={name} style={{ ...style, objectFit: "cover" }} />
  ) : (
    <div style={style}>{initials}</div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border ${className}`} style={{ background: "#0a0908", borderColor: "#2a2520" }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} style={{ color: "#e8b84b" }} />}
        <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{title}</span>
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
        style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.15)" }}
      >
        <Icon size={20} style={{ color: "#e8b84b" }} />
      </div>
      <p className="mb-1 text-sm font-medium" style={{ color: "#8a8070" }}>{title}</p>
      <p className="text-xs mb-3" style={{ color: "#4a4438" }}>{subtitle}</p>
      {action}
    </div>
  );
}

function StarRow({ score, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} style={{ color: i <= score ? "#e8b84b" : "#2a2520", fill: i <= score ? "#e8b84b" : "transparent" }} />
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

function ProfileHero({ profile, user, role, completedCount, avgRating, totalSessions, isAvailable, onAvailabilityToggle, onEdit, isOwnProfile, dayStreak, avgAssessment, viewedRole }) {
  const name = profile?.name || user?.email?.split("@")[0] || "Student";
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  // For public profiles, show based on what the viewed user is (tutor vs student)
  const displayRole = isOwnProfile ? role : viewedRole;

  return (
    <div className="relative overflow-hidden rounded-2xl border p-5 md:p-6" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold tracking-wide"
          style={{
            background: displayRole === "student" ? "rgba(232,184,75,0.1)" : "rgba(29,158,117,0.1)",
            border: `1px solid ${displayRole === "student" ? "rgba(232,184,75,0.25)" : "rgba(29,158,117,0.25)"}`,
            color: displayRole === "student" ? "#e8b84b" : "#1d9e75",
            letterSpacing: "0.08em",
          }}
        >
          {displayRole === "student" ? <GraduationCap size={11} /> : <BookOpen size={11} />}
          {displayRole === "student" ? "STUDENT" : "TUTOR"}
        </div>
        {isOwnProfile && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white/5 transition-colors"
            style={{ borderColor: "rgba(232,184,75,0.2)", color: "#e8b84b" }}
          >
            <Edit2 size={11} /> Edit
          </motion.button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4 pr-20">
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={name} className="h-20 w-20 rounded-2xl object-cover" style={{ border: "2px solid #2a2520" }} />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-medium"
                style={{ background: "#141210", border: "1px solid #2a2520", color: "#e8b84b" }}
              >
                {name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 flex items-center justify-center" style={{ background: "#0a0908", borderColor: "#0a0908" }}>
              <div className="h-2 w-2 rounded-full" style={{ background: "#1d9e75" }} />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-medium leading-tight" style={{ color: "#f5f0e8" }}>{name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {profile?.department && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#8a8070" }}>
                  <BookMarked size={10} /> {profile.department}
                </span>
              )}
              {profile?.location && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#8a8070" }}>
                  <MapPin size={10} /> {profile.location}
                </span>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#8a8070" }}>
                  <Calendar size={10} /> Joined {joinedDate}
                </span>
              )}
            </div>
            {profile?.bio && (
              <p className="mt-2.5 text-xs leading-relaxed" style={{ color: "#6a6050" }}>{profile.bio}</p>
            )}
          </div>
        </div>

        <Divider />

        {/* Stats */}
        {displayRole === "tutor" ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(232,184,75,0.07)" }}>
                <CheckCircle2 size={13} style={{ color: "#e8b84b" }} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none" style={{ color: "#f5f0e8" }}>{completedCount || 0}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>Sessions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(232,184,75,0.07)" }}>
                <Star size={13} style={{ color: "#e8b84b" }} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none" style={{ color: "#f5f0e8" }}>{avgRating || "—"}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(232,184,75,0.07)" }}>
                <Users size={13} style={{ color: "#e8b84b" }} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none" style={{ color: "#f5f0e8" }}>{totalSessions || 0}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>Total</p>
              </div>
            </div>
            {isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAvailabilityToggle}
                className="ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: isAvailable ? "rgba(29,158,117,0.1)" : "transparent",
                  borderColor: isAvailable ? "rgba(29,158,117,0.35)" : "#2a2520",
                  color: isAvailable ? "#1d9e75" : "#6a6050",
                }}
              >
                {isAvailable ? (
                  <><div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> Available</>
                ) : (
                  <><WifiOff size={9} /> Unavailable</>
                )}
              </motion.button>
            )}
          </div>
        ) : (
          // Student stats — only shown on own profile
          isOwnProfile ? (
            <div className="grid grid-cols-3 gap-0 rounded-xl overflow-hidden" style={{ background: "#141210", border: "1px solid #1e1c18" }}>
              <div className="flex flex-col items-center justify-center py-3">
                <CheckCircle2 size={12} style={{ color: "#1d9e75" }} className="mb-1" />
                <p className="text-lg font-semibold leading-none" style={{ color: "#f5f0e8" }}>{completedCount || 0}</p>
                <p className="mt-1 text-[10px]" style={{ color: "#6a6050" }}>Sessions done</p>
              </div>
              <div className="flex flex-col items-center justify-center py-3" style={{ borderLeft: "1px solid #1e1c18", borderRight: "1px solid #1e1c18" }}>
                <Flame size={12} style={{ color: "#fb923c" }} className="mb-1" />
                <p className="text-lg font-semibold leading-none" style={{ color: "#fb923c" }}>{dayStreak || 0}</p>
                <p className="mt-1 text-[10px]" style={{ color: "#6a6050" }}>Day streak</p>
              </div>
              <div className="flex flex-col items-center justify-center py-3">
                <TrendingUp size={12} style={{ color: "#e8b84b" }} className="mb-1" />
                <p className="text-lg font-semibold leading-none" style={{ color: "#f5f0e8" }}>{avgAssessment ? `${avgAssessment}%` : "—"}</p>
                <p className="mt-1 text-[10px]" style={{ color: "#6a6050" }}>Avg assessment</p>
              </div>
            </div>
          ) : (
            // Public student profile stats
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(232,184,75,0.07)" }}>
                  <CheckCircle2 size={13} style={{ color: "#e8b84b" }} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none" style={{ color: "#f5f0e8" }}>{completedCount || 0}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>Sessions</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor Setup Prompt
// ─────────────────────────────────────────────────────────────────────────────

function TutorSetupPrompt({ onDismiss, onSetup }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl border overflow-hidden" style={{ background: "#0a0908", borderColor: "rgba(232,184,75,0.25)" }}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.2)" }}>
            <Sparkles size={18} style={{ color: "#e8b84b" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Set up your tutor profile</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "#6a6050" }}>
              Head to Sessions to add courses you can teach. Students will request them directly from Explore.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onSetup} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium" style={{ background: "#e8b84b", color: "#0e0c0a" }}>
            <Plus size={14} /> Go to Sessions
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onDismiss} className="rounded-xl border px-4 py-2.5 text-sm" style={{ borderColor: "#2a2520", color: "#6a6050" }}>
            Later
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak calculator
// ─────────────────────────────────────────────────────────────────────────────

function calcStreak(sessions) {
  const days = [...new Set(sessions.filter((s) => s.status === "completed").map((s) => new Date(s.created_at).toDateString()))];
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
// Skill Progress Card (student learning)
// ─────────────────────────────────────────────────────────────────────────────

function SkillProgressCard({ skill, sessCount, assessments, nextSession, index }) {
  const router = useRouter();
  const level = skill.proficiency_level || "Beginner";
  const col = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
  const progress = LEVEL_PROGRESS[level] || 28;
  const skillAssessments = (assessments || []).filter((a) => a.skill_name?.toLowerCase() === skill.skill_name?.toLowerCase());
  const latestScore = skillAssessments.length > 0 ? skillAssessments[skillAssessments.length - 1].score : null;
  const hasNoAssessment = skillAssessments.length === 0;
  const nextDateStr = nextSession?.scheduled_at
    ? new Date(nextSession.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <motion.div key={skill.id || index} variants={fadeUp} initial="hidden" animate="visible" custom={index} className="rounded-2xl border overflow-hidden" style={{ background: "#141210", borderColor: "#2a2520" }}>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: col.iconBg, border: `1px solid ${col.iconBorder}` }}>
              <BookOpen size={14} style={{ color: col.text }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{skill.skill_name}</p>
              <span className="mt-1 inline-block rounded-md px-2 py-0.5 text-[9px] font-semibold tracking-wide" style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text, letterSpacing: "0.05em" }}>
                {level.toUpperCase()}
              </span>
            </div>
          </div>
          {latestScore !== null && (
            <div className="text-right shrink-0">
              <p className="text-lg font-medium leading-none" style={{ color: col.text }}>{latestScore}%</p>
              <p className="mt-1 text-[9px]" style={{ color: "#6a6050" }}>last score</p>
            </div>
          )}
        </div>
        <div className="h-1 w-full rounded-full overflow-hidden mb-1.5" style={{ background: "#2a2520" }}>
          <motion.div className="h-full rounded-full" style={{ background: col.bar }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.0, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <p className="text-[10px]" style={{ color: "#4a4438" }}>{progress}% through {level}</p>
      </div>
      <div className="grid grid-cols-2" style={{ borderTop: "1px solid #1a1814" }}>
        <div className="p-3" style={{ borderRight: "1px solid #1a1814" }}>
          <p className="text-base font-medium" style={{ color: "#f5f0e8" }}>{sessCount}</p>
          <p className="mt-0.5 text-[10px]" style={{ color: "#6a6050" }}>sessions done</p>
        </div>
        <div className="p-3">
          {nextDateStr ? (
            <><p className="text-xs font-medium" style={{ color: "#1d9e75" }}>{nextDateStr}</p><p className="mt-0.5 text-[10px]" style={{ color: "#6a6050" }}>next session</p></>
          ) : (
            <><p className="text-xs" style={{ color: "#4a4438" }}>—</p><p className="mt-0.5 text-[10px]" style={{ color: "#4a4438" }}>no upcoming</p></>
          )}
        </div>
      </div>
      {hasNoAssessment && (
        <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ borderTop: "1px solid #1a1814" }}>
          <Brain size={11} style={{ color: "#e8b84b" }} />
          <p className="text-[11px]" style={{ color: "#6a6050" }}>
            No assessment yet —{" "}
            <span className="cursor-pointer" style={{ color: "#e8b84b" }} onClick={() => router.push("/assessment")}>
              take one now
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Learning Section
// ─────────────────────────────────────────────────────────────────────────────

function StudentLearningSection({ skills, sessions, assessments = [], isOwnProfile = true }) {
  const learnSkills = skills.filter((s) => s.type === "learn");

  if (!isOwnProfile) {
    return (
      <SectionCard>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={14} style={{ color: "#e8b84b" }} />
            <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Currently Learning</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "#141210", color: "#6a6050", border: "1px solid #2a2520" }}>
            {learnSkills.length} skill{learnSkills.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="px-5 pb-5">
          {learnSkills.length === 0 ? (
            <EmptyState icon={BookOpen} title="No skills added" subtitle="This student hasn't added learning goals yet" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((skill, i) => {
                const level = skill.proficiency_level || "Beginner";
                const col = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
                return (
                  <div key={skill.id || i} className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ background: "#141210", borderColor: "#2a2520" }}>
                    <span className="text-xs" style={{ color: "#f5f0e8" }}>{skill.skill_name}</span>
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider" style={{ background: col.bg, color: col.text }}>
                      {level === "Intermediate" ? "INTER" : level.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionCard>
    );
  }

  const completedBySkill = {};
  sessions.filter((s) => s.status === "completed").forEach((s) => {
    const sk = s.course?.skill_name || s.course?.title;
    if (sk) completedBySkill[sk] = (completedBySkill[sk] || 0) + 1;
  });

  const nextSessionBySkill = {};
  sessions.filter((s) => s.status === "accepted" && s.scheduled_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .forEach((s) => {
      const sk = s.course?.skill_name || s.course?.title;
      if (sk && !nextSessionBySkill[sk]) nextSessionBySkill[sk] = s;
    });

  const streak = calcStreak(sessions);

  return (
    <SectionCard>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} style={{ color: "#e8b84b" }} />
          <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Learning Progress</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1" style={{ background: "rgba(251,146,60,0.09)", border: "1px solid rgba(251,146,60,0.2)" }}>
            <Flame size={11} style={{ color: "#fb923c" }} />
            <span className="text-[11px] font-semibold" style={{ color: "#fb923c" }}>{streak} day streak</span>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        {learnSkills.length === 0 ? (
          <EmptyState icon={BookOpen} title="No skills added yet" subtitle="Complete the setup wizard to add skills you want to learn" />
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assessment rank helpers
// ─────────────────────────────────────────────────────────────────────────────
const RANK_CONFIG = [
  { min: 90, label: "Expert",     color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  { min: 75, label: "Proficient", color: "#1d9e75", bg: "rgba(29,158,117,0.12)",  border: "rgba(29,158,117,0.3)" },
  { min: 60, label: "Competent",  color: "#e8b84b", bg: "rgba(232,184,75,0.12)",  border: "rgba(232,184,75,0.3)" },
  { min: 0,  label: "Beginner",   color: "#6a6050", bg: "rgba(106,96,80,0.12)",   border: "rgba(106,96,80,0.3)" },
];

function getRank(score) {
  return RANK_CONFIG.find((r) => score >= r.min) || RANK_CONFIG[RANK_CONFIG.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor Skills Section — shows assessed skills + rank
// ─────────────────────────────────────────────────────────────────────────────
function TutorSkillsSection({ skills, assessments, isOwnProfile }) {
  const router = useRouter();
  const teachSkills = skills.filter((s) => s.type === "teach");

  // Build a map: skill name → latest assessment
  const latestAssessment = {};
  (assessments || []).forEach((a) => {
    const key = (a.skill_name || "").toLowerCase();
    if (!latestAssessment[key] || new Date(a.created_at) > new Date(latestAssessment[key].created_at)) {
      latestAssessment[key] = a;
    }
  });

  const overallAvg = assessments?.length > 0
    ? Math.round(assessments.reduce((acc, a) => acc + (a.score || 0), 0) / assessments.length)
    : null;

  const overallRank = overallAvg !== null ? getRank(overallAvg) : null;

  if (teachSkills.length === 0 && !isOwnProfile) return null;

  return (
    <SectionCard>
      <SectionHeader
        icon={Brain}
        title="Verified Skills"
        action={
          isOwnProfile ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/assessment")}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
              style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.2)" }}
            >
              <RotateCcw size={10} /> Re-assess
            </motion.button>
          ) : overallRank ? (
            <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1"
              style={{ background: overallRank.bg, borderColor: overallRank.border }}>
              <Shield size={11} style={{ color: overallRank.color }} />
              <span className="text-[11px] font-semibold" style={{ color: overallRank.color }}>
                {overallRank.label}
              </span>
              {overallAvg !== null && (
                <span className="text-[10px]" style={{ color: overallRank.color, opacity: 0.75 }}>
                  {overallAvg}%
                </span>
              )}
            </div>
          ) : null
        }
      />
      <div className="px-5 pb-5">
        {teachSkills.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No verified skills yet"
            subtitle="Complete an assessment to earn your skill rank"
            action={
              isOwnProfile ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/assessment")}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium"
                  style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.2)" }}
                >
                  Take Assessment <ArrowRight size={11} />
                </motion.button>
              ) : null
            }
          />
        ) : (
          <div className="space-y-2.5">
            {teachSkills.map((skill, i) => {
              const key = (skill.name || skill.skill_name || "").toLowerCase();
              const assessment = latestAssessment[key];
              const rank = assessment ? getRank(assessment.score) : null;
              const level = skill.proficiency_level || "Intermediate";

              return (
                <motion.div key={skill.id || i} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                  className="flex items-center justify-between rounded-xl border p-3.5"
                  style={{ background: "#141210", borderColor: "#2a2520" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "rgba(232,184,75,0.07)", border: "1px solid rgba(232,184,75,0.12)" }}>
                      <BookOpen size={13} style={{ color: "#e8b84b" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#f5f0e8" }}>
                        {skill.name || skill.skill_name}
                      </p>
                      <span className="text-[10px]" style={{ color: "#6a6050" }}>{level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {rank ? (
                      <>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: rank.color }}>{assessment.score}%</p>
                          <p className="text-[10px]" style={{ color: "#4a4438" }}>last score</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-lg border px-2 py-1"
                          style={{ background: rank.bg, borderColor: rank.border }}>
                          <Shield size={10} style={{ color: rank.color }} />
                          <span className="text-[10px] font-semibold" style={{ color: rank.color }}>{rank.label}</span>
                        </div>
                      </>
                    ) : (
                      isOwnProfile ? (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => router.push(`/assessment?skill=${encodeURIComponent(skill.name || skill.skill_name)}`)}
                          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium"
                          style={{ borderColor: "rgba(232,184,75,0.2)", color: "#e8b84b", background: "rgba(232,184,75,0.05)" }}
                        >
                          <Brain size={9} /> Assess
                        </motion.button>
                      ) : (
                        <span className="text-[10px]" style={{ color: "#3a3428" }}>Not assessed</span>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutor Courses Section (read-only on profile; editing is done in /sessions)
// ─────────────────────────────────────────────────────────────────────────────

function TutorCoursesSection({ courses, isOwnProfile, onRequestCourse }) {
  const router = useRouter();
  const teachSkills = courses || [];

  return (
    <SectionCard>
      <SectionHeader
        icon={BookOpen}
        title="Courses Offered"
        action={
          <div className="flex items-center gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}>
              {teachSkills.length} course{teachSkills.length !== 1 ? "s" : ""}
            </span>
            {isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/sessions")}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.2)" }}
              >
                Manage in Sessions
              </motion.button>
            )}
          </div>
        }
      />
      <div className="px-5 pb-5">
        {teachSkills.length === 0 ? (
          isOwnProfile ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              subtitle="Add courses in Sessions to appear in Explore"
              action={
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/sessions")}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium"
                  style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.2)" }}
                >
                  Go to Sessions <ArrowRight size={11} />
                </motion.button>
              }
            />
          ) : (
            <EmptyState icon={BookOpen} title="No courses listed" subtitle="This tutor hasn't published any courses yet" />
          )
        ) : (
          <div className="space-y-3">
            {teachSkills.map((skill, i) => {
              const col = LEVEL_COLORS[skill.level] || LEVEL_COLORS.Intermediate;
              const levelBadge = skill.level === "Advanced" ? "Beginner → Advanced" : skill.level || "Beginner";
              const syllabus = [
                `Level 1 — Foundations of ${skill.skill_name}`,
                `Level 2 — Core concepts & practice`,
                `Level 3 — Advanced techniques`,
                `Level 4 — Real-world projects`,
              ];
              return (
                <motion.div key={skill.id || i} variants={fadeUp} initial="hidden" animate="visible" custom={i} className="rounded-xl border p-4" style={{ background: "#141210", borderColor: "#2a2520" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{skill.title || skill.skill_name}</p>
                    </div>
                    <span className="rounded-lg px-2 py-0.5 text-[10px] font-medium" style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text }}>
                      {levelBadge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#8a8070" }}>
                    {skill.short_description || skill.description || `A structured path from foundations to advanced ${skill.skill_name}. Each session includes notes and exercises.`}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {syllabus.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: "#6a6050" }}>
                        <div className="h-1 w-1 rounded-full shrink-0" style={{ background: "#e8b84b" }} />
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Only show Request button on OTHER people's profiles */}
                  {!isOwnProfile && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onRequestCourse && onRequestCourse(skill)}
                      className="mt-4 w-full rounded-xl py-3 text-sm font-medium"
                      style={{ background: "#e8b84b", color: "#0e0c0a" }}
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ratings & Reviews
// ─────────────────────────────────────────────────────────────────────────────

function RatingsSection({ ratings, avgRating }) {
  const safeRatings = (ratings || []).filter((r) => r && typeof r.score === "number");
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: safeRatings.filter((r) => r.score === star).length,
    pct: safeRatings.length
      ? Math.round((safeRatings.filter((r) => r.score === star).length / safeRatings.length) * 100)
      : 0,
  }));

  return (
    <SectionCard>
      <SectionHeader icon={Star} title="Ratings & Reviews" />
      <div className="px-5 pb-5">
        {safeRatings.length === 0 ? (
          <EmptyState icon={Star} title="No reviews yet" subtitle="Reviews appear after completed sessions" />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-5 rounded-xl border p-4" style={{ background: "#141210", borderColor: "#2a2520" }}>
              <div className="text-center shrink-0">
                <div className="text-3xl font-medium" style={{ color: "#e8b84b" }}>{avgRating}</div>
                <StarRow score={Math.round(parseFloat(avgRating || 0))} />
                <div className="mt-1 text-[10px]" style={{ color: "#6a6050" }}>{safeRatings.length} reviews</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {dist.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-2 text-right text-[10px] shrink-0" style={{ color: "#6a6050" }}>{star}</span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#2a2520" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "#e8b84b" }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {safeRatings.map((r, i) => (
                <motion.div key={r.id || i} variants={fadeUp} initial="hidden" animate="visible" custom={i} className="rounded-xl border p-3.5" style={{ background: "#141210", borderColor: "#2a2520" }}>
                  <div className="flex items-start gap-3">
                    <Avatar name={r.reviewer?.name} url={r.reviewer?.avatar_url} size={8} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#f5f0e8" }}>{r.reviewer?.name || "Anonymous"}</p>
                          <p className="text-[10px]" style={{ color: "#4a4438" }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                          </p>
                        </div>
                        <StarRow score={r.score} size={10} />
                      </div>
                      {r.comment && (
                        <p className="text-xs leading-relaxed" style={{ color: "#8a8070" }}>{r.comment}</p>
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
    if (!form.name.trim()) { setErr("Name is required"); return; }
    setSaving(true);
    const { error } = await onSave(form);
    if (error) { setErr(error.message); setSaving(false); }
  };

  const inputStyle = { background: "#141210", borderColor: "#2a2520", color: "#f5f0e8" };
  const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 md:items-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#1a1814" }}>
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Edit Profile</p>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5"><X size={14} style={{ color: "#6a6050" }} /></button>
        </div>
        <div className="p-5 space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Display name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Location</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, College" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Department</label>
            <select value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls} style={inputStyle}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Bio</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell others about yourself…" rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          {err && <p className="flex items-center gap-1.5 text-xs" style={{ color: "#b05252" }}><AlertCircle size={11} /> {err}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
            style={{ background: saving ? "#1a1814" : "#e8b84b", color: saving ? "#3a342c" : "#0e0c0a" }}
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Course Modal (from a viewed profile)
// ─────────────────────────────────────────────────────────────────────────────

function RequestFromProfileModal({ course, tutorId, tutorName, currentUserId, supabase, onClose }) {
  const router = useRouter();
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!preferredTime) { setErr("Please select a preferred time slot."); return; }
    setSubmitting(true); setErr("");

    const payload = {
      student_id: currentUserId,
      tutor_id: tutorId,
      status: "pending",
      tutor_message: message.trim() || null,
      preferred_time: new Date(preferredTime).toISOString(),
    };

    if (course?.id && !String(course.id).startsWith("mock")) payload.course_id = course.id;

    const { error } = await supabase.from("sessions").insert(payload);
    setSubmitting(false);
    if (error) { setErr(error.message || "Failed to send request."); return; }
    setDone(true);
    setTimeout(() => { onClose(); router.push("/sessions"); }, 1600);
  };

  const inputStyle = { background: "#141210", borderColor: "#2a2520", color: "#f5f0e8" };
  const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 md:items-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border overflow-hidden"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#1a1814" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Request Course</p>
            <p className="text-xs mt-0.5" style={{ color: "#6a6050" }}>{course?.title || course?.skill_name} with {tutorName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5"><X size={14} style={{ color: "#6a6050" }} /></button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }} className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)" }}>
              <CheckCircle2 size={26} style={{ color: "#1d9e75" }} />
            </motion.div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Request sent!</p>
            <p className="text-xs" style={{ color: "#6a6050" }}>Redirecting to sessions…</p>
          </div>
        ) : (
          <div className="p-5 space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Preferred time slot *</label>
              <input type="datetime-local" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>Message to tutor (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. I am a complete beginner…" rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
            </div>
            {err && <p className="text-xs" style={{ color: "#b05252" }}>{err}</p>}
            <div className="flex gap-2 pt-1">
              <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm" style={{ borderColor: "#2a2520", color: "#6a6050" }}>Cancel</motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
                style={{ background: submitting ? "#c9a040" : "#e8b84b", color: "#0e0c0a" }}
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {submitting ? "Sending…" : "Send Request"}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ───────����─��──────────────────────────────────────────────────────────────────

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
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showTutorSetup, setShowTutorSetup] = useState(false);
  const [requestCourseModal, setRequestCourseModal] = useState(null);
  const [viewedRole, setViewedRole] = useState("student"); // for public profiles

  useEffect(() => {
    function onRoleChange(event) {
      const nextRole = event?.detail;
      if (nextRole !== "student" && nextRole !== "tutor") return;
      if (nextRole === "tutor" && isOwnProfile) {
        const hasCourses = courses.length > 0;
        if (!hasCourses) setShowTutorSetup(true);
      }
    }
    window.addEventListener("sb_role_change", onRoleChange);
    return () => window.removeEventListener("sb_role_change", onRoleChange);
  }, [isOwnProfile, courses]);

  useEffect(() => {
    async function fetchAll() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }
      setUser(authUser);

      const uid = searchParams.get("id") || authUser.id;
      const own = uid === authUser.id;
      setIsOwnProfile(own);

      const [
        { data: profileData },
        { data: skillsData },
        { data: coursesData },
        { data: sessionsData },
        { data: ratingsData },
        { data: assessmentsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("user_skills").select("*, skill:skill_id(*)").eq("user_id", uid),
        supabase.from("courses").select("*").eq("tutor_id", uid).order("created_at", { ascending: false }),
        supabase.from("sessions")
          .select("*, student:student_id(name,avatar_url), tutor:tutor_id(name,avatar_url)")
          .or(`student_id.eq.${uid},tutor_id.eq.${uid}`)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.from("reviews").select("*, reviewer:reviewer_id(name,avatar_url)").eq("reviewee_id", uid).order("created_at", { ascending: false }),
        supabase.from("assessments").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);

      console.log(skillsData, "all skills data");
      

      const nextSkills = (skillsData || [])
        .map((us) => ({ ...us.skill, type: us.type, user_skill_id: us.id, skill_id: us.skill_id }))
        .filter((s) => s.name || s.skill_name);

      const mappedCourses = (coursesData || []);

      // Determine the role of the viewed profile:
      // if they have courses → tutor, else → student
      if (!own) {
        setViewedRole(mappedCourses.length > 0 ? "tutor" : "student");
      }

      setProfile(profileData);
      setSkills(nextSkills);
      setCourses(mappedCourses);
      setSessions(sessionsData || []);

      // Only use real ratings — no mocks on profile page
      setRatings((ratingsData || []).filter((r) => r && typeof r.score === "number"));
      setAssessments(assessmentsData || []);
      setIsAvailable(profileData?.is_available || false);
      setLoading(false);
    }
    fetchAll();
  }, [supabase, searchParams, router]);

  const handleAvailabilityToggle = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    await supabase.from("profiles").update({ is_available: next }).eq("id", user.id);
  };

  const handleProfileUpdate = async (data) => {
    const { data: updated, error } = await supabase.from("profiles").update(data).eq("id", user.id).select().single();
    if (!error) { setProfile(updated); setEditOpen(false); }
    return { error };
  };

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, r) => a + (r.score || 0), 0) / ratings.length).toFixed(1)
    : null;
  const dayStreak = calcStreak(sessions);
  const avgAssessment = assessments.length > 0
    ? Math.round(assessments.reduce((a, r) => a + (r.score || 0), 0) / assessments.length)
    : null;

  // Determine what role to display for this profile
  const profileRole = isOwnProfile ? role : viewedRole;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0e0c0a" }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center gap-2 text-sm" style={{ color: "#4a4438" }}>
          <Loader2 size={14} className="animate-spin" /> Loading profile…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-12" style={{ background: "#0e0c0a" }}>
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
            dayStreak={dayStreak}
            avgAssessment={avgAssessment}
            viewedRole={viewedRole}
          />
        </motion.div>

        {/* Tutor setup nudge (own profile only) */}
        <AnimatePresence>
          {showTutorSetup && role === "tutor" && isOwnProfile && (
            <TutorSetupPrompt
              onDismiss={() => setShowTutorSetup(false)}
              onSetup={() => { setShowTutorSetup(false); router.push("/sessions"); }}
            />
          )}
        </AnimatePresence>

        {/* ── Public profile of a TUTOR ── */}
        {!isOwnProfile && profileRole === "tutor" && (
          <motion.div key="public-tutor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="space-y-3">
            <TutorSkillsSection skills={skills} assessments={assessments} isOwnProfile={false} />
            <TutorCoursesSection
              courses={courses}
              isOwnProfile={false}
              onRequestCourse={(course) => setRequestCourseModal(course)}
            />
            <RatingsSection ratings={ratings} avgRating={avgRating} />
          </motion.div>
        )}

        {/* ── Public profile of a STUDENT ── */}
        {!isOwnProfile && profileRole === "student" && (
          <motion.div key="public-student" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="space-y-3">
            <StudentLearningSection skills={skills} sessions={sessions} assessments={assessments} isOwnProfile={false} />
          </motion.div>
        )}

        {/* ── Own TUTOR profile ── */}
        {isOwnProfile && role === "tutor" && (
          <motion.div key="own-tutor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="space-y-3">
            <TutorSkillsSection skills={skills} assessments={assessments} isOwnProfile={true} />
            <TutorCoursesSection courses={courses} isOwnProfile={true} />
            <RatingsSection ratings={ratings} avgRating={avgRating} />
          </motion.div>
        )}

        {/* ── Own STUDENT profile ── */}
        {isOwnProfile && role === "student" && (
          <motion.div key="own-student" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="space-y-3">
            <StudentLearningSection skills={skills} sessions={sessions} assessments={assessments} isOwnProfile={true} />
          </motion.div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <ProfileEditModal profile={profile} onSave={handleProfileUpdate} onClose={() => setEditOpen(false)} />
        )}
      </AnimatePresence>

      {/* Request Course Modal (from public tutor profile) */}
      <AnimatePresence>
        {requestCourseModal && (
          <RequestFromProfileModal
            course={requestCourseModal}
            tutorId={searchParams.get("id")}
            tutorName={profile?.name || "Tutor"}
            currentUserId={user?.id}
            supabase={supabase}
            onClose={() => setRequestCourseModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}