"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useRole } from "@/context/RoleContext";
import {
  Brain, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Clock,
  Loader2, Sparkles, BarChart3, AlertCircle, BookOpen, Target,
  TrendingUp, TrendingDown, Minus, Star, FileText, Send, RotateCcw,
  User, GraduationCap, Zap, Trophy, CircleDot, Circle, Plus, X,
  Shield, ArrowRight, Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase
// ─────────────────────────────────────────────────────────────────────────────
const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  "React", "Python", "Node.js", "Figma", "Machine Learning", "Data Structures",
  "Flutter", "SQL", "UI/UX Design", "Java", "Kotlin", "Docker", "Git",
  "TypeScript", "AWS", "MongoDB", "Django", "Spring Boot", "Swift", "C++",
  "Mathematics", "Physics", "Data Analysis", "Deep Learning", "Next.js",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const RANK_CONFIG = [
  { min: 90, label: "Expert",      color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  { min: 75, label: "Proficient",  color: "#1d9e75", bg: "rgba(29,158,117,0.12)",  border: "rgba(29,158,117,0.3)" },
  { min: 60, label: "Competent",   color: "#e8b84b", bg: "rgba(232,184,75,0.12)",  border: "rgba(232,184,75,0.3)" },
  { min: 0,  label: "Beginner",    color: "#6a6050", bg: "rgba(106,96,80,0.12)",   border: "rgba(106,96,80,0.3)" },
];

function getRank(score) {
  return RANK_CONFIG.find((r) => score >= r.min) || RANK_CONFIG[RANK_CONFIG.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideIn = {
  enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.22 } }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 80) return "#1d9e75";
  if (score >= 60) return "#e8b84b";
  return "#b05252";
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Work";
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "ST";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Loading screen while AI generates questions
function GeneratingScreen({ skillName }) {
  const messages = [
    "Analysing skill requirements…",
    "Crafting questions…",
    "Calibrating difficulty…",
    "Finalising assessment…",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "#0e0c0a" }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#e8b84b", borderRightColor: "rgba(232,184,75,0.3)" }} />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.2)" }}>
            <Brain size={24} style={{ color: "#e8b84b" }} />
          </div>
        </div>
        <h2 className="text-lg font-medium" style={{ color: "#f5f0e8" }}>Generating your assessment</h2>
        <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>{skillName}</p>
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }} className="mt-4 text-xs" style={{ color: "#4a4438" }}>
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Progress bar at top
function ProgressBar({ current, total, timeLeft }) {
  const pct = ((current) / total) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft < 60;

  return (
    <div className="sticky top-0 z-20 px-4 py-3" style={{ background: "rgba(14,12,10,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1a1814" }}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: "#6a6050" }}>Question {current + 1} of {total}</span>
          <motion.span animate={{ color: isLow ? "#b05252" : "#8a8070" }} className="flex items-center gap-1 text-xs font-medium">
            <Clock size={11} />
            {mins}:{secs.toString().padStart(2, "0")}
          </motion.span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "#1a1814" }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full rounded-full" style={{ background: "#e8b84b" }} />
        </div>
      </div>
    </div>
  );
}

// Individual question card
function QuestionCard({ question, index, total, selected, onSelect, dir }) {
  return (
    <AnimatePresence mode="wait" custom={dir}>
      <motion.div key={question.id} custom={dir} variants={slideIn} initial="enter" animate="center" exit="exit" className="mx-auto max-w-2xl px-4 py-8">

        {/* Difficulty + topic badge */}
        <div className="mb-5 flex items-center gap-2">
          <span className="rounded-full px-2.5 py-1 text-xs capitalize" style={{
            background: question.difficulty === "hard" ? "rgba(176,82,82,0.1)" : question.difficulty === "medium" ? "rgba(232,184,75,0.1)" : "rgba(29,158,117,0.1)",
            color: question.difficulty === "hard" ? "#b05252" : question.difficulty === "medium" ? "#e8b84b" : "#1d9e75",
          }}>
            {question.difficulty}
          </span>
          <span className="rounded-full px-2.5 py-1 text-xs" style={{ background: "#141210", color: "#6a6050", border: "1px solid #2a2520" }}>{question.topic}</span>
        </div>

        {/* Question text */}
        <h2 className="text-base font-medium leading-relaxed" style={{ color: "#f5f0e8" }}>{question.question}</h2>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <motion.button key={i} whileTap={{ scale: 0.99 }} onClick={() => onSelect(i)}
                className="group w-full rounded-2xl border p-4 text-left transition-all"
                style={{
                  background: isSelected ? "rgba(232,184,75,0.08)" : "#0a0908",
                  borderColor: isSelected ? "rgba(232,184,75,0.4)" : "#2a2520",
                }}
                whileHover={{ borderColor: isSelected ? "rgba(232,184,75,0.5)" : "#3a342c" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all"
                    style={{ background: isSelected ? "#e8b84b" : "#141210", border: `1px solid ${isSelected ? "#e8b84b" : "#2a2520"}` }}>
                    <span className="text-xs font-medium" style={{ color: isSelected ? "#0e0c0a" : "#4a4438" }}>
                      {["A", "B", "C", "D"][i]}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: isSelected ? "#f5f0e8" : "#8a8070" }}>{option}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tutor report view
function TutorReport({ report, questions, answers, studentName, skillName, onRetake, onFinish }) {
  const scoreColor = getScoreColor(report.score);
  const scoreLabel = getScoreLabel(report.score);
  const correctCount = answers.filter((a, i) => a === questions[i].correct).length;
  const rank = getRank(report.score);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8" style={{ background: "#0e0c0a" }}>
      <div className="mx-auto max-w-3xl space-y-5">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="relative overflow-hidden rounded-2xl border p-6" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-10"
            style={{ background: `radial-gradient(circle, ${scoreColor} 0%, transparent 70%)` }} />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText size={13} style={{ color: "#e8b84b" }} />
                <span className="text-xs" style={{ color: "#6a6050" }}>Assessment Report</span>
              </div>
              <h1 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>{skillName}</h1>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}>
                  {getInitials(studentName)}
                </div>
                <span className="text-xs" style={{ color: "#8a8070" }}>{studentName}</span>
              </div>
              {/* Rank badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5"
                style={{ background: rank.bg, borderColor: rank.border }}>
                <Shield size={12} style={{ color: rank.color }} />
                <span className="text-xs font-semibold" style={{ color: rank.color }}>{rank.label} Rank</span>
              </div>
            </div>

            {/* Score ring */}
            <div className="text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#1a1814" strokeWidth="6" />
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - report.score / 100) }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
                </svg>
                <div>
                  <p className="text-xl font-medium" style={{ color: "#f5f0e8" }}>{report.score}%</p>
                </div>
              </div>
              <p className="mt-1 text-xs font-medium" style={{ color: scoreColor }}>{scoreLabel}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Correct", value: `${correctCount}/${questions.length}`, icon: CheckCircle2, color: "#1d9e75" },
              { label: "Time taken", value: `${Math.round(report.timeTaken / 60)}m`, icon: Clock, color: "#e8b84b" },
              { label: "Accuracy", value: `${report.score}%`, icon: Target, color: scoreColor },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "#141210", border: "1px solid #1e1c18" }}>
                <Icon size={14} style={{ color, margin: "0 auto 4px" }} />
                <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{value}</p>
                <p className="text-xs" style={{ color: "#4a4438" }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="rounded-2xl border p-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
          <div className="mb-3 flex items-center gap-2">
            <Brain size={14} style={{ color: "#e8b84b" }} />
            <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>AI Assessment Summary</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#8a8070" }}>{report.overallSummary}</p>
        </motion.div>

        {/* Strengths + Weaknesses */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "#1d9e75" }} />
              <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Strengths</span>
            </div>
            <div className="space-y-2">
              {(report.strengths || []).map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={12} style={{ color: "#1d9e75", marginTop: 2, flexShrink: 0 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#8a8070" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <div className="mb-3 flex items-center gap-2">
              <TrendingDown size={14} style={{ color: "#b05252" }} />
              <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Areas to improve</span>
            </div>
            <div className="space-y-2">
              {(report.weaknesses || []).map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertCircle size={12} style={{ color: "#b05252", marginTop: 2, flexShrink: 0 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#8a8070" }}>{w}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Topic breakdown */}
        {report.topicBreakdown?.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="rounded-2xl border p-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={14} style={{ color: "#e8b84b" }} />
              <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Topic Breakdown</span>
            </div>
            <div className="space-y-3">
              {report.topicBreakdown.map((t, i) => {
                const tc = getScoreColor(t.score);
                return (
                  <div key={i}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "#c8bfb0" }}>{t.topic}</span>
                      <span className="text-xs" style={{ color: tc }}>{t.score}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#1a1814" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${t.score}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full" style={{ background: tc }} />
                    </div>
                    {t.recommendation && (
                      <p className="mt-1 text-xs" style={{ color: "#4a4438" }}>{t.recommendation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Q&A Review */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
          className="rounded-2xl border overflow-hidden" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
            <div className="flex items-center gap-2">
              <BookOpen size={14} style={{ color: "#e8b84b" }} />
              <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Question Review</span>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "#1a1814" }}>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              const wasSkipped = answers[i] === null;
              return (
                <div key={q.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {wasSkipped
                        ? <Minus size={14} style={{ color: "#4a4438" }} />
                        : isCorrect
                        ? <CheckCircle2 size={14} style={{ color: "#1d9e75" }} />
                        : <XCircle size={14} style={{ color: "#b05252" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ color: "#c8bfb0" }}>{q.question}</p>
                      {!wasSkipped && !isCorrect && (
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                          <span className="text-xs" style={{ color: "#b05252" }}>Your answer: {q.options[answers[i]]}</span>
                          <span className="text-xs" style={{ color: "#1d9e75" }}>Correct: {q.options[q.correct]}</span>
                        </div>
                      )}
                      {isCorrect && (
                        <p className="mt-1 text-xs" style={{ color: "#1d9e75" }}>Correct — {q.options[q.correct]}</p>
                      )}
                      {q.explanation && (
                        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#4a4438" }}>
                          <span style={{ color: "#6a6050" }}>Explanation: </span>{q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Suggested topics */}
        {report.suggestedTopics?.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}
            className="rounded-2xl border p-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={14} style={{ color: "#e8b84b" }} />
              <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Suggested next topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.suggestedTopics.map((t, i) => (
                <span key={i} className="rounded-xl px-3 py-1.5 text-xs"
                  style={{ background: "rgba(232,184,75,0.07)", color: "#8a8070", border: "1px solid rgba(232,184,75,0.12)" }}>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tutor note */}
        {report.tutorNote && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}
            className="relative overflow-hidden rounded-2xl border p-5" style={{ background: "#141210", borderColor: "#3a342c" }}>
            <div className="mb-2 flex items-center gap-2">
              <Zap size={13} style={{ color: "#e8b84b" }} />
              <span className="text-xs font-medium" style={{ color: "#e8b84b" }}>Tutor&apos;s Note</span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: "#8a8070" }}>&quot;{report.tutorNote}&quot;</p>
            <p className="mt-2 text-xs" style={{ color: "#4a4438" }}>— SkillBridge AI Tutor</p>
          </motion.div>
        )}

        {/* Next steps */}
        {report.nextSteps && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}
            className="rounded-2xl border p-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <div className="mb-2 flex items-center gap-2">
              <Target size={14} style={{ color: "#e8b84b" }} />
              <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Next steps</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#8a8070" }}>{report.nextSteps}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="flex gap-3 pb-4">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onRetake}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
            style={{ border: "1px solid #2a2520", color: "#6a6050" }}>
            <RotateCcw size={13} /> Retake
          </motion.button>
          {onFinish && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={onFinish}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
              style={{ background: "#e8b84b", color: "#0e0c0a" }}>
              <ArrowRight size={13} /> Continue
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Skill Manager — add skills + levels, then pick one to assess
// ─────────────────────────────────────────────────────────────────────────────
function SkillSetupStep({ userId, supabase, existingSkills, onStart, isTutor, hasPassedAssessment }) {
  const [skills, setSkills]           = useState(existingSkills); // [{ id, name, level, assessed }]
  const [newSkill, setNewSkill]       = useState("");
  const [newLevel, setNewLevel]       = useState("Intermediate");
  const [adding, setAdding]           = useState(false);
  const [addError, setAddError]       = useState("");
  const [removing, setRemoving]       = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("intermediate");

  // Find skills that haven't been assessed or can be re-assessed
  const assessableSkills = skills;

  const handleAddSkill = async () => {
    const name = newSkill.trim();
    if (!name) { setAddError("Enter a skill name"); return; }
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setAddError("Skill already added"); return;
    }
    setAdding(true);
    setAddError("");

    // Find or create in `skills` table, then upsert into `user_skills`
    let skillId = null;
    const { data: existing } = await supabase.from("skills").select("id").ilike("name", name).limit(1).single();
    if (existing?.id) {
      skillId = existing.id;
    } else {
      const { data: created } = await supabase.from("skills").insert({ name, skill_name: name }).select("id").single();
      skillId = created?.id;
    }

    if (skillId) {
      await supabase.from("user_skills").upsert({
        user_id: userId,
        skill_id: skillId,
        type: isTutor ? "teach" : "learn",
        proficiency_level: newLevel,
      }, { onConflict: "user_id,skill_id" });

      setSkills((prev) => [...prev, { id: skillId, name, level: newLevel, assessed: false }]);
    }

    setNewSkill("");
    setAdding(false);
  };

  const handleRemoveSkill = async (skillId) => {
    setRemoving(skillId);
    await supabase.from("user_skills").delete().eq("user_id", userId).eq("skill_id", skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    if (selectedSkill?.id === skillId) setSelectedSkill(null);
    setRemoving(null);
  };

  const inputStyle = { background: "#141210", borderColor: "#2a2520", color: "#f5f0e8" };
  const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgba(232,184,75,0.4)]";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: "#0e0c0a" }}>
      <div className="w-full max-w-lg space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.2)" }}>
            <Brain size={24} style={{ color: "#e8b84b" }} />
          </div>
          <h1 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>
            {isTutor ? "Verify Your Teaching Skills" : "Set Up Your Skills"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>
            {isTutor
              ? "Add the skills you teach, then complete an AI assessment to earn your rank."
              : "Add skills you want to learn and track your progress."}
          </p>
          {isTutor && !hasPassedAssessment && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
              style={{ background: "rgba(232,184,75,0.07)", borderColor: "rgba(232,184,75,0.2)", color: "#e8b84b" }}>
              <AlertCircle size={11} />
              Complete an assessment to unlock course creation
            </div>
          )}
        </motion.div>

        {/* Add skill */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-2xl border p-5 space-y-3" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
          <p className="text-xs font-medium" style={{ color: "#8a8070" }}>Add a skill</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                value={newSkill}
                onChange={(e) => { setNewSkill(e.target.value); setAddError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                placeholder="e.g. Python, React…"
                className={inputCls}
                style={inputStyle}
                list="skill-suggestions"
              />
              <datalist id="skill-suggestions">
                {SKILL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              className="rounded-xl border px-2 py-2.5 text-sm outline-none"
              style={{ ...inputStyle, minWidth: 120 }}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddSkill}
              disabled={adding}
              className="flex items-center justify-center rounded-xl px-3 py-2.5"
              style={{ background: "#e8b84b", color: "#0e0c0a", minWidth: 44 }}
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </motion.button>
          </div>
          {addError && <p className="text-xs" style={{ color: "#b05252" }}>{addError}</p>}

          {/* Added skills list */}
          {skills.length > 0 && (
            <div className="space-y-2 mt-1">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                  style={{ background: "#141210", borderColor: "#2a2520" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: "#f5f0e8" }}>{s.name}</span>
                    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.15)" }}>
                      {s.level}
                    </span>
                    {s.assessed && (
                      <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: "rgba(29,158,117,0.1)", color: "#1d9e75" }}>
                        <Check size={9} /> Assessed
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(s.id)}
                    disabled={removing === s.id}
                    className="rounded-lg p-1 hover:bg-white/5"
                  >
                    {removing === s.id ? <Loader2 size={12} className="animate-spin" style={{ color: "#6a6050" }} /> : <X size={12} style={{ color: "#4a4438" }} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pick skill to assess */}
        {assessableSkills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="rounded-2xl border p-5 space-y-3" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <p className="text-xs font-medium" style={{ color: "#8a8070" }}>
              {hasPassedAssessment ? "Take a re-assessment" : "Select a skill to assess"}
            </p>

            <div className="space-y-2">
              {assessableSkills.map((s) => (
                <button key={s.id} onClick={() => setSelectedSkill(s)}
                  className="w-full rounded-xl border p-3 text-left transition-all"
                  style={{
                    background: selectedSkill?.id === s.id ? "rgba(232,184,75,0.05)" : "#141210",
                    borderColor: selectedSkill?.id === s.id ? "rgba(232,184,75,0.35)" : "#2a2520",
                  }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: selectedSkill?.id === s.id ? "#f5f0e8" : "#c8bfb0" }}>{s.name}</span>
                    <div className="flex items-center gap-2">
                      {s.assessed && (
                        <span className="text-[10px]" style={{ color: "#4a4438" }}>Re-assess</span>
                      )}
                      <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b" }}>
                        {s.level}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Difficulty level */}
            <div>
              <p className="mb-2 text-xs font-medium" style={{ color: "#8a8070" }}>Assessment difficulty</p>
              <div className="flex gap-2">
                {["beginner", "intermediate", "advanced"].map((l) => (
                  <button key={l} onClick={() => setSelectedLevel(l)}
                    className="flex-1 rounded-xl py-2 text-xs font-medium capitalize transition-all"
                    style={{
                      background: selectedLevel === l ? "#f5f0e8" : "#141210",
                      color: selectedLevel === l ? "#0e0c0a" : "#6a6050",
                      border: `1px solid ${selectedLevel === l ? "#f5f0e8" : "#2a2520"}`,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.98 }}
              onClick={() => selectedSkill && onStart({ skillName: selectedSkill.name, skillId: selectedSkill.id, level: selectedLevel })}
              disabled={!selectedSkill}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
              style={{ background: "#e8b84b", color: "#0e0c0a", opacity: !selectedSkill ? 0.4 : 1 }}>
              <Sparkles size={14} /> Start AI Assessment
            </motion.button>
          </motion.div>
        )}

        {assessableSkills.length === 0 && (
          <div className="rounded-2xl border p-5 text-center" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
            <Brain size={20} style={{ color: "#3a342c", margin: "0 auto 8px" }} />
            <p className="text-sm" style={{ color: "#4a4438" }}>Add at least one skill above to start your assessment</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function AssessmentPage() {
  const supabase     = createSupabaseClient();
  const { role }     = useRole();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const skillParam  = searchParams.get("skill");

  // ── State machine: setup → generating → quiz → evaluating → report ──
  const [stage, setStage]       = useState("setup");
  const [currentUser, setCurrentUser] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [skills,      setSkills]      = useState([]);     // [{id, name, level, assessed}]
  const [hasPassedAssessment, setHasPassedAssessment] = useState(false);

  const [skillName,   setSkillName]   = useState(skillParam || "");
  const [skillId,     setSkillId]     = useState(null);
  const [level,       setLevel]       = useState("intermediate");

  const [questions,   setQuestions]   = useState([]);
  const [answers,     setAnswers]     = useState([]);
  const [current,     setCurrent]     = useState(0);
  const [dir,         setDir]         = useState(1);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [startTime,   setStartTime]   = useState(null);
  const [timeTaken,   setTimeTaken]   = useState(0);

  const [report,      setReport]      = useState(null);
  const [error,       setError]       = useState("");

  const timerRef = useRef(null);

  // ── Auth + data fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      const { data: profileData } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      setStudentName(profileData?.name || user.email?.split("@")[0] || "Student");

      // Fetch user skills — for tutors only fetch "teach" type skills
      const skillsQuery = supabase
        .from("user_skills")
        .select("*, skill:skill_id(*)")
        .eq("user_id", user.id);

      // We'll fetch all then filter by role context below
      const { data: userSkillsData } = await skillsQuery;

      // Fetch existing assessments to mark which skills are assessed
      const { data: assessmentData } = await supabase
        .from("assessments")
        .select("skill_name, score, skill_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const assessedSkillNames = new Set(
        (assessmentData || []).map((a) => (a.skill_name || "").toLowerCase().trim())
      );
      const hasPassed = (assessmentData || []).some((a) => a.score >= 50);
      setHasPassedAssessment(hasPassed);

      // Filter to "teach" skills for tutors; show all for students
      const filtered = (userSkillsData || []).filter((us) =>
        role === "tutor" ? us.type === "teach" : true
      );

      const fetchedSkills = filtered
        .map((us) => {
          const sName = us.skill?.name || us.skill?.skill_name || "";
          return {
            id: us.skill_id,
            name: sName,
            level: us.proficiency_level || "Intermediate",
            assessed: assessedSkillNames.has(sName.toLowerCase().trim()),
          };
        })
        .filter((s) => s.name);

      setSkills(fetchedSkills);

      // Auto-start from ?skill= param
      if (skillParam) {
        const match = fetchedSkills.find((s) => s.name?.toLowerCase() === skillParam.toLowerCase());
        if (match) {
          kickoffGeneration(match.name, match.id, "intermediate");
        } else {
          kickoffGeneration(skillParam, null, "intermediate");
        }
      }
    }
    init();
  }, []);

  // ── Question generation ────────────────────────────────────────────────────
  const kickoffGeneration = async (skill, sId, lvl) => {
    setStage("generating");
    setSkillName(skill);
    setSkillId(sId || null);
    setLevel(lvl);
    setError("");

    try {
      const res = await fetch("/api/assessment/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: skill, level: lvl, count: 8 }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `API returned ${res.status}`);
      }

      const qs = await res.json();

      if (!qs?.length) throw new Error("No questions generated");

      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setTimeLeft(qs.length * 90);
      setStartTime(Date.now());
      setCurrent(0);
      setStage("quiz");
    } catch (e) {
      console.error("kickoffGeneration failed:", e);
      setError(e.message || "Failed to generate questions. Check your API key.");
      setStage("setup");
    }
  };

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "quiz") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = (next) => {
    setDir(next > current ? 1 : -1);
    setCurrent(next);
  };

  const selectAnswer = (optionIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  };

  // ── Submit quiz ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    setTimeTaken(elapsed);
    setStage("evaluating");

    try {
      const res = await fetch("/api/assessment/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName,
          studentName,
          questions,
          answers,
          timeTaken: elapsed,
        }),
      });

      const r = await res.json();
      setReport(r);

      if (currentUser) {
        // Resolve skill_id robustly — try by id first, fallback by name
        let resolvedSkillId = skillId;
        if (!resolvedSkillId) {
          const { data: foundSkill } = await supabase
            .from("skills")
            .select("id")
            .or(`name.ilike.${skillName},skill_name.ilike.${skillName}`)
            .limit(1)
            .single();
          resolvedSkillId = foundSkill?.id || null;
        }

        // Save assessment with skill_id
        const { error: insertErr } = await supabase.from("assessments").insert({
          user_id: currentUser.id,
          skill_name: skillName,
          skill_id: resolvedSkillId,
          score: r.score,
          report: r,
        });
        if (insertErr) {
          // Fallback: try without skill_id (column may not exist yet)
          await supabase.from("assessments").insert({
            user_id: currentUser.id,
            skill_name: skillName,
            score: r.score,
            report: r,
          });
        }

        // Update proficiency_level in user_skills based on score
        const newLevel = r.score >= 80 ? "Advanced" : r.score >= 55 ? "Intermediate" : "Beginner";
        if (resolvedSkillId) {
          await supabase.from("user_skills")
            .update({ proficiency_level: newLevel })
            .eq("user_id", currentUser.id)
            .eq("skill_id", resolvedSkillId);
        } else {
          // Try matching by skill name in user_skills via join
          const { data: us } = await supabase
            .from("user_skills")
            .select("skill_id, skill:skill_id(name, skill_name)")
            .eq("user_id", currentUser.id);
          const match = (us || []).find((row) =>
            (row.skill?.name || row.skill?.skill_name || "").toLowerCase() === skillName.toLowerCase()
          );
          if (match?.skill_id) {
            await supabase.from("user_skills")
              .update({ proficiency_level: newLevel })
              .eq("user_id", currentUser.id)
              .eq("skill_id", match.skill_id);
          }
        }

        // Mark skill as assessed in local state
        setSkills((prev) => prev.map((s) =>
          (s.id === resolvedSkillId || s.name?.toLowerCase() === skillName.toLowerCase())
            ? { ...s, assessed: true }
            : s
        ));

        if (r.score >= 50) setHasPassedAssessment(true);
      }

      setStage("report");
    } catch (e) {
      console.error("handleSubmit failed:", e);
      setError("Failed to generate report. Please try again.");
      setStage("quiz");
    }
  };

  // ── Retake ────────────────────────────────────────────────────────────────
  const handleRetake = () => {
    setReport(null);
    setAnswers([]);
    setQuestions([]);
    setCurrent(0);
    setError("");
    setStage("setup");
  };

  // ── After report, tutor can go to sessions to add courses ─────────────────
  const handleFinish = () => {
    if (role === "tutor") {
      router.push("/sessions");
    } else {
      router.push("/profile");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (stage === "setup") {
    return (
      <SkillSetupStep
        userId={currentUser?.id}
        supabase={supabase}
        existingSkills={skills}
        isTutor={role === "tutor"}
        hasPassedAssessment={hasPassedAssessment}
        onStart={({ skillName: sk, skillId: sId, level: lv }) =>
          kickoffGeneration(sk, sId, lv)
        }
      />
    );
  }

  if (stage === "generating") {
    return <GeneratingScreen skillName={skillName} />;
  }

  if (stage === "evaluating") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "#0e0c0a" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#1d9e75", borderRightColor: "rgba(29,158,117,0.3)" }} />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.2)" }}>
              <BarChart3 size={22} style={{ color: "#1d9e75" }} />
            </div>
          </div>
          <h2 className="text-lg font-medium" style={{ color: "#f5f0e8" }}>Generating your report</h2>
          <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>Analysing your {questions.length} answers…</p>
        </motion.div>
      </div>
    );
  }

  if (stage === "report" && report) {
    return (
      <TutorReport
        report={report}
        questions={questions}
        answers={answers}
        studentName={studentName}
        skillName={skillName}
        onRetake={handleRetake}
        onFinish={handleFinish}
      />
    );
  }

  // ── Quiz stage ─────────────────────────────────────────────────────────────
  const q = questions[current];
  const answeredCount = answers.filter((a) => a !== null).length;
  const isLast = current === questions.length - 1;

  return (
    <div className="min-h-screen" style={{ background: "#0e0c0a" }}>
      <ProgressBar current={current} total={questions.length} timeLeft={timeLeft} />

      {error && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(176,82,82,0.1)", color: "#b05252", border: "1px solid rgba(176,82,82,0.2)" }}>
            {error}
          </div>
        </div>
      )}

      {q && (
        <QuestionCard question={q} index={current} total={questions.length} selected={answers[current]} onSelect={selectAnswer} dir={dir} />
      )}

      {/* Navigation footer */}
      <div className="sticky bottom-0 px-4 py-4" style={{ background: "rgba(14,12,10,0.96)", backdropFilter: "blur(12px)", borderTop: "1px solid #1a1814" }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo(current - 1)} disabled={current === 0}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-all"
            style={{ border: "1px solid #2a2520", color: current === 0 ? "#2a2520" : "#6a6050" }}>
            <ChevronLeft size={14} /> Back
          </motion.button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === current ? 16 : 6, background: answers[i] !== null ? "#e8b84b" : i === current ? "#3a342c" : "#1a1814" }} />
            ))}
          </div>

          {isLast ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ background: "#e8b84b", color: "#0e0c0a" }}>
              <Trophy size={14} />
              Submit ({answeredCount}/{questions.length})
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo(current + 1)}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ background: answers[current] !== null ? "#e8b84b" : "#141210", color: answers[current] !== null ? "#0e0c0a" : "#3a342c" }}>
              Next <ChevronRight size={14} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
