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
  User, GraduationCap, Zap, Trophy, CircleDot, Circle,
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
function TutorReport({ report, questions, answers, studentName, skillName, onRetake }) {
  const scoreColor = getScoreColor(report.score);
  const scoreLabel = getScoreLabel(report.score);
  const correctCount = answers.filter((a, i) => a === questions[i].correct).length;

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
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 opacity-8"
              style={{ background: "radial-gradient(circle, #e8b84b 0%, transparent 70%)" }} />
            <div className="mb-2 flex items-center gap-2">
              <Zap size={13} style={{ color: "#e8b84b" }} />
              <span className="text-xs font-medium" style={{ color: "#e8b84b" }}>Tutor's Note</span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: "#8a8070" }}>"{report.tutorNote}"</p>
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
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
            style={{ background: "#e8b84b", color: "#0e0c0a" }}>
            <Send size={13} /> Share report
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// Skill selector when no skill is given
function AssessmentSetup({ skills, onStart, role }) {
  const [selected, setSelected] = useState(null);
  const [level, setLevel] = useState("intermediate");

  // Sort skills so role-relevant ones appear first
  const sortedSkills = [...skills].sort((a, b) => {
    const isATeach = a.type === "teach";
    const isBTeach = b.type === "teach";
    if (role === "tutor") return isATeach === isBTeach ? 0 : isATeach ? -1 : 1;
    return isATeach === isBTeach ? 0 : isATeach ? 1 : -1;
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: "#0e0c0a" }}>
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.2)" }}>
            <Brain size={24} style={{ color: "#e8b84b" }} />
          </div>
          <h1 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>Verify your {role === 'tutor' ? 'teaching' : 'skills'}</h1>
          <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>Test your knowledge and earn proficiency badges.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border px-6 py-6 space-y-5" style={{ background: "#0a0908", borderColor: "#2a2520" }}>

          {/* Skill picker */}
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: "#8a8070" }}>Select a skill to verify</label>
            {sortedSkills.length === 0 ? (
              <p className="text-sm italic" style={{ color: "#3a342c" }}>No skills found. Add some to your profile first.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sortedSkills.map((s) => {
                  const isTeach = s.type === "teach";
                  const accent = isTeach ? "#e8b84b" : "#1d9e75";
                  const accentBg = isTeach ? "rgba(232,184,75,0.1)" : "rgba(29,158,117,0.1)";

                  return (
                    <button key={s.id} onClick={() => setSelected(s)}
                      className="w-full rounded-xl border p-3 text-left transition-all"
                      style={{
                        background: selected?.id === s.id ? "rgba(255,255,255,0.03)" : "#141210",
                        borderColor: selected?.id === s.id ? accent : "#2a2520",
                      }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: selected?.id === s.id ? accent : "#f5f0e8" }}>{s.name}</p>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: accentBg, color: accent }}>
                          {isTeach ? "Teaching" : "Learning"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Difficulty level */}
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: "#8a8070" }}>Difficulty level</label>
            <div className="flex gap-2">
              {["beginner", "intermediate", "advanced"].map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className="flex-1 rounded-xl py-2 text-xs font-medium capitalize transition-all"
                  style={{
                    background: level === l ? "#f5f0e8" : "#141210",
                    color: level === l ? "#0e0c0a" : "#6a6050",
                    border: `1px solid ${level === l ? "#f5f0e8" : "#2a2520"}`,
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => onStart({ skillName: selected?.name, level })}
            disabled={!selected}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
            style={{ background: "#e8b84b", color: "#0e0c0a", opacity: (!selected) ? 0.4 : 1 }}>
            <Sparkles size={14} /> Start AI Assessment
          </motion.button>
        </motion.div>
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
  const [stage, setStage]       = useState(skillParam ? "generating" : "setup");
  const [currentUser, setCurrentUser] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [skills,      setSkills]      = useState([]);
  const [skillName,   setSkillName]   = useState(skillParam || "");
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
      if (!user) return;
      setCurrentUser(user);

      const { data: profileData } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      setStudentName(profileData?.name || user.email?.split("@")[0] || "Student");

      // Fetch user skills (teaching & learning)
      const { data: userSkillsData } = await supabase
        .from("user_skills")
        .select("*, skill:skill_id(*)")
        .eq("user_id", user.id);

      const fetchedSkills = (userSkillsData || []).map(us => ({ ...us.skill, type: us.type })).filter(s => s.name);
      setSkills(fetchedSkills);

      // Auto-start if skill param given
      if (skillParam && fetchedSkills) {
        const matchingSkill = fetchedSkills.find((s) => s.name === skillParam);
        if (matchingSkill) {
          setSkillName(matchingSkill.name);
          kickoffGeneration(matchingSkill.name, "intermediate");
        }
      }
    }
    init();
  }, [supabase, skillParam]);

  // ── Question generation ────────────────────────────────────────────────────
  const kickoffGeneration = async (skill, lvl) => {
  setStage("generating");
  setSkillName(skill);
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
    
    if (!qs?.length) {
      throw new Error("No questions generated");
    }

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
      await supabase.from("assessments").insert({
        user_id: currentUser.id,
        skill_name: skillName,
        score: r.score,
        report: r,
      });
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

  // ─── Render ───────────────────────────────────────────────────────────────

  if (stage === "setup") {
    return <AssessmentSetup role={role} skills={skills} onStart={({ skillName: sk, level: lv }) => kickoffGeneration(sk, lv)} />;
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
    return <TutorReport report={report} questions={questions} answers={answers} studentName={studentName} skillName={skillName} onRetake={handleRetake} />;
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
