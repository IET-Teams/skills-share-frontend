"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  ChevronRight,
  Zap,
  Bell,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{
        background: "#141210",
        borderColor: "#2a2520",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "rgba(232,184,75,0.08)" }}
        >
          <Icon size={18} style={{ color: "#e8b84b" }} />
        </div>
        {accent && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(29,158,117,0.12)",
              color: "#1d9e75",
            }}
          >
            {accent}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-medium" style={{ color: "#f5f0e8" }}>
        {value}
      </p>
      <p className="mt-0.5 text-sm" style={{ color: "#8a8070" }}>
        {label}
      </p>
      {sub && (
        <p className="mt-1 text-xs" style={{ color: "#6a6050" }}>
          {sub}
        </p>
      )}
      {/* subtle corner glow */}
      <div
        className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #e8b84b 0%, transparent 50%)",
        }}
      />
    </motion.div>
  );
}

// ─── Session Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    pending: { color: "#e8b84b", bg: "rgba(232,184,75,0.1)", label: "Pending" },
    accepted: {
      color: "#1d9e75",
      bg: "rgba(29,158,117,0.1)",
      label: "Accepted",
    },
    completed: {
      color: "#6a6050",
      bg: "rgba(106,96,80,0.15)",
      label: "Completed",
    },
    rejected: {
      color: "#b05252",
      bg: "rgba(176,82,82,0.1)",
      label: "Rejected",
    },
  };
  const c = config[status] || config.pending;
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

// ─── Session Row ──────────────────────────────────────────────────────────────
function SessionRow({ session, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
      style={{ borderBottom: "1px solid #1a1814" }}
      whileHover={{ background: "rgba(232,184,75,0.03)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium"
          style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b" }}
        >
          {session.avatar}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {session.name}
          </p>
          <p className="text-xs" style={{ color: "#6a6050" }}>
            {session.skill} · {session.time}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={session.status} />
        {session.status === "pending" && (
          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{ background: "rgba(29,158,117,0.12)" }}
            >
              <CheckCircle2 size={14} style={{ color: "#1d9e75" }} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{ background: "rgba(176,82,82,0.1)" }}
            >
              <XCircle size={14} style={{ color: "#b05252" }} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Suggested User Card ──────────────────────────────────────────────────────
function SuggestedUserCard({ user, index }) {
  const [requested, setRequested] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border p-4"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium"
          style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
        >
          {user.avatar}
        </div>
        <div className="flex items-center gap-1">
          <Star size={11} style={{ color: "#e8b84b" }} fill="#e8b84b" />
          <span className="text-xs" style={{ color: "#8a8070" }}>
            {user.rating}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium" style={{ color: "#f5f0e8" }}>
        {user.name}
      </p>
      <p className="text-xs" style={{ color: "#6a6050" }}>
        {user.department}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {user.skills.map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(232,184,75,0.07)",
              color: "#8a8070",
              border: "1px solid #2a2520",
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setRequested(true)}
        className="mt-3 w-full rounded-xl py-2 text-xs font-medium transition-all"
        style={
          requested
            ? { background: "rgba(29,158,117,0.1)", color: "#1d9e75" }
            : {
                background: "rgba(232,184,75,0.08)",
                color: "#e8b84b",
                border: "1px solid rgba(232,184,75,0.15)",
              }
        }
      >
        {requested ? "✓ Requested" : "Request Session"}
      </motion.button>
    </motion.div>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({ item, index }) {
  const icons = {
    session: Calendar,
    rating: Star,
    internship: Briefcase,
    skill: BookOpen,
  };
  const Icon = icons[item.type] || Zap;

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: "1px solid #1a1814" }}
    >
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(232,184,75,0.08)" }}
      >
        <Icon size={13} style={{ color: "#e8b84b" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: "#c8bfb0" }}>
          {item.text}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "#4a4438" }}>
          {item.time}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");

  // ── Fetch user on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setUser(data || { name: authUser.email?.split("@")[0] || "Student" });
      }
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  // ── Mock data (replace with real Supabase queries) ───────────────────────
  const stats = [
    {
      icon: BookOpen,
      label: "Skills offered",
      value: "4",
      sub: "2 new this month",
      accent: "+2",
    },
    {
      icon: Users,
      label: "Sessions done",
      value: "12",
      sub: "3 this week",
      accent: "Active",
    },
    {
      icon: Star,
      label: "Avg rating",
      value: "4.8",
      sub: "From 9 reviews",
    },
    {
      icon: TrendingUp,
      label: "Skills learning",
      value: "3",
      sub: "1 in progress",
    },
  ];

  const incomingSessions = [
    {
      id: 1,
      name: "Arjun Menon",
      avatar: "AM",
      skill: "React Basics",
      time: "2h ago",
      status: "pending",
    },
    {
      id: 2,
      name: "Priya Nair",
      avatar: "PN",
      skill: "Data Structures",
      time: "5h ago",
      status: "accepted",
    },
    {
      id: 3,
      name: "Rahul Das",
      avatar: "RD",
      skill: "UI/UX Design",
      time: "Yesterday",
      status: "completed",
    },
    {
      id: 4,
      name: "Sneha Iyer",
      avatar: "SI",
      skill: "Python",
      time: "2d ago",
      status: "pending",
    },
  ];

  const outgoingSessions = [
    {
      id: 5,
      name: "Kiran Raj",
      avatar: "KR",
      skill: "Machine Learning",
      time: "1h ago",
      status: "pending",
    },
    {
      id: 6,
      name: "Aisha Basheer",
      avatar: "AB",
      skill: "Figma",
      time: "3h ago",
      status: "accepted",
    },
    {
      id: 7,
      name: "Dev Pillai",
      avatar: "DP",
      skill: "Node.js",
      time: "Yesterday",
      status: "rejected",
    },
  ];

  const suggestedUsers = [
    {
      id: 1,
      name: "Meera Thomas",
      avatar: "MT",
      department: "CSE · 3rd Year",
      skills: ["React", "Figma"],
      rating: "4.9",
    },
    {
      id: 2,
      name: "Aditya Kumar",
      avatar: "AK",
      department: "ECE · 4th Year",
      skills: ["ML", "Python"],
      rating: "4.7",
    },
    {
      id: 3,
      name: "Lakshmi Priya",
      avatar: "LP",
      department: "IT · 2nd Year",
      skills: ["Node.js", "SQL"],
      rating: "4.8",
    },
    {
      id: 4,
      name: "Rohan Varma",
      avatar: "RV",
      department: "MCA · 1st Year",
      skills: ["Flutter", "Dart"],
      rating: "4.6",
    },
  ];

  const recentActivity = [
    {
      type: "session",
      text: "Your session with Priya Nair was accepted",
      time: "5 hours ago",
    },
    {
      type: "rating",
      text: "Rahul Das gave you a 5-star rating for UI/UX Design",
      time: "Yesterday at 4:30 PM",
    },
    {
      type: "internship",
      text: "New internship posted: Frontend Developer at Zoho",
      time: "Yesterday at 10:00 AM",
    },
    {
      type: "skill",
      text: "Arjun Menon wants to learn React Basics from you",
      time: "2 days ago",
    },
    {
      type: "session",
      text: "Session with Kiran Raj scheduled for Friday 3 PM",
      time: "2 days ago",
    },
  ];

  const upcomingSession = {
    name: "Kiran Raj",
    avatar: "KR",
    skill: "Machine Learning",
    date: "Friday, Apr 19",
    time: "3:00 PM",
  };

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
          Loading…
        </motion.div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Student";
  const currentSessions =
    activeTab === "incoming" ? incomingSessions : outgoingSessions;

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8 lg:px-12"
      style={{ background: "#0e0c0a" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-8 flex items-start justify-between"
        >
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#1d9e75" }}
              />
              <span className="text-xs" style={{ color: "#6a6050" }}>
                Online
              </span>
            </div>
            <h1 className="text-2xl font-medium" style={{ color: "#f5f0e8" }}>
              Good morning, {firstName}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>
              Heres whats happening on SkillBridge today
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
              style={{ background: "#141210", borderColor: "#2a2520" }}
            >
              <Bell size={16} style={{ color: "#8a8070" }} />
              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                style={{ background: "#e8b84b" }}
              />
            </motion.button>
            <motion.a
              href="/main/explore"
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
              style={{
                background: "#e8b84b",
                color: "#0e0c0a",
              }}
              whileHover={{ background: "#f0ca6e" }}
            >
              <Sparkles size={14} />
              Explore Skills
            </motion.a>
          </motion.div>
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </motion.div>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left col — Sessions + Suggestions */}
          <div className="space-y-6 lg:col-span-2">
            {/* Upcoming session banner */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl border p-5"
              style={{
                background: "linear-gradient(135deg, #1a1610 0%, #141210 100%)",
                borderColor: "#3a342c",
              }}
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-10"
                style={{
                  background:
                    "radial-gradient(circle, #e8b84b 0%, transparent 70%)",
                }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-medium"
                    style={{
                      background: "rgba(232,184,75,0.15)",
                      color: "#e8b84b",
                    }}
                  >
                    {upcomingSession.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#f5f0e8" }}
                      >
                        Next session
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(232,184,75,0.1)",
                          color: "#e8b84b",
                        }}
                      >
                        Upcoming
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#8a8070" }}>
                      {upcomingSession.skill} with {upcomingSession.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#e8b84b" }}
                  >
                    {upcomingSession.time}
                  </p>
                  <p className="text-xs" style={{ color: "#6a6050" }}>
                    {upcomingSession.date}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sessions panel */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="rounded-2xl border"
              style={{ background: "#0a0908", borderColor: "#2a2520" }}
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #1a1814" }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={15} style={{ color: "#e8b84b" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#f5f0e8" }}
                  >
                    Sessions
                  </span>
                </div>
                <a
                  href="/main/sessions"
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "#6a6050" }}
                >
                  View all
                  <ChevronRight size={12} />
                </a>
              </div>

              {/* Tab switcher */}
              <div
                className="flex px-5 pt-3 gap-1"
                style={{ borderBottom: "1px solid #1a1814" }}
              >
                {["incoming", "outgoing"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative pb-3 px-1 text-xs font-medium capitalize transition-colors"
                    style={{
                      color: activeTab === tab ? "#e8b84b" : "#4a4438",
                    }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="session-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: "#e8b84b" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Session list */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="px-2 py-2"
                >
                  {currentSessions.map((s, i) => (
                    <SessionRow key={s.id} session={s} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Suggested users */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size={15} style={{ color: "#e8b84b" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#f5f0e8" }}
                  >
                    Suggested matches
                  </span>
                </div>
                <a
                  href="/main/explore"
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#6a6050" }}
                >
                  See all
                  <ArrowUpRight size={12} />
                </a>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3"
              >
                {suggestedUsers.map((u, i) => (
                  <SuggestedUserCard key={u.id} user={u} index={i} />
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right col — Activity + Quick actions */}
          <div className="space-y-6">
            {/* Quick actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="rounded-2xl border p-4"
              style={{ background: "#0a0908", borderColor: "#2a2520" }}
            >
              <p
                className="mb-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "#4a4438" }}
              >
                Quick actions
              </p>
              <div className="space-y-2">
                {[
                  { icon: BookOpen, label: "Add a skill", href: "/main/profile" },
                  { icon: Users, label: "Find learners", href: "/main/explore" },
                  {
                    icon: Briefcase,
                    label: "Browse internships",
                    href: "/main/internships",
                  },
                  { icon: Clock, label: "Schedule session", href: "/main/sessions" },
                ].map((action, i) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                    style={{ border: "1px solid #1e1c18" }}
                    whileHover={{
                      borderColor: "#3a342c",
                      background: "rgba(232,184,75,0.02)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <action.icon size={14} style={{ color: "#8a8070" }} />
                      <span className="text-sm" style={{ color: "#c8bfb0" }}>
                        {action.label}
                      </span>
                    </div>
                    <ChevronRight size={13} style={{ color: "#3a342c" }} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Activity feed */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="rounded-2xl border"
              style={{ background: "#0a0908", borderColor: "#2a2520" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #1a1814" }}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: "#e8b84b" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#f5f0e8" }}
                  >
                    Activity
                  </span>
                </div>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="px-5 pb-2"
              >
                {recentActivity.map((item, i) => (
                  <ActivityItem key={i} item={item} index={i} />
                ))}
              </motion.div>
            </motion.div>

            {/* Internship nudge */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border p-5 cursor-pointer"
              style={{ background: "#141210", borderColor: "#2a2520" }}
            >
              <div
                className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 opacity-10"
                style={{
                  background: "radial-gradient(circle, #e8b84b, transparent)",
                }}
              />
              <Briefcase size={20} style={{ color: "#e8b84b" }} />
              <p
                className="mt-3 text-sm font-medium"
                style={{ color: "#f5f0e8" }}
              >
                3 new internships
              </p>
              <p className="mt-1 text-xs" style={{ color: "#6a6050" }}>
                Companies are actively hiring from your campus
              </p>
              <a
                href="/main/internships"
                className="mt-4 flex items-center gap-1 text-xs font-medium"
                style={{ color: "#e8b84b" }}
              >
                View internships
                <ArrowUpRight size={12} />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
