"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  Search,
  GraduationCap,
  MessageCircle,
  ArrowUpRight,
  Star,
  Trophy,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Loader2,
  X,
  Zap,
  Calendar,
  Clock,
  BookOpen,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

// ─────────────────────────────────────────────────────────────────────────────
// Animation
// ─────────────────────────────────────────────────────────────────────────────

const CARD_ANIM = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (fallback when no real tutors exist)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TUTORS = [
  {
    id: "mock-tutor-1",
    name: "Dr. Sarah Connor",
    department: "Computer Science",
    bio: "Specialist in Artificial Intelligence and Machine Learning. 10+ years of industry experience.",
    avatar_url: null,
    teachSkills: ["Machine Learning", "Python", "AI Ethics"],
    courses: [{ id: "mock-c1", title: "Introduction to AI", skill_name: "Machine Learning", short_description: "Learn the fundamentals of AI and its real-world applications.", level: "Beginner" }],
    avgRating: 4.9, reviewCount: 15, sessionsTaught: 42, reviews: [], matchCount: 1, leaderboardScore: 205,
  },
  {
    id: "mock-tutor-2",
    name: "Prof. James Bond",
    department: "Information Technology",
    bio: "Expert in Network Security and Ethical Hacking. Passionate about teaching cybersecurity.",
    avatar_url: null,
    teachSkills: ["Cybersecurity", "Network Security", "Linux"],
    courses: [{ id: "mock-c2", title: "Ethical Hacking 101", skill_name: "Cybersecurity", short_description: "Master the basics of security auditing and penetration testing.", level: "Intermediate" }],
    avgRating: 4.8, reviewCount: 12, sessionsTaught: 38, reviews: [], matchCount: 1, leaderboardScore: 182,
  },
  {
    id: "mock-tutor-3",
    name: "Dr. Alan Turing",
    department: "Computer Science",
    bio: "Foundational expert in Cryptography and Computation. Passionate about problem-solving.",
    avatar_url: null,
    teachSkills: ["Cryptography", "Algorithms", "Logic"],
    courses: [{ id: "mock-c3", title: "Intro to Cryptography", skill_name: "Cryptography", short_description: "Unlock the secrets of secure communication.", level: "Advanced" }],
    avgRating: 5.0, reviewCount: 28, sessionsTaught: 156, reviews: [], matchCount: 1, leaderboardScore: 780,
  },
  {
    id: "mock-tutor-4",
    name: "Prof. Ada Lovelace",
    department: "Mathematics",
    bio: "Pioneer of computing. I teach the bridge between mathematics and machine execution.",
    avatar_url: null,
    teachSkills: ["Mathematics", "Analytical Engine", "Programming"],
    courses: [{ id: "mock-c4", title: "Mathematical Logic", skill_name: "Mathematics", short_description: "The foundation of all modern computation.", level: "Intermediate" }],
    avgRating: 4.9, reviewCount: 22, sessionsTaught: 89, reviews: [], matchCount: 1, leaderboardScore: 436,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "SB";
}

function StarRow({ value }) {
  const rounded = Math.round(value || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} style={{ color: i <= rounded ? "#e8b84b" : "#2a2520", fill: i <= rounded ? "#e8b84b" : "transparent" }} />
      ))}
    </div>
  );
}

function Avatar({ name, avatarUrl }) {
  return avatarUrl ? (
    <img src={avatarUrl} alt={name} className="h-11 w-11 rounded-xl object-cover" />
  ) : (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-medium"
      style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.18)" }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews Modal
// ─────────────────────────────────────────────────────────────────────────────

function ReviewsModal({ tutor, onClose }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-xl rounded-t-3xl border"
        style={{ background: "#0a0908", borderColor: "#2a2520" }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Reviews for {tutor.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <StarRow value={tutor.avgRating} />
              <span className="text-xs" style={{ color: "#8a8070" }}>
                {tutor.avgRating ? tutor.avgRating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
              </span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#141210" }}>
            <X size={14} style={{ color: "#8a8070" }} />
          </button>
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto px-5 py-4">
          {tutor.reviews.length === 0 ? (
            <div className="rounded-xl border p-3 text-xs" style={{ borderColor: "#2a2520", color: "#6a6050", background: "#141210" }}>
              No written reviews yet.
            </div>
          ) : (
            tutor.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border p-3" style={{ borderColor: "#2a2520", background: "#141210" }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium" style={{ color: "#c8bfb0" }}>{review.raterName || "Student"}</p>
                  <div className="flex items-center gap-1">
                    <Star size={11} style={{ color: "#e8b84b", fill: "#e8b84b" }} />
                    <span className="text-xs" style={{ color: "#e8b84b" }}>{review.score}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "#8a8070" }}>{review.feedback || "No comment provided."}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Course Modal
// ─────────────────────────────────────────────────────────────────────────────

function RequestCourseModal({ tutor, course, currentUserId, supabase, onClose, onSuccess }) {
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!preferredTime) { setErr("Please select a preferred time slot."); return; }
    setSubmitting(true);
    setErr("");

    const payload = {
      requester_id: currentUserId,
      provider_id: tutor.id,
      status: "pending",
      requester_message: message.trim() || null,
      preferred_time: new Date(preferredTime).toISOString(),
    };

    // attach course_id and skill_id if available
    if (course?.id && !course.id.startsWith("mock")) {
      payload.course_id = course.id;
    }
    if (course?.skill_name) {
      // try to resolve skill_id from skills table
      const { data: skillRow } = await supabase
        .from("skills")
        .select("id")
        .ilike("name", course.skill_name)
        .maybeSingle();
      if (skillRow) payload.skill_id = skillRow.id;
    }

    const { error } = await supabase.from("sessions").insert(payload);
    setSubmitting(false);
    if (error) { setErr(error.message || "Failed to send request."); return; }
    setDone(true);
    setTimeout(() => { onSuccess(); onClose(); }, 1600);
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
            <p className="text-xs mt-0.5" style={{ color: "#6a6050" }}>
              {course?.title || course?.skill_name || "Course"} with {tutor.name}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
            <X size={14} style={{ color: "#6a6050" }} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)" }}
            >
              <CheckCircle2 size={26} style={{ color: "#1d9e75" }} />
            </motion.div>
            <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>Request sent!</p>
            <p className="text-xs" style={{ color: "#6a6050" }}>The tutor will respond soon</p>
          </div>
        ) : (
          <div className="p-5 space-y-3.5">
            {/* Course summary */}
            {(course?.short_description || course?.description) && (
              <div
                className="rounded-xl border p-3"
                style={{ background: "#141210", borderColor: "#2a2520" }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen size={11} style={{ color: "#e8b84b" }} />
                  <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#4a4438" }}>
                    Course
                  </span>
                  {course?.level && (
                    <span
                      className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
                    >
                      {course.level}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#8a8070" }}>
                  {course.short_description || course.description}
                </p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>
                Preferred time slot *
              </label>
              <input
                type="datetime-local"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8a8070" }}>
                Message to tutor (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. I am a complete beginner and want to start from scratch…"
                rows={3}
                className={`${inputCls} resize-none`}
                style={inputStyle}
              />
            </div>

            {err && <p className="text-xs" style={{ color: "#b05252" }}>{err}</p>}

            <div className="flex gap-2 pt-1">
              <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm" style={{ borderColor: "#2a2520", color: "#6a6050" }}>
                Cancel
              </motion.button>
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
// Tutor Card
// ─────────────────────────────────────────────────────────────────────────────

function TutorCard({ tutor, onOpenReviews, onRequestCourse }) {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const topCourse = tutor.courses?.[0];

  return (
    <motion.div
      variants={CARD_ANIM}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border p-4"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar name={tutor.name} avatarUrl={tutor.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: "#f5f0e8" }}>{tutor.name}</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: "#6a6050" }}>
            <GraduationCap size={10} />
            <span className="truncate">{tutor.department || "Campus"}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StarRow value={tutor.avgRating} />
            <span className="text-xs" style={{ color: "#8a8070" }}>
              {tutor.avgRating ? tutor.avgRating.toFixed(1) : "New"} · {tutor.reviewCount} reviews
            </span>
          </div>
          <div className="mt-1 text-xs" style={{ color: "#4a4438" }}>
            {tutor.sessionsTaught} sessions taught
          </div>
        </div>
      </div>

      {tutor.bio && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed" style={{ color: "#8a8070" }}>
          {tutor.bio}
        </p>
      )}

      {/* Courses list */}
      {tutor.courses?.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "#4a4438" }}>
            Courses ({tutor.courses.length})
          </p>
          {tutor.courses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className="rounded-xl border p-2.5"
              style={{ borderColor: "#2a2520", background: "#0e0c0a" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" style={{ color: "#f5f0e8" }}>
                    {course.title || course.skill_name}
                  </p>
                  {course.short_description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed" style={{ color: "#6a6050" }}>
                      {course.short_description}
                    </p>
                  )}
                </div>
                {course.level && (
                  <span
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{
                      background: course.level === "Advanced" ? "rgba(192,132,252,0.1)" : course.level === "Intermediate" ? "rgba(232,184,75,0.1)" : "rgba(29,158,117,0.1)",
                      color: course.level === "Advanced" ? "#c084fc" : course.level === "Intermediate" ? "#e8b84b" : "#1d9e75",
                    }}
                  >
                    {course.level}
                  </span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onRequestCourse(tutor, course)}
                className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium"
                style={{
                  background: "rgba(232,184,75,0.08)",
                  border: "1px solid rgba(232,184,75,0.18)",
                  color: "#e8b84b",
                }}
              >
                Request this Course
              </motion.button>
            </div>
          ))}
        </div>
      )}

      {/* Skills tags */}
      <div className="mt-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-wider" style={{ color: "#4a4438" }}>
          Teaching
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tutor.teachSkills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="rounded-lg px-2 py-1 text-xs"
              style={{ background: "rgba(232,184,75,0.08)", color: "#8a8070", border: "1px solid rgba(232,184,75,0.12)" }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onOpenReviews(tutor)}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs"
          style={{ border: "1px solid #2a2520", color: "#8a8070" }}
        >
          <MessageSquare size={11} /> Reviews
        </button>
        <Link
          href={`/chat?user=${tutor.id}`}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs"
          style={{ border: "1px solid #2a2520", color: "#8a8070" }}
        >
          <MessageCircle size={11} /> Chat
        </Link>
        <Link
          href={`/profile?id=${tutor.id}`}
          className="ml-auto flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium"
          style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.2)", color: "#e8b84b" }}
        >
          View Profile <ArrowUpRight size={11} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Explore Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const router = useRouter();
  const { role } = useRole();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [myLearnSkills, setMyLearnSkills] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [reviewsTutor, setReviewsTutor] = useState(null);
  const [requestModal, setRequestModal] = useState(null); // { tutor, course }

  const loadData = useCallback(async (uid) => {
    setLoading(true);

    const [{ data: profilesData, error: profilesError }, { data: mySkillsData }] = await Promise.all([
      supabase.from("profiles").select("id, name, department, bio, avatar_url").neq("id", uid),
      supabase.from("skills").select("skill_name").eq("user_id", uid).eq("type", "learn"),
    ]);

    if (profilesError) {
      setTutors(MOCK_TUTORS);
      setLoading(false);
      return;
    }

    const learnNames = Array.from(new Set((mySkillsData || []).map((r) => r.skill_name).filter(Boolean)));
    setMyLearnSkills(learnNames);

    const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

    const { data: teachCourses } = await supabase
      .from("courses")
      .select("id, tutor_id, title, skill_name, level, short_description, description, is_published, is_active")
      .neq("tutor_id", uid)
      .eq("is_published", true)
      .eq("is_active", true);

    const coursesByTutor = new Map();
    (teachCourses || []).forEach((c) => {
      if (!profileMap.has(c.tutor_id)) return;
      if (!coursesByTutor.has(c.tutor_id)) coursesByTutor.set(c.tutor_id, []);
      coursesByTutor.get(c.tutor_id).push(c);
    });

    const baseTutors = Array.from(coursesByTutor.entries()).map(([tutorId, courses]) => {
      const row = profileMap.get(tutorId);
      const teachSkills = Array.from(new Set(courses.map((c) => c.skill_name).filter(Boolean)));
      return {
        id: row.id,
        name: row.name || "Tutor",
        department: row.department || "",
        bio: row.bio || "",
        avatar_url: row.avatar_url || "",
        teachSkills,
        courses,
        avgRating: 0, reviewCount: 0, sessionsTaught: 0, reviews: [], leaderboardScore: 0, matchCount: 0,
      };
    });

    if (baseTutors.length === 0) {
      setTutors(MOCK_TUTORS);
      setLoading(false);
      return;
    }

    const tutorIds = baseTutors.map((t) => t.id);

    const [{ data: ratingsData }, { data: sessionsData }] = await Promise.all([
      supabase.from("ratings").select("id, rated_id, score, feedback, created_at, rater:rater_id(name,avatar_url)").in("rated_id", tutorIds).order("created_at", { ascending: false }),
      supabase.from("sessions").select("id, provider_id").in("provider_id", tutorIds).eq("status", "completed"),
    ]);

    const ratingsByTutor = new Map();
    (ratingsData || []).forEach((r) => {
      if (!ratingsByTutor.has(r.rated_id)) ratingsByTutor.set(r.rated_id, []);
      ratingsByTutor.get(r.rated_id).push(r);
    });

    const sessionsByTutor = new Map();
    (sessionsData || []).forEach((s) => {
      sessionsByTutor.set(s.provider_id, (sessionsByTutor.get(s.provider_id) || 0) + 1);
    });

    const learnSet = new Set(learnNames.map((s) => s.toLowerCase()));

    const merged = baseTutors
      .map((tutor) => {
        const ratings = ratingsByTutor.get(tutor.id) || [];
        const reviewCount = ratings.length;
        const avgRating = reviewCount > 0 ? ratings.reduce((acc, r) => acc + Number(r.score || 0), 0) / reviewCount : 0;
        const sessionsTaught = sessionsByTutor.get(tutor.id) || 0;
        const reviews = ratings.slice(0, 12).map((r) => ({
          id: r.id, score: r.score, feedback: r.feedback,
          raterName: r.rater?.name, raterAvatar: r.rater?.avatar_url, createdAt: r.created_at,
        }));
        const matchCount = tutor.teachSkills.filter((skill) => learnSet.has(skill.toLowerCase())).length;
        const leaderboardScore = avgRating * sessionsTaught;
        return {
          ...tutor, avgRating, reviewCount, sessionsTaught, reviews, matchCount, leaderboardScore,
          courses: [...(tutor.courses || [])].sort((a, b) => (a.title || a.skill_name || "").localeCompare(b.title || b.skill_name || "")),
        };
      })
      .sort((a, b) => {
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.sessionsTaught - a.sessionsTaught;
      });

    setTutors(merged.length > 0 ? merged : MOCK_TUTORS);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);
      await loadData(user.id);
    }
    init();
  }, [loadData, router, supabase]);

  const skillOptions = useMemo(() => {
    const all = Array.from(new Set(tutors.flatMap((t) => t.teachSkills))).sort((a, b) => a.localeCompare(b));
    return ["All", ...all];
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tutors.filter((t) => {
      const skillMatch = selectedSkill === "All" || t.teachSkills.some((s) => s === selectedSkill);
      if (!skillMatch) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.teachSkills.some((s) => s.toLowerCase().includes(q)) ||
        (t.courses || []).some((c) => (c.title || c.description || "").toLowerCase().includes(q))
      );
    });
  }, [search, selectedSkill, tutors]);

  const leaderboard = useMemo(() => {
    const list = tutors.filter((t) => t.reviewCount > 0 || (t.id && t.id.startsWith("mock-")));
    const filtered = selectedSkill === "All" ? list : list.filter((t) => t.teachSkills.some((s) => s === selectedSkill));
    return filtered.sort((a, b) => (b.leaderboardScore || 0) - (a.leaderboardScore || 0)).slice(0, 5);
  }, [tutors, selectedSkill]);

  // Tutors are redirected to profile — but can still view explore as student
  return (
    <div className="min-h-screen" style={{ background: "#0e0c0a" }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 border-b px-4 py-4 md:px-8"
        style={{ background: "rgba(14,12,10,0.92)", borderColor: "#1a1814", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-medium" style={{ color: "#f5f0e8" }}>Explore Tutors</h1>
              <p className="text-xs" style={{ color: "#6a6050" }}>
                Find tutors, request courses, and supercharge your learning journey.
              </p>
            </div>
            <button
              onClick={() => currentUser?.id && loadData(currentUser.id)}
              className="rounded-xl border px-3 py-2 text-xs"
              style={{ borderColor: "#2a2520", color: "#8a8070", background: "#141210" }}
            >
              Refresh
            </button>
          </div>

          <div className="relative mt-3">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4a4438" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutor, course or skill..."
              className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none"
              style={{ background: "#141210", border: "1px solid #2a2520", color: "#f5f0e8" }}
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {skillOptions.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className="shrink-0 rounded-xl px-3 py-1.5 text-xs"
                style={
                  selectedSkill === skill
                    ? { background: "#e8b84b", color: "#0e0c0a" }
                    : { background: "#141210", color: "#8a8070", border: "1px solid #2a2520" }
                }
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Tutors grid */}
          <div className="flex-1 min-w-0">
            {myLearnSkills.length > 0 && (
              <div className="mb-6 rounded-2xl border p-3.5" style={{ background: "#141210", borderColor: "#2a2520" }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles size={11} style={{ color: "#1d9e75" }} />
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4a4438" }}>
                    Matching your learning goals
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {myLearnSkills.map((s) => (
                    <span key={s} className="rounded-lg px-2 py-1 text-xs"
                      style={{ background: "rgba(29,158,117,0.06)", color: "#1d9e75", border: "1px solid rgba(29,158,117,0.15)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border py-24" style={{ background: "#141210", borderColor: "#2a2520" }}>
                <div className="flex flex-col items-center gap-3 text-sm" style={{ color: "#4a4438" }}>
                  <Loader2 size={24} className="animate-spin" />
                  Scanning for tutors...
                </div>
              </div>
            ) : filteredTutors.length === 0 ? (
              <div className="rounded-2xl border py-24 text-center" style={{ background: "#141210", borderColor: "#2a2520" }}>
                <Search size={32} className="mx-auto mb-4" style={{ color: "#2a2520" }} />
                <p className="text-sm font-medium" style={{ color: "#8a8070" }}>
                  No tutors found for &ldquo;{selectedSkill !== "All" ? selectedSkill : search}&rdquo;
                </p>
                <p className="mt-1 text-xs" style={{ color: "#4a4438" }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.05 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {filteredTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    onOpenReviews={setReviewsTutor}
                    onRequestCourse={(t, c) => setRequestModal({ tutor: t, course: c })}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Leaderboard sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-[140px] space-y-4">
              <div className="rounded-2xl border overflow-hidden" style={{ background: "#141210", borderColor: "#2a2520" }}>
                <div className="flex items-center gap-3 border-b p-4" style={{ background: "rgba(232,184,75,0.02)", borderColor: "#1a1814" }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.15)" }}>
                    <Trophy size={16} style={{ color: "#e8b84b" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: "#f5f0e8" }}>
                      {selectedSkill === "All" ? "Top Tutors" : `${selectedSkill} Leaderboard`}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#6a6050" }}>Ranked by reviews & impact</p>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: "#1a1814" }}>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((t, idx) => (
                      <Link key={t.id} href={`/profile?id=${t.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.02]">
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                          style={{
                            background: idx === 0 ? "rgba(232,184,75,0.15)" : idx === 1 ? "rgba(192,192,192,0.1)" : idx === 2 ? "rgba(205,127,50,0.1)" : "rgba(255,255,255,0.03)",
                            color: idx === 0 ? "#e8b84b" : idx === 1 ? "#a0a0a0" : idx === 2 ? "#cd7f32" : "#4a4438",
                            border: `1px solid ${idx === 0 ? "rgba(232,184,75,0.25)" : "transparent"}`,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium" style={{ color: "#c8bfb0" }}>{t.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              <Star size={9} style={{ color: "#e8b84b", fill: "#e8b84b" }} />
                              <span className="text-[10px] font-medium" style={{ color: "#e8b84b" }}>{t.avgRating.toFixed(1)}</span>
                            </div>
                            <span className="text-[10px]" style={{ color: "#4a4438" }}>{t.sessionsTaught} sessions</span>
                          </div>
                        </div>
                        <ChevronRight size={12} style={{ color: "#2a2520" }} />
                      </Link>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-[10px] italic" style={{ color: "#4a4438" }}>No rankings for this skill yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border p-4" style={{ background: "#0a0908", borderColor: "#2a2520" }}>
                <p className="text-[11px] font-medium uppercase tracking-widest mb-2.5" style={{ color: "#4a4438" }}>Pro Tip</p>
                <div className="flex gap-3">
                  <Zap size={14} style={{ color: "#e8b84b" }} className="mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed" style={{ color: "#8a8070" }}>
                    Click &ldquo;Request this Course&rdquo; on any tutor card to book a session with your preferred time slot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews modal */}
      <AnimatePresence>
        {reviewsTutor && <ReviewsModal tutor={reviewsTutor} onClose={() => setReviewsTutor(null)} />}
      </AnimatePresence>

      {/* Request Course modal */}
      <AnimatePresence>
        {requestModal && (
          <RequestCourseModal
            tutor={requestModal.tutor}
            course={requestModal.course}
            currentUserId={currentUser?.id}
            supabase={supabase}
            onClose={() => setRequestModal(null)}
            onSuccess={() => router.push("/sessions")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
