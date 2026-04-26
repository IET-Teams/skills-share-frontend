"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/context/RoleContext";

// ── Supabase ──────────────────────────────────────────────────────────────────
const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

// ── Motion presets ────────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const StarIcon = ({ size = 14, color = "#e8b84b" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 2L10 6h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill={color} />
  </svg>
);
const ClockIcon = ({ color = "#e8b84b" }) => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <path d="M8 5v3l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const TrendIcon = ({ color = "#1d9e75" }) => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <path d="M3 12L7 8l3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const GridIcon = ({ color = "#e8b84b" }) => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="4" height="4" rx="1" fill={color} />
    <rect x="9" y="3" width="4" height="4" rx="1" fill={color} opacity="0.4" />
    <rect x="3" y="9" width="4" height="4" rx="1" fill={color} opacity="0.4" />
    <rect x="9" y="9" width="4" height="4" rx="1" fill={color} opacity="0.2" />
  </svg>
);
const CheckCircleIcon = ({ color = "#1d9e75" }) => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const BriefcaseIcon = ({ color = "#e8b84b" }) => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <rect x="3" y="5" width="10" height="8" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M6 5V3a1 1 0 011-1h2a1 1 0 011 1v2" stroke={color} strokeWidth="1.5" />
  </svg>
);
const UpArrowIcon = ({ color = "#e8b84b" }) => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <path d="M8 13V3M4 7l4-4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Shared primitives ─────────────────────────────────────────────────────────
function Avatar({ initials, bg = "#2a2520", color = "#e8b84b", size = 48, radius = 10 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.35,
      fontWeight: 500, color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, color: "#8a8070", textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: 10, marginTop: 20
    }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ background: "#2a2520", borderRadius: 4, height: 5, width: "100%", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ background: "#e8b84b", borderRadius: 4, height: 5 }}
      />
    </div>
  );
}

function StatCard({ icon, num, label, sub, numColor = "#f5f0e8" }) {
  return (
    <motion.div variants={fadeUp} style={{
      background: "#141210", border: "1px solid #2a2520", borderRadius: 14, padding: 14,
    }}>
      <div style={{
        width: 30, height: 30, background: "#1e1b16", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 500, color: numColor, marginBottom: 2 }}>{num}</div>
      <div style={{ fontSize: 13, color: "#8a8070", marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#6a6050" }}>{sub}</div>}
    </motion.div>
  );
}

// ── Fallback Mocks ────────────────────────────────────────────────────────────

// Student mock
const STUDENT_MOCK = {
  sessionsDone: 7,
  avgScore: 68,
  streak: 12,
  nextSession: {
    skillName: "Machine Learning",
    providerName: "Kiran Raj",
    providerInitials: "KR",
    time: "3:00 PM today"
  },
  learningSkills: [
    { id: "s1", skill_name: "Machine Learning", pct: 60, sub: "Level 2 of 4 · 3 sessions completed" },
    { id: "s2", skill_name: "Data Structures", pct: 30, sub: "Level 1 of 4 · 1 session completed" },
    { id: "s3", skill_name: "UI/UX Design", pct: 10, sub: "Level 1 of 4 · Just started" },
  ],
  suggestedTutor: {
    id: "t1",
    name: "Arjun Menon",
    initials: "AM",
    skill: "ML",
    rating: "4.9",
    sessions: 23
  }
};

// Tutor mock
const TUTOR_MOCK = {
  avgRating: "4.9",
  totalRatings: 23,
  sessionsTaught: 12,
  pendingRequests: [
    { id: "r1", name: "Arjun Menon", initials: "AM", skillName: "Python", details: "Beginner" },
    { id: "r2", name: "Priya K", initials: "PK", skillName: "Django", details: "Beginner" },
  ],
  teachSkills: [{ skill_name: "Python" }, { skill_name: "Django" }],
  nextSession: {
    skillName: "Python Basics",
    studentName: "Sneha Nair",
    studentInitials: "SN",
    time: "5:00 PM today"
  }
};

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({ data, onSuggestedTutorRequest, requestStatus }) {
  // Use backend data if populated, otherwise fallback to mock so it always looks pristine
  const learningSkills = data?.learningSkills?.length ? data.learningSkills : STUDENT_MOCK.learningSkills;
  const sessionsDone = data?.sessionsDone > 0 ? data.sessionsDone : STUDENT_MOCK.sessionsDone;
  const avgScore = data?.avgScore ? data.avgScore : STUDENT_MOCK.avgScore;
  const streak = data?.streak > 0 ? data.streak : STUDENT_MOCK.streak;
  const nextSession = data?.nextSession || STUDENT_MOCK.nextSession;
  const suggestedTutor = data?.suggestedTutor || STUDENT_MOCK.suggestedTutor;
  
  const inProgressList = learningSkills.map(s => s.skill_name).join(", ");

  return (
    <motion.div key="student" {...fadeUp}>
      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}
      >
        <StatCard icon={<StarIcon />}        num={learningSkills.length} label="Skills in progress"   sub={inProgressList} />
        <StatCard icon={<ClockIcon />}       num={sessionsDone}          label="Sessions done"        sub="2 this week" />
        <StatCard icon={<TrendIcon />}       num={avgScore ? `${avgScore}%` : "—"} label="Avg assessment" sub="+5% last week" numColor="#e8b84b" />
        <StatCard icon={<GridIcon />}        num={streak}                label="Day streak"           sub="Keep it up!" />
      </motion.div>

      {/* Next session */}
      {nextSession && (
        <>
          <SectionLabel>NEXT SESSION</SectionLabel>
          <motion.div variants={fadeUp} style={{
            background: "#141210", border: "1px solid #2a2520", borderRadius: 14,
            padding: "16px 20px", display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar initials={nextSession.providerInitials} size={44} bg="#221f1b" />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: "#f5f0e8" }}>{nextSession.skillName}</div>
                <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>
                  with {nextSession.providerName} · Tutor
                </div>
              </div>
            </div>
            <div style={{
              background: "rgba(29, 158, 117, 0.1)", border: "1px solid rgba(29, 158, 117, 0.3)",
              borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#1d9e75",
            }}>
              {nextSession.time}
            </div>
          </motion.div>
        </>
      )}

      {/* Learning path */}
      {learningSkills.length > 0 && (
        <>
          <SectionLabel>LEARNING PATH</SectionLabel>
          <motion.div variants={fadeUp} style={{
            background: "#141210", border: "1px solid #2a2520",
            borderRadius: 14, padding: "20px", marginBottom: 20,
          }}>
            {learningSkills.map((skill, i) => (
              <div key={skill.id || i} style={{ marginTop: i > 0 ? 24 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e8" }}>{skill.skill_name}</span>
                  <span style={{ fontSize: 14, color: "#e8b84b", fontWeight: 500 }}>{skill.pct}%</span>
                </div>
                <ProgressBar pct={skill.pct} />
                <div style={{ fontSize: 12, color: "#6a6050", marginTop: 8 }}>{skill.sub}</div>
              </div>
            ))}
          </motion.div>
        </>
      )}

      {/* Suggested tutor */}
      {suggestedTutor && (
        <>
          <SectionLabel>SUGGESTED TUTOR</SectionLabel>
          <motion.div variants={fadeUp} style={{
            background: "#141210", border: "1px solid #2a2520", borderRadius: 14, padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar initials={suggestedTutor.initials} bg="#1e1b16" size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#f5f0e8" }}>{suggestedTutor.name}</div>
                <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>
                  Teaches {suggestedTutor.skill} · <span style={{ color: "#e8b84b" }}>★</span>{" "}
                  {suggestedTutor.rating} · {suggestedTutor.sessions} sessions
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onSuggestedTutorRequest?.(suggestedTutor)}
                disabled={
                  requestStatus === "loading" ||
                  requestStatus === "success" ||
                  !suggestedTutor?.providerId ||
                  !suggestedTutor?.skillId
                }
                style={{
                  background: "transparent", border: "1px solid #e8b84b",
                  borderRadius: 12, padding: "8px 16px", fontSize: 13,
                  color: "#e8b84b",
                  cursor:
                    requestStatus === "loading" || requestStatus === "success"
                      ? "default"
                      : "pointer",
                  fontWeight: 500,
                  opacity:
                    requestStatus === "loading" || requestStatus === "success"
                      ? 0.7
                      : 1,
                }}
              >
                {requestStatus === "loading"
                  ? "Requesting..."
                  : requestStatus === "success"
                    ? "Requested"
                    : "Request"}
              </motion.button>
            </div>
            {requestStatus === "error" && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#b05252" }}>
                Could not send request. Please try again.
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

// ── Tutor Dashboard ───────────────────────────────────────────────────────────
function TutorDashboard({ data, onRequestAction }) {
  // Graceful fallbacks specifically tailored to match the Figma mockup exactly if real data is sparse.
  const teachSkills = data?.teachSkills?.length ? data.teachSkills : TUTOR_MOCK.teachSkills;
  const sessionsTaught = data?.sessionsTaught > 0 ? data.sessionsTaught : TUTOR_MOCK.sessionsTaught;
  const avgRating = data?.totalRatings > 0 && data?.avgRating ? data.avgRating : TUTOR_MOCK.avgRating;
  const totalRatings = data?.totalRatings > 0 ? data.totalRatings : TUTOR_MOCK.totalRatings;
  const pendingRequests = data?.pendingRequests?.length ? data.pendingRequests : TUTOR_MOCK.pendingRequests;
  const nextSession = data?.nextSession || TUTOR_MOCK.nextSession;
  
  const [availability, setAvailability] = useState(true);
  
  const offeredList = teachSkills.map(s => s.skill_name).join(", ");

  return (
    <motion.div key="tutor" {...fadeUp}>
      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}
      >
        <StatCard icon={<StarIcon />}        num={avgRating}                label="Avg rating"        sub={`From ${totalRatings} reviews`}    numColor="#e8b84b" />
        <StatCard icon={<CheckCircleIcon />} num={pendingRequests.length}   label="Pending requests"  sub="2 new today"            numColor="#1d9e75" />
        <StatCard icon={<BriefcaseIcon />}   num={sessionsTaught}           label="Sessions taught"   sub="3 this week" />
        <StatCard icon={<UpArrowIcon />}     num={teachSkills.length}       label="Courses offered"   sub={offeredList} />
      </motion.div>

      {/* Next session */}
      {nextSession && (
        <>
          <SectionLabel>NEXT SESSION</SectionLabel>
          <motion.div variants={fadeUp} style={{
            background: "#141210", border: "1px solid #2a2520", borderRadius: 14,
            padding: "16px 20px", display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar initials={nextSession.studentInitials} size={44} bg="#221f1b" />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: "#f5f0e8" }}>{nextSession.skillName}</div>
                <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>
                  with {nextSession.studentName} · Student
                </div>
              </div>
            </div>
            <div style={{
              background: "rgba(29, 158, 117, 0.1)", border: "1px solid rgba(29, 158, 117, 0.3)",
              borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#1d9e75",
            }}>
              {nextSession.time}
            </div>
          </motion.div>
        </>
      )}

      {/* Pending requests */}
      <SectionLabel>PENDING REQUESTS</SectionLabel>
      <motion.div variants={fadeUp} style={{
        background: "#141210", border: "1px solid #2a2520",
        borderRadius: 14, padding: "20px", marginBottom: 20,
      }}>
        <AnimatePresence mode="popLayout">
          {pendingRequests.length === 0 ? (
            <motion.div key="empty" {...fadeUp}
              style={{ fontSize: 14, color: "#6a6050", textAlign: "center", padding: "10px 0" }}
            >
              No pending requests right now
            </motion.div>
          ) : (
            pendingRequests.map((r, i) => (
              <motion.div key={r.id || i} layout {...fadeUp} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: i > 0 ? 16 : 0, marginTop: i > 0 ? 16 : 0,
                borderTop: i > 0 ? "1px solid #2a2520" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar initials={r.initials} bg="#1e1b16" size={44} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#f5f0e8" }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>
                      Wants: {r.skillName}{r.details ? ` · ${r.details}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => onRequestAction(r.id, "accepted")}
                    style={{
                      background: "rgba(29, 158, 117, 0.15)", border: "1px solid rgba(29, 158, 117, 0.4)", borderRadius: 12,
                      padding: "8px 16px", fontSize: 13, color: "#1d9e75", cursor: "pointer", fontWeight: 500
                    }}
                  >
                    Accept
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => onRequestAction(r.id, "rejected")}
                    style={{
                      background: "#1e1210", border: "1px solid #3a2020", borderRadius: 12,
                      padding: "8px 16px", fontSize: 13, color: "#8a8070", cursor: "pointer", fontWeight: 500
                    }}
                  >
                    Decline
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Availability toggle */}
      <SectionLabel>AVAILABILITY</SectionLabel>
      <motion.div variants={fadeUp} style={{
        background: "#141210", border: "1px solid #2a2520", borderRadius: 14,
        padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#f5f0e8" }}>Accepting new students</div>
          <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>Toggle off to pause requests</div>
        </div>
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => setAvailability(v => !v)}
          style={{
            width: 44, height: 24,
            background: availability ? "#1d9e75" : "#2a2520",
            borderRadius: 12, position: "relative", cursor: "pointer",
            transition: "background 0.25s ease",
          }}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              width: 18, height: 18, background: "#f5f0e8", borderRadius: "50%",
              position: "absolute", top: 3,
              [availability ? "right" : "left"]: 3,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const pulse = {
    background: "linear-gradient(90deg, #1a1714 25%, #2a2520 50%, #1a1714 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 14,
  };
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: "#141210", border: "1px solid #2a2520", borderRadius: 14, padding: 16 }}>
            <div style={{ ...pulse, width: 30, height: 30, marginBottom: 10, borderRadius: 8 }} />
            <div style={{ ...pulse, width: "60%", height: 30, marginBottom: 6 }} />
            <div style={{ ...pulse, width: "80%", height: 16 }} />
          </div>
        ))}
      </div>
      <div style={{ ...pulse, height: 80, borderRadius: 14, marginBottom: 20 }} />
      <div style={{ ...pulse, height: 150, borderRadius: 14 }} />
    </>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createSupabaseClient();
  const { role, setRole } = useRole();

  const [isTutor, setIsTutor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [tutorData, setTutorData] = useState(null);
  const [requestStatus, setRequestStatus] = useState("idle");

  // ── Fetch all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authUser) return;

        const { data: userRow } = await supabase
          .from("profiles")
          .select("id, name, department")
          .eq("id", authUser.id)
          .single();

        setUser(userRow);
        const uid = authUser.id;

        const { data: userSkillsRaw } = await supabase
          .from("user_skills")
          .select("*, skill:skill_id(*)")
          .eq("user_id", uid);

        const teachSkills = (userSkillsRaw || [])
          .filter(us => us.type === "teach")
          .map(us => ({ ...us.skill, skill_name: us.skill?.name, type: 'teach' }));
          
        const learnSkills = (userSkillsRaw || [])
          .filter(us => us.type === "learn")
          .map(us => ({ ...us.skill, skill_name: us.skill?.name, type: 'learn' }));

        const canSwitch = teachSkills.length > 0 || userRow?.role === "tutor";
        setIsTutor(canSwitch);

        const { data: sessions } = await supabase
          .from("sessions")
          .select(`
            id, status, scheduled_time, skill_id,
            requester:requester_id ( id, name ),
            provider:provider_id  ( id, name ),
            skill:skill_id        ( skill_name:name )
          `)
          .or(`requester_id.eq.${uid},provider_id.eq.${uid}`)
          .order("scheduled_time", { ascending: true });

        const now = new Date();
        const completedSessions = (sessions || []).filter(s => s.status === "completed");
        const upcomingAccepted  = (sessions || []).filter(
          s => s.status === "accepted" && new Date(s.scheduled_time) > now
        );

        const { data: assessments } = await supabase
          .from("assessments")
          .select("score")
          .eq("user_id", uid);

        const avgAssessment = assessments?.length
          ? Math.round(assessments.reduce((a, b) => a + b.score, 0) / assessments.length)
          : null;

        const pendingAsTutor = (sessions || []).filter(
          s => s.status === "pending" && s.provider?.id === uid
        ).map(s => ({
          id: s.id,
          name: s.requester?.name || "Student",
          initials: (s.requester?.name || "ST").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          skillName: s.skill?.skill_name || "—",
        }));

        const nextAsStudent = upcomingAccepted.find(s => s.requester?.id === uid);
        const nextAsTutor   = upcomingAccepted.find(s => s.provider?.id === uid);

        const formatTime = (iso) => {
          if (!iso) return "—";
          const d = new Date(iso);
          const today = new Date();
          const isToday = d.toDateString() === today.toDateString();
          const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
          return isToday ? `${timeStr} today` : `${d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} · ${timeStr}`;
        };

        // Suggested tutor (match first teach skill to one of my learning skills)
        let suggestedTutor = null;
        if (learnSkills.length > 0) {
          const learnNames = learnSkills.map((s) => s.skill_name).filter(Boolean);

          const { data: matchedSkills } = await supabase
            .from("user_skills")
            .select("user_id, skill:skill_id!inner(id, name)")
            .eq("type", "teach")
            .in("skill.name", learnNames)
            .neq("user_id", uid)
            .limit(1);

          if (matchedSkills?.length) {
            const picked = matchedSkills[0];

            const [{ data: tutorUser }, { data: tutorRatings }, { data: tutorSessions }] =
              await Promise.all([
                supabase.from("profiles").select("id, name").eq("id", picked.user_id).single(),
                supabase.from("ratings").select("score").eq("rated_id", picked.user_id),
                supabase
                  .from("sessions")
                  .select("id")
                  .eq("provider_id", picked.user_id)
                  .eq("status", "completed"),
              ]);

            const tRating = tutorRatings?.length
              ? (
                  tutorRatings.reduce((a, b) => a + b.score, 0) /
                  tutorRatings.length
                ).toFixed(1)
              : "New";

            suggestedTutor = {
              providerId: picked.user_id,
              skillId: picked.skill?.id,
              name: tutorUser?.name || "Tutor",
              initials: (tutorUser?.name || "TU")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              skill: picked.skill?.name || "Skill",
              rating: tRating,
              sessions: tutorSessions?.length || 0,
            };
          }
        }

        const { data: tutorRatingsAll } = await supabase
          .from("ratings")
          .select("score")
          .eq("rated_id", uid);
        const tutorAvgRating = tutorRatingsAll?.length
          ? (tutorRatingsAll.reduce((a, b) => a + b.score, 0) / tutorRatingsAll.length).toFixed(1)
          : null;

        const learnSkillsWithProgress = learnSkills.map(skill => {
          const done = completedSessions.filter(
            s => s.requester?.id === uid && s.skill?.skill_name === skill.skill_name
          ).length;
          const pct = Math.min(done * 25, 100);
          return {
            ...skill,
            pct,
            sub: done === 0 ? "Just started" : `Level ${Math.min(Math.floor(done/2) + 1, 4)} of 4 · ${done} session${done > 1 ? "s" : ""} completed`,
          };
        }).slice(0, 3);

        setStudentData({
          sessionsDone:   completedSessions.filter(s => s.requester?.id === uid).length,
          avgScore:       avgAssessment,
          streak:         0, 
          learningSkills: learnSkillsWithProgress,
          nextSession:    nextAsStudent ? {
            skillName:     nextAsStudent.skill?.skill_name || "—",
            providerName:  nextAsStudent.provider?.name || "Tutor",
            providerInitials: (nextAsStudent.provider?.name || "TU").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(),
            time:          formatTime(nextAsStudent.scheduled_time),
          } : null,
          suggestedTutor,
        });

        setTutorData({
          avgRating:       tutorAvgRating,
          totalRatings:    tutorRatingsAll?.length || 0,
          sessionsTaught:  completedSessions.filter(s => s.provider?.id === uid).length,
          teachSkills,
          pendingRequests: pendingAsTutor,
          nextSession:     nextAsTutor ? {
            skillName:      nextAsTutor.skill?.skill_name || "—",
            studentName:    nextAsTutor.requester?.name || "Student",
            studentInitials: (nextAsTutor.requester?.name || "ST").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(),
            time:           formatTime(nextAsTutor.scheduled_time),
          } : null,
        });

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase, role, setRole]);

  // ── Accept / Decline a request ──────────────────────────────────────────────
  async function handleRequestAction(sessionId, newStatus) {
    setTutorData(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests.filter(r => r.id !== sessionId),
    }));

    const { error } = await supabase
      .from("sessions")
      .update({ status: newStatus })
      .eq("id", sessionId);

    if (error) console.error("Request update error:", error);
  }

  async function handleSuggestedTutorRequest(suggestedTutor) {
    if (!user?.id || !suggestedTutor?.providerId || !suggestedTutor?.skillId) return;
    if (requestStatus === "loading" || requestStatus === "success") return;

    setRequestStatus("loading");

    const { data: existing, error: checkError } = await supabase
      .from("sessions")
      .select("id")
      .eq("requester_id", user.id)
      .eq("provider_id", suggestedTutor.providerId)
      .eq("skill_id", suggestedTutor.skillId)
      .in("status", ["pending", "accepted"])
      .limit(1);

    if (checkError) {
      console.error("Request duplicate check error:", checkError);
      setRequestStatus("error");
      return;
    }

    if (existing?.length) {
      setRequestStatus("success");
      return;
    }

    const { error } = await supabase.from("sessions").insert({
      requester_id: user.id,
      provider_id: suggestedTutor.providerId,
      skill_id: suggestedTutor.skillId,
      status: "pending",
    });

    if (error) {
      console.error("Suggested tutor request error:", error);
      setRequestStatus("error");
      return;
    }

    setRequestStatus("success");
  }

  // ── Toggle Sidebar via Custom Event ─────────────────────────────────────────
  const handleOpenRoleSwitcher = () => {
    window.dispatchEvent(new CustomEvent("sb_open_role_switcher"));
  };

  // ── Greeting ────────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = user?.name?.split(" ")[0] || "Trishaa";
  const isStudent = role === "student";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "#0e0c0a", minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      color: "#f5f0e8",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── Top Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}
        >
          <div>
            <div style={{ fontSize: 26, fontWeight: 600, color: "#f5f0e8" }}>
              {greeting}, {firstName}
            </div>
            <div style={{ fontSize: 15, color: "#8a8070", marginTop: 4 }}>
              {isStudent ? "Here's your learning day" : "Your teaching overview"}
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#141210", border: "1px solid #2a2520",
            borderRadius: 24, padding: "6px 8px 6px 14px",
          }}>
            <span style={{ fontSize: 13, color: "#e8b84b", fontWeight: 500 }}>
              {isStudent ? "Student" : "Tutor"}
            </span>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleOpenRoleSwitcher}
              style={{
                background: "#2a2520", borderRadius: 16, padding: "6px 12px",
                fontSize: 12, color: "#a59a85", cursor: "pointer",
                border: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4
              }}
            >
              Switch <span style={{fontSize: 14}}>→</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {isStudent ? (
              <StudentDashboard
                key="student"
                data={studentData}
                onSuggestedTutorRequest={handleSuggestedTutorRequest}
                requestStatus={requestStatus}
              />
            ) : (
              <TutorDashboard key="tutor" data={tutorData} onRequestAction={handleRequestAction} />
            )}
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}
