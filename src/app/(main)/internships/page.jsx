"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  Briefcase,
  Search,
  Plus,
  X,
  MapPin,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Building2,
  ChevronDown,
  Bookmark,
  Users,
  FileText,
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
  visible: { transition: { staggerChildren: 0.06 } },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "SB";
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

// ─── InternshipCard ───────────────────────────────────────────────────────────
function InternshipCard({ internship, index, isOwn, onExpand, expanded }) {
  const poster = internship.poster;
  const initials = getInitials(poster?.name);

  return (
    <motion.div
      variants={CARD_ANIM}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border transition-colors"
      style={{ background: "#141210", borderColor: "#2a2520" }}
    >
      {/* Top accent bar */}
      <div
        className="h-0.5"
        style={{
          background: isOwn
            ? "linear-gradient(90deg, #1d9e75 0%, transparent 100%)"
            : "linear-gradient(90deg, #e8b84b 0%, transparent 100%)",
        }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isOwn && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(29,158,117,0.1)", color: "#1d9e75" }}
                >
                  Your post
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium leading-snug" style={{ color: "#f5f0e8" }}>
              {internship.title}
            </h3>
          </div>
          <span className="text-xs shrink-0" style={{ color: "#3a342c" }}>
            {timeAgo(internship.created_at)}
          </span>
        </div>

        {/* Description */}
        <p
          className={`mt-2 text-xs leading-relaxed ${expanded ? "" : "line-clamp-3"}`}
          style={{ color: "#6a6050" }}
        >
          {internship.description}
        </p>
        {internship.description && internship.description.length > 150 && (
          <button
            onClick={() => onExpand(expanded ? null : internship.id)}
            className="mt-1 text-xs font-medium transition-colors"
            style={{ color: "#e8b84b" }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Poster info */}
        <div
          className="mt-3 flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid #1e1c18" }}
        >
          <div className="flex items-center gap-2">
            {poster?.avatar_url ? (
              <img src={poster.avatar_url} alt={poster.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium"
                style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b" }}
              >
                {initials}
              </div>
            )}
            <div>
              <p className="text-xs font-medium" style={{ color: "#c8bfb0" }}>{poster?.name}</p>
              {poster?.department && (
                <p className="flex items-center gap-0.5 text-xs" style={{ color: "#4a4438" }}>
                  <GraduationCap size={9} />
                  {poster.department}
                </p>
              )}
            </div>
          </div>

          {!isOwn && (
            <motion.a
              href={`/chat?user=${poster?.id}`}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all"
              style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.15)" }}
            >
              Enquire
              <ArrowUpRight size={10} />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── PostModal ────────────────────────────────────────────────────────────────
function PostModal({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Please add a title");
    if (!description.trim()) return setError("Please add a description");
    setLoading(true);
    setError("");
    const { error: err } = await onSubmit({ title: title.trim(), description: description.trim() });
    if (err) {
      setError("Failed to post. Please try again.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(onClose, 1500);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 250 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl"
        style={{ background: "#0a0908", border: "1px solid #2a2520", borderBottom: "none" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "#2a2520" }} />
        </div>

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
            <p className="mt-4 text-base font-medium" style={{ color: "#f5f0e8" }}>Posted!</p>
            <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>Your internship is now visible to others</p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1a1814" }}>
              <h2 className="text-base font-medium" style={{ color: "#f5f0e8" }}>Post an internship</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "#141210" }}
              >
                <X size={14} style={{ color: "#8a8070" }} />
              </motion.button>
            </div>

            <div className="space-y-4 px-6 py-5">
              {/* Title */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#8a8070" }}>
                  <Briefcase size={11} />
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer Intern at Zoho"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: "#141210", border: "1px solid #2a2520", color: "#f5f0e8" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#8a8070" }}>
                  <FileText size={11} />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, requirements, duration, stipend, and how to apply…"
                  rows={5}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: "#141210", border: "1px solid #2a2520", color: "#f5f0e8" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#b05252" }}>{error}</p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid #1a1814" }}>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
                style={{
                  background: loading ? "#1a1814" : "#e8b84b",
                  color: loading ? "#3a342c" : "#0e0c0a",
                }}
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                {loading ? "Posting…" : "Post internship"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// ─── EmptyInternshipState ─────────────────────────────────────────────────────
function EmptyInternshipState({ query, onClear }) {
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
        <Briefcase size={22} style={{ color: "#3a342c" }} />
      </div>
      <p className="mt-4 text-sm font-medium" style={{ color: "#4a4438" }}>
        {query ? `No results for "${query}"` : "No internships posted yet"}
      </p>
      <p className="mt-1 text-xs" style={{ color: "#2a2520" }}>
        {query ? "Try a different search term" : "Be the first to share an opportunity!"}
      </p>
      {query && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClear}
          className="mt-5 rounded-xl px-4 py-2 text-xs font-medium"
          style={{ background: "rgba(232,184,75,0.08)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.15)" }}
        >
          Clear search
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
          className="rounded-2xl border p-5"
          style={{ background: "#141210", borderColor: "#1e1c18", height: 180 }}
        />
      ))}
    </div>
  );
}

// ─── Main Internships Page ────────────────────────────────────────────────────
export default function InternshipsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const [currentUser, setCurrentUser] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterView, setFilterView] = useState("all"); // "all" | "mine"

  // ── Fetch user ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    init();
  }, [supabase]);

  // ── Fetch internships ──────────────────────────────────────────────────
  const fetchInternships = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("internships")
      .select(`
        id, title, description, posted_by, created_at,
        poster:posted_by (id, name, department, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query.limit(50);
    if (!error) setInternships(data || []);
    setLoading(false);
  }, [supabase, searchQuery]);

  useEffect(() => {
    const t = setTimeout(fetchInternships, searchQuery ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchInternships, searchQuery]);

  // ── Post internship ────────────────────────────────────────────────────
  const handlePost = async ({ title, description }) => {
    const { error } = await supabase.from("internships").insert({
      title,
      description,
      posted_by: currentUser.id,
    });
    if (!error) fetchInternships();
    return { error };
  };

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = filterView === "mine"
    ? internships.filter((i) => i.posted_by === currentUser?.id)
    : internships;

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12" style={{ background: "#0e0c0a" }}>
      <div className="mx-auto max-w-5xl">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium" style={{ color: "#f5f0e8" }}>Internships</h1>
              <p className="mt-1 text-sm" style={{ color: "#6a6050" }}>
                Discover and share internship opportunities
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
              style={{ background: "#e8b84b", color: "#0e0c0a" }}
            >
              <Plus size={14} />
              Post Internship
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ── Search + Filter Bar ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#4a4438" }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internships — Frontend, Marketing, Design…"
              className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all"
              style={{ background: "#141210", border: "1px solid #2a2520", color: "#f5f0e8" }}
              onFocus={(e) => (e.target.style.borderColor = "#e8b84b")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: "#2a2520" }}
              >
                <X size={10} style={{ color: "#8a8070" }} />
              </motion.button>
            )}
          </div>

          {/* Filter toggle */}
          <div
            className="flex items-center gap-0.5 rounded-xl p-0.5 shrink-0"
            style={{ background: "#141210", border: "1px solid #2a2520" }}
          >
            {[
              { id: "all", label: "All", icon: Briefcase },
              { id: "mine", label: "My posts", icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilterView(id)}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                style={{ color: filterView === id ? "#0e0c0a" : "#6a6050" }}
              >
                {filterView === id && (
                  <motion.div
                    layoutId="intern-filter-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "#e8b84b" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon size={11} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Result count ────────────────────────────────────────────── */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-xs"
            style={{ color: "#4a4438" }}
          >
            {filtered.length} {filtered.length === 1 ? "internship" : "internships"} found
          </motion.p>
        )}

        {/* ── Internship List ─────────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyInternshipState query={searchQuery} onClear={() => setSearchQuery("")} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2"
          >
            {filtered.map((intern, i) => (
              <InternshipCard
                key={intern.id}
                internship={intern}
                index={i}
                isOwn={intern.posted_by === currentUser?.id}
                expanded={expandedId === intern.id}
                onExpand={setExpandedId}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Post Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPostModal && (
          <PostModal
            onSubmit={handlePost}
            onClose={() => setShowPostModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
