"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/context/RoleContext";
import { useRouter } from "next/navigation";

const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#0e0c0a",
  card: "#141210",
  cardBorder: "#201e1a",
  cardHover: "#1a1714",
  amber: "#e8b84b",
  amberBg: "rgba(232,184,75,0.08)",
  amberBorder: "rgba(232,184,75,0.18)",
  green: "#1d9e75",
  greenBg: "rgba(29,158,117,0.08)",
  greenBorder: "rgba(29,158,117,0.2)",
  text: "#f5f0e8",
  textMuted: "#8a8070",
  textDim: "#5a5040",
  divider: "#1e1c18",
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const StarIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
const ClockIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const GridIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);
const CheckCircleIcon = ({ size = 16, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const FlameIcon = ({ size = 16, color = "#f97316" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);
const AwardIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
);
const BookIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
const UsersIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const LightningIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const ArrowRightIcon = ({ size = 14, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const ChevronRightIcon = ({ size = 14, color = T.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const BriefcaseIcon = ({ size = 16, color = T.amber }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);

// ── Primitives ────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, radius = 10, bg = "rgba(232,184,75,0.1)", color = T.amber }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.textDim, marginBottom: 10, textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

function ProgressBar({ pct, color = T.amber }) {
  return (
    <div style={{ height: 4, borderRadius: 4, background: T.divider, overflow: "hidden" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} style={{ height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ icon, num, label, sub, numColor = T.text, accent = T.amber }) {
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "18px 18px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}14`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 700, color: numColor, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{num}</p>
        <p style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>{label}</p>
      </div>
      {sub && <p style={{ fontSize: 11, color: T.textDim, borderTop: `1px solid ${T.divider}`, paddingTop: 8, lineHeight: 1.5 }}>{sub}</p>}
    </motion.div>
  );
}

// ── Weekly Activity Bar Chart ─────────────────────────────────────────────────
function WeeklyActivityChart({ sessions }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const counts = days.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIdx + i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    return (sessions || []).filter(s => { const sd = new Date(s.scheduled_at || s.created_at); return sd >= d && sd <= end; }).length;
  });
  const max = Math.max(...counts, 1);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Weekly Activity</p>
          <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Sessions this week</p>
        </div>
        <p style={{ fontSize: 22, fontWeight: 700, color: T.amber, fontVariantNumeric: "tabular-nums" }}>{total}</p>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
        {counts.map((count, i) => {
          const isToday = i === todayIdx;
          const barH = Math.max((count / max) * 100, 8);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 44 }}>
                <motion.div
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%", height: `${barH}%`, minHeight: 4, borderRadius: 3, background: isToday ? T.amber : count > 0 ? `${T.amber}35` : T.divider, transformOrigin: "bottom" }}
                />
              </div>
              <p style={{ fontSize: 9, color: isToday ? T.amber : T.textDim, fontWeight: isToday ? 700 : 400 }}>{days[i]}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
function QuickActions({ isStudent, router }) {
  const actions = isStudent
    ? [
        { label: "Find a Tutor", sub: "Browse skilled peers", icon: <UsersIcon />, href: "/explore" },
        { label: "Take Assessment", sub: "Test your knowledge", icon: <AwardIcon />, href: "/assessment" },
        { label: "My Sessions", sub: "View scheduled sessions", icon: <ClockIcon />, href: "/sessions" },
      ]
    : [
        { label: "My Courses", sub: "Manage your offerings", icon: <BookIcon />, href: "/sessions" },
        { label: "Find Internships", sub: "Opportunities for you", icon: <BriefcaseIcon />, href: "/internships" },
        { label: "View Profile", sub: "How others see you", icon: <UsersIcon />, href: "/profile" },
      ];

  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <SectionLabel>Quick Actions</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {actions.map((a, i) => (
          <button key={i} onClick={() => router.push(a.href)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.amberBg, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {a.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{a.label}</p>
              <p style={{ fontSize: 11, color: T.textMuted }}>{a.sub}</p>
            </div>
            <ChevronRightIcon />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Pro Tips ──────────────────────────────────────────────────────────────────
const STUDENT_TIPS = [
  { title: "Book sessions regularly", body: "Consistent weekly sessions accelerate skill retention 3x faster than binge learning." },
  { title: "Take assessments first", body: "Identify your baseline before starting — it helps tutors tailor sessions to you." },
  { title: "Review session notes", body: "Students who revisit notes within 24 hours retain 80% more material." },
  { title: "Ask specific questions", body: "Narrow, focused questions lead to deeper understanding than broad topic requests." },
];
const TUTOR_TIPS = [
  { title: "Update your availability", body: "Tutors who keep availability current get 2x more session requests from students." },
  { title: "Add a course description", body: "Detailed course outlines attract more motivated learners." },
  { title: "Respond quickly to requests", body: "Accepting or declining within 2 hours boosts your profile ranking." },
  { title: "Ask for reviews", body: "After every session, remind students to leave a review. It builds reputation fast." },
];

function ProTips({ isStudent }) {
  const tips = isStudent ? STUDENT_TIPS : TUTOR_TIPS;
  const [idx, setIdx] = useState(0);
  const tip = tips[idx % tips.length];
  return (
    <motion.div variants={fadeUp} style={{ background: "#110f0d", border: `1px solid ${T.amberBorder}`, borderRadius: 16, padding: "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -16, right: -16, width: 64, height: 64, borderRadius: "50%", background: `${T.amber}06` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: T.amberBg, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LightningIcon size={13} />
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.amber, textTransform: "uppercase" }}>Pro Tip</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6 }}>{tip.title}</p>
          <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>{tip.body}</p>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {tips.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx % tips.length ? 14 : 5, height: 5, borderRadius: 3, background: i === idx % tips.length ? T.amber : T.divider, border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
          ))}
        </div>
        <button onClick={() => setIdx(v => v + 1)} style={{ fontSize: 11, color: T.amber, background: "transparent", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          Next <ArrowRightIcon size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Next Session Card ─────────────────────────────────────────────────────────
function NextSessionCard({ session, isStudent }) {
  if (!session) return null;
  const name = isStudent ? session.providerName : session.studentName;
  const initials = isStudent ? session.providerInitials : session.studentInitials;
  const roleLabel = isStudent ? "Tutor" : "Student";
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.greenBorder}`, borderRadius: 16, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.green, textTransform: "uppercase" }}>Next Session</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Avatar initials={initials} size={42} radius={11} bg={T.greenBg} color={T.green} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{session.skillName}</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>with {name} · {roleLabel}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 10, background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
        <ClockIcon size={13} color={T.green} />
        <p style={{ fontSize: 12, color: T.green, fontWeight: 500 }}>{session.time}</p>
      </div>
    </motion.div>
  );
}

// ── Learning Path ─────────────────────────────────────────────────────────────
function LearningPathCard({ skills }) {
  if (!skills?.length) return null;
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <SectionLabel>Learning Path</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {skills.map((skill, i) => (
          <div key={skill.id || i} style={{ borderTop: i > 0 ? `1px solid ${T.divider}` : "none", paddingTop: i > 0 ? 16 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{skill.skill_name}</p>
              <p style={{ fontSize: 12, color: T.amber, fontWeight: 700 }}>{skill.pct}%</p>
            </div>
            <ProgressBar pct={skill.pct} />
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{skill.sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Suggested Tutor ───────────────────────────────────────────────────────────
function SuggestedTutorCard({ tutor, onRequest, requestStatus }) {
  if (!tutor) return null;
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <SectionLabel>Suggested Tutor</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Avatar initials={tutor.initials} size={42} radius={11} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{tutor.name}</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
            Teaches {tutor.skill} · <span style={{ color: T.amber }}>★ {tutor.rating}</span> · {tutor.sessions} sessions
          </p>
        </div>
      </div>
      <button
        onClick={() => onRequest?.(tutor)}
        disabled={requestStatus === "loading" || requestStatus === "success" || !tutor?.providerId || !tutor?.skillId}
        style={{ width: "100%", padding: "10px 0", borderRadius: 11, background: requestStatus === "success" ? T.greenBg : T.amberBg, border: `1px solid ${requestStatus === "success" ? T.greenBorder : T.amberBorder}`, color: requestStatus === "success" ? T.green : T.amber, fontSize: 13, fontWeight: 600, cursor: requestStatus === "loading" || requestStatus === "success" ? "default" : "pointer", opacity: requestStatus === "loading" ? 0.7 : 1, transition: "all 0.2s" }}
      >
        {requestStatus === "loading" ? "Requesting..." : requestStatus === "success" ? "Request Sent" : "Request Session"}
      </button>
      {requestStatus === "error" && <p style={{ fontSize: 11, color: "#e05252", marginTop: 8, textAlign: "center" }}>Could not send request. Try again.</p>}
    </motion.div>
  );
}

// ── Pending Requests (tutor) ──────────────────────────────────────────────────
function PendingRequestsCard({ requests, onAction }) {
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionLabel>Pending Requests</SectionLabel>
        {requests.length > 0 && (
          <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 20, padding: "2px 8px", fontSize: 11, color: T.amber, fontWeight: 700 }}>{requests.length}</div>
        )}
      </div>
      {requests.length === 0 ? (
        <p style={{ fontSize: 13, color: T.textMuted, textAlign: "center", padding: "12px 0" }}>No pending requests right now</p>
      ) : (
        <AnimatePresence mode="popLayout">
          {requests.map((r, i) => (
            <motion.div key={r.id} layout {...fadeUp} style={{ borderTop: i > 0 ? `1px solid ${T.divider}` : "none", paddingTop: i > 0 ? 12 : 0, marginTop: i > 0 ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar initials={r.initials} size={36} radius={9} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>Wants: {r.skillName}{r.details ? ` · ${r.details}` : ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onAction(r.id, "accepted")} style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: T.greenBg, border: `1px solid ${T.greenBorder}`, color: T.green, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                <button onClick={() => onAction(r.id, "rejected")} style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: T.card, border: `1px solid ${T.cardBorder}`, color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Decline</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// ── Teach Skills ──────────────────────────────────────────────────────────────
function TeachSkillsCard({ skills, rating, totalRatings }) {
  if (!skills?.length) return null;
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <SectionLabel>Your Courses</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {skills.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
            <BookIcon size={12} />
            <p style={{ fontSize: 12, color: T.amber, fontWeight: 500 }}>{s.skill_name}</p>
          </div>
        ))}
      </div>
      {rating && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 12, borderTop: `1px solid ${T.divider}` }}>
          <StarIcon size={13} />
          <p style={{ fontSize: 13, color: T.amber, fontWeight: 700 }}>{rating}</p>
          <p style={{ fontSize: 12, color: T.textMuted }}>avg from {totalRatings} review{totalRatings !== 1 ? "s" : ""}</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Availability ──────────────────────────────────────────────────────────────
function AvailabilityCard({ available, onToggle }) {
  return (
    <motion.div variants={fadeUp} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Accepting Students</p>
          <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Toggle off to pause new requests</p>
        </div>
        <button onClick={onToggle} style={{ width: 46, height: 26, borderRadius: 13, background: available ? T.green : T.divider, border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: available ? 23 : 3, transition: "left 0.25s" }} />
        </button>
      </div>
      <div style={{ padding: "8px 12px", borderRadius: 9, background: available ? T.greenBg : T.amberBg, border: `1px solid ${available ? T.greenBorder : T.amberBorder}` }}>
        <p style={{ fontSize: 12, color: available ? T.green : T.amber, fontWeight: 500 }}>
          {available ? "Visible to students looking for a tutor" : "Hidden from student search results"}
        </p>
      </div>
    </motion.div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const pulse = { background: `linear-gradient(90deg, ${T.card} 25%, #1e1c18 50%, ${T.card} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", borderRadius: 16 };
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ ...pulse, height: 96 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ ...pulse, height: 130 }} />
        <div style={{ ...pulse, height: 130 }} />
        <div style={{ ...pulse, height: 110 }} />
        <div style={{ ...pulse, height: 110 }} />
      </div>
    </>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({ data, allSessions, onSuggestedTutorRequest, requestStatus, router }) {
  const learningSkills = data?.learningSkills || [];
  const sessionsDone = data?.sessionsDone ?? 0;
  const avgScore = data?.avgScore || null;
  const streak = data?.streak ?? 0;
  const nextSession = data?.nextSession || null;
  const suggestedTutor = data?.suggestedTutor || null;
  const inProgressList = learningSkills.map(s => s.skill_name).join(", ") || "None yet";

  return (
    <motion.div variants={stagger} animate="animate" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        <MetricCard icon={<GridIcon />} num={learningSkills.length} label="Skills learning" sub={inProgressList} />
        <MetricCard icon={<CheckCircleIcon />} num={sessionsDone} label="Sessions done" accent={T.green} numColor={T.green} />
        <MetricCard icon={<AwardIcon />} num={avgScore ? `${avgScore}%` : "—"} label="Avg assessment" numColor={T.amber} />
        <MetricCard icon={<FlameIcon />} num={streak} label="Day streak" sub="Keep it up!" accent="#f97316" numColor="#f97316" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <WeeklyActivityChart sessions={allSessions} />
        <QuickActions isStudent router={router} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <NextSessionCard session={nextSession} isStudent />
        <ProTips isStudent />
      </div>

      {(learningSkills.length > 0 || suggestedTutor) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <LearningPathCard skills={learningSkills} />
          <SuggestedTutorCard tutor={suggestedTutor} onRequest={onSuggestedTutorRequest} requestStatus={requestStatus} />
        </div>
      )}
    </motion.div>
  );
}

// ── Tutor Dashboard ───────────────────────────────────────────────────────────
function TutorDashboard({ data, allSessions, onRequestAction, onAvailabilityToggle, router }) {
  const teachSkills = data?.teachSkills || [];
  const sessionsTaught = data?.sessionsTaught ?? 0;
  const avgRating = data?.avgRating || null;
  const totalRatings = data?.totalRatings ?? 0;
  const pendingRequests = data?.pendingRequests || [];
  const nextSession = data?.nextSession || null;
  const [available, setAvailable] = useState(data?.isAvailable ?? true);

  return (
    <motion.div variants={stagger} animate="animate" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        <MetricCard icon={<StarIcon />} num={avgRating || "—"} label="Avg rating" sub={`${totalRatings} review${totalRatings !== 1 ? "s" : ""}`} numColor={T.amber} />
        <MetricCard icon={<CheckCircleIcon />} num={sessionsTaught} label="Sessions taught" accent={T.green} numColor={T.green} />
        <MetricCard icon={<GridIcon />} num={teachSkills.length} label="Courses offered" sub={teachSkills.map(s => s.skill_name).join(", ") || "—"} />
        <MetricCard icon={<ClockIcon />} num={pendingRequests.length} label="Pending requests" sub="Awaiting response" numColor={pendingRequests.length > 0 ? T.amber : T.text} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <WeeklyActivityChart sessions={allSessions} />
        <QuickActions isStudent={false} router={router} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <NextSessionCard session={nextSession} isStudent={false} />
        <ProTips isStudent={false} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <PendingRequestsCard requests={pendingRequests} onAction={onRequestAction} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <TeachSkillsCard skills={teachSkills} rating={avgRating} totalRatings={totalRatings} />
          <AvailabilityCard available={available} onToggle={() => { const next = !available; setAvailable(next); onAvailabilityToggle?.(next); }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createSupabaseClient();
  const { role, setRole } = useRole();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [tutorData, setTutorData] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [requestStatus, setRequestStatus] = useState("idle");

  useEffect(() => {
    async function load() {
      try {
        const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authUser) return;

        const { data: userRow } = await supabase.from("profiles").select("id, name, department, role, is_available").eq("id", authUser.id).single();
        setUser(userRow);
        const uid = authUser.id;

        const { data: userSkillsRaw } = await supabase.from("user_skills").select("*, skill:skill_id(*)").eq("user_id", uid);
        const teachSkills = (userSkillsRaw || []).filter(us => us.type === "teach").map(us => ({ ...us.skill, skill_name: us.skill?.name, type: "teach" }));
        const learnSkills = (userSkillsRaw || []).filter(us => us.type === "learn").map(us => ({ ...us.skill, skill_name: us.skill?.name, type: "learn" }));

        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, status, scheduled_at, created_at, student:student_id(id, name), tutor:tutor_id(id, name), course:course_id(id, title, skill_name)")
          .or(`student_id.eq.${uid},tutor_id.eq.${uid}`)
          .order("scheduled_at", { ascending: true });

        const now = new Date();
        const allSess = sessions || [];
        setAllSessions(allSess);
        const completedSessions = allSess.filter(s => s.status === "completed");
        const upcomingAccepted = allSess.filter(s => s.status === "accepted" && s.scheduled_at && new Date(s.scheduled_at) > now);

        const { data: assessments } = await supabase.from("assessments").select("score, skill_name").eq("user_id", uid);
        const avgAssessment = assessments?.length ? Math.round(assessments.reduce((a, b) => a + (b.score || 0), 0) / assessments.length) : null;

        const pendingAsTutor = allSess.filter(s => s.status === "pending" && s.tutor?.id === uid).map(s => ({
          id: s.id,
          name: s.student?.name || "Student",
          initials: (s.student?.name || "ST").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          skillName: s.course?.skill_name || s.course?.title || "—",
        }));

        const nextAsStudent = upcomingAccepted.find(s => s.student?.id === uid);
        const nextAsTutor = upcomingAccepted.find(s => s.tutor?.id === uid);

        const formatTime = (iso) => {
          if (!iso) return "—";
          const d = new Date(iso);
          const isToday = d.toDateString() === new Date().toDateString();
          const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
          return isToday ? `${timeStr} today` : `${d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} · ${timeStr}`;
        };

        // Suggested tutor
        let suggestedTutor = null;
        if (learnSkills.length > 0) {
          const learnNames = learnSkills.map(s => s.skill_name).filter(Boolean);
          const { data: matchedSkills } = await supabase.from("user_skills").select("user_id, skill:skill_id(id, name)").eq("type", "teach").neq("user_id", uid).limit(5);
          const matched = (matchedSkills || []).find(ms => learnNames.some(ln => (ms.skill?.name || "").toLowerCase() === ln.toLowerCase()));
          if (matched) {
            const [{ data: tutorUser }, { data: tutorReviews }, { data: tutorSessions }] = await Promise.all([
              supabase.from("profiles").select("id, name").eq("id", matched.user_id).single(),
              supabase.from("reviews").select("score").eq("reviewee_id", matched.user_id),
              supabase.from("sessions").select("id").eq("tutor_id", matched.user_id).eq("status", "completed"),
            ]);
            const tRating = tutorReviews?.length ? (tutorReviews.reduce((a, b) => a + (b.score || 0), 0) / tutorReviews.length).toFixed(1) : "New";
            suggestedTutor = {
              providerId: matched.user_id, skillId: matched.skill?.id,
              name: tutorUser?.name || "Tutor",
              initials: (tutorUser?.name || "TU").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
              skill: matched.skill?.name || "Skill", rating: tRating, sessions: tutorSessions?.length || 0,
            };
          }
        }

        const { data: tutorReviewsAll } = await supabase.from("reviews").select("score").eq("reviewee_id", uid);
        const tutorAvgRating = tutorReviewsAll?.length ? (tutorReviewsAll.reduce((a, b) => a + (b.score || 0), 0) / tutorReviewsAll.length).toFixed(1) : null;

        const learnSkillsWithProgress = learnSkills.map(skill => {
          const done = completedSessions.filter(s => s.student?.id === uid && (s.course?.skill_name || "").toLowerCase() === (skill.skill_name || "").toLowerCase()).length;
          const pct = Math.min(done * 25, 100);
          return { ...skill, pct, sub: done === 0 ? "Just started" : `Level ${Math.min(Math.floor(done / 2) + 1, 4)} of 4 · ${done} session${done > 1 ? "s" : ""} completed` };
        }).slice(0, 3);

        setStudentData({
          sessionsDone: completedSessions.filter(s => s.student?.id === uid).length,
          avgScore: avgAssessment, streak: 0,
          learningSkills: learnSkillsWithProgress,
          nextSession: nextAsStudent ? { skillName: nextAsStudent.course?.skill_name || nextAsStudent.course?.title || "Session", providerName: nextAsStudent.tutor?.name || "Tutor", providerInitials: (nextAsStudent.tutor?.name || "TU").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), time: formatTime(nextAsStudent.scheduled_at) } : null,
          suggestedTutor,
        });

        setTutorData({
          avgRating: tutorAvgRating, totalRatings: tutorReviewsAll?.length || 0,
          sessionsTaught: completedSessions.filter(s => s.tutor?.id === uid).length,
          isAvailable: userRow?.is_available ?? true,
          teachSkills, pendingRequests: pendingAsTutor,
          nextSession: nextAsTutor ? { skillName: nextAsTutor.course?.skill_name || nextAsTutor.course?.title || "Session", studentName: nextAsTutor.student?.name || "Student", studentInitials: (nextAsTutor.student?.name || "ST").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), time: formatTime(nextAsTutor.scheduled_at) } : null,
        });

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase, role, setRole]);

  async function handleRequestAction(sessionId, newStatus) {
    setTutorData(prev => ({ ...prev, pendingRequests: prev.pendingRequests.filter(r => r.id !== sessionId) }));
    const { error } = await supabase.from("sessions").update({ status: newStatus }).eq("id", sessionId);
    if (error) console.error("Request update error:", error);
  }

  async function handleSuggestedTutorRequest(suggestedTutor) {
    if (!user?.id || !suggestedTutor?.providerId || !suggestedTutor?.skillId) return;
    if (requestStatus === "loading" || requestStatus === "success") return;
    setRequestStatus("loading");
    const { data: existing } = await supabase.from("sessions").select("id").eq("student_id", user.id).eq("tutor_id", suggestedTutor.providerId).in("status", ["pending", "accepted"]).limit(1);
    if (existing?.length) { setRequestStatus("success"); return; }
    const { error } = await supabase.from("sessions").insert({ student_id: user.id, tutor_id: suggestedTutor.providerId, status: "pending" });
    setRequestStatus(error ? "error" : "success");
  }

  async function handleAvailabilityToggle(newValue) {
    if (!user?.id) return;
    await supabase.from("profiles").update({ is_available: newValue }).eq("id", user.id);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";
  const isStudent = role === "student";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 0 48px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <motion.div {...fadeUp} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{greeting}, {firstName}</h1>
            <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
              {isStudent ? "Here's your learning overview" : "Your teaching overview for today"}
            </p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("sb_open_role_switcher"))}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, background: T.amberBg, border: `1px solid ${T.amberBorder}`, cursor: "pointer", fontSize: 12, color: T.amber, fontWeight: 600, flexShrink: 0 }}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.amber }} />
            {isStudent ? "Student" : "Tutor"}
            <span style={{ color: T.textMuted, fontWeight: 400 }}>· Switch</span>
          </button>
        </motion.div>

        {loading ? <LoadingSkeleton /> : isStudent ? (
          <StudentDashboard data={studentData} allSessions={allSessions} onSuggestedTutorRequest={handleSuggestedTutorRequest} requestStatus={requestStatus} router={router} />
        ) : (
          <TutorDashboard data={tutorData} allSessions={allSessions} onRequestAction={handleRequestAction} onAvailabilityToggle={handleAvailabilityToggle} router={router} />
        )}
      </div>
    </div>
  );
}
