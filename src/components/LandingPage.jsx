// src/app/page.jsx
"use client";

import Link from "next/link";
import { motion } from "motion/react";

const features = [
  {
    icon: "✏️",
    title: "Teach a Skill",
    desc: "Share your expertise with peers. List your skills and accept session requests from learners.",
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    icon: "📖",
    title: "Learn from Peers",
    desc: "Browse skills offered by fellow students, request sessions, and grow at your own pace.",
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: "💼",
    title: "Find Internships",
    desc: "Discover internship opportunities posted within your campus community.",
    color: "bg-violet-500/10 text-violet-400",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Sign up with your campus email and set up your skill profile.",
  },
  {
    num: "02",
    title: "List or browse skills",
    desc: "Offer what you know or explore skills you want to learn.",
  },
  {
    num: "03",
    title: "Book a session",
    desc: "Request, accept, and schedule peer-to-peer learning sessions.",
  },
  {
    num: "04",
    title: "Rate & grow",
    desc: "Leave feedback and build your campus reputation over time.",
  },
];

const testimonials = [
  {
    initials: "AR",
    name: "Arjun R.",
    dept: "Computer Science, S6",
    color: "bg-amber-500/10 text-amber-400",
    text: "Taught React to 3 juniors this semester. SkillBridge made it easy to manage sessions and get feedback.",
  },
  {
    initials: "NP",
    name: "Nadia P.",
    dept: "Design, S4",
    color: "bg-emerald-500/10 text-emerald-400",
    text: "Found an internship and a UI/UX mentor through the platform. It feels so polished for a campus tool.",
  },
  {
    initials: "KM",
    name: "Kevin M.",
    dept: "Data Science, S5",
    color: "bg-violet-500/10 text-violet-400",
    text: "Learned Python basics from a senior in just 4 sessions. The scheduling system is seamless.",
  },
];

const stats = [
  { num: "480+", label: "Active students" },
  { num: "120+", label: "Skills offered" },
  { num: "960+", label: "Sessions completed" },
  { num: "40+", label: "Internships posted" },
];

const skillTags = [
  "Web Development",
  "UI/UX Design",
  "Machine Learning",
  "Data Analysis",
  "Video Editing",
  "Graphic Design",
  "Public Speaking",
  "Python",
  "Photography",
  "React",
  "DSA",
];

const highlightedTags = [
  "Web Development",
  "UI/UX Design",
  "Video Editing",
  "React",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0e0c0a] text-[#f5f0e8] font-sans">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-[#2a2520] bg-[#0e0c0a]/90 backdrop-blur-md">
        <span className="text-lg font-medium text-amber-400">
          Skill<span className="text-[#f5f0e8]">Bridge</span>
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm text-[#a09880] hover:text-amber-400 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/internships"
            className="text-sm text-[#a09880] hover:text-amber-400 transition-colors"
          >
            Internships
          </Link>
          <Link
            href="/login"
            className="text-sm bg-amber-400 text-[#0e0c0a] font-medium px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs px-4 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            Campus Skill Exchange Platform
          </span>

          <h1 className="text-5xl font-medium leading-tight tracking-tight mb-5">
            Learn, Teach &amp; <br />
            Grow <span className="text-amber-400">Together</span>
          </h1>

          <p className="text-[#8a8070] text-base leading-relaxed max-w-lg mx-auto mb-8">
            Connect with peers on campus to share skills, book learning
            sessions, and discover internship opportunities — all in one place.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/login"
              className="bg-amber-400 text-[#0e0c0a] font-medium px-7 py-3 rounded-xl text-sm hover:bg-amber-300 transition-colors"
            >
              Start Learning Free
            </Link>
            <Link
              href="/explore"
              className="border border-[#3a342c] text-[#f5f0e8] px-7 py-3 rounded-xl text-sm hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              Explore Skills
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <div className="flex justify-center border-y border-[#1e1a14]">
        {stats.map((s, i) => (
          <div
            key={i}
            className="px-10 py-5 text-center border-r border-[#1e1a14] last:border-r-0"
          >
            <div className="text-2xl font-medium text-amber-400">{s.num}</div>
            <div className="text-xs text-[#6a6050] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs text-amber-400 uppercase tracking-widest mb-2">
          What you can do
        </p>
        <h2 className="text-3xl font-medium tracking-tight mb-3">
          Everything you need to grow on campus
        </h2>
        <p className="text-[#7a7060] text-sm mb-10 max-w-md">
          {`Teach what you know, learn what you don't, and find opportunities
            within your campus community.`}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#141210] border border-[#2a2520] rounded-2xl p-6 hover:border-amber-500/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg ${f.color}`}
              >
                {f.icon}
              </div>
              <h3 className="text-sm font-medium text-[#f0ebe0] mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-[#7a7060] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SKILL TAGS ── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <p className="text-xs text-amber-400 uppercase tracking-widest mb-2">
          Skill categories
        </p>
        <h2 className="text-2xl font-medium tracking-tight mb-5">
          {`What's being shared`}
        </h2>
        <div className="flex flex-wrap gap-2">
          {skillTags.map((tag) => (
            <span
              key={tag}
              className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
                highlightedTags.includes(tag)
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-[#141210] border-[#2a2520] text-[#a09880]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-xs text-amber-400 uppercase tracking-widest mb-2">
          Process
        </p>
        <h2 className="text-2xl font-medium tracking-tight mb-8">
          How it works
        </h2>
        <div className="border border-[#1e1a14] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className="p-6 border-b md:border-b-0 md:border-r border-[#1e1a14] last:border-0"
            >
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 inline-block mb-3">
                Step {s.num}
              </span>
              <h3 className="text-sm font-medium text-[#f0ebe0] mb-1">
                {s.title}
              </h3>
              <p className="text-xs text-[#6a6050] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-xs text-amber-400 uppercase tracking-widest mb-2">
          Community
        </p>
        <h2 className="text-2xl font-medium tracking-tight mb-6">
          What students say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#141210] border border-[#2a2520] rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f0ebe0]">{t.name}</p>
                  <p className="text-xs text-[#6a6050]">{t.dept}</p>
                </div>
              </div>
              <p className="text-xs text-[#8a8070] leading-relaxed">{t.text}</p>
              <p className="text-amber-400 text-xs mt-3">★ ★ ★ ★ ★</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="text-center py-16 px-6 border-t border-[#1e1a14] bg-[#0a0908]">
        <h2 className="text-3xl font-medium tracking-tight mb-3">
          Ready to start your journey?
        </h2>
        <p className="text-sm text-[#6a6050] mb-8">
          Join hundreds of students already learning and teaching on
          SkillBridge.
        </p>
        <Link
          href="/login"
          className="bg-amber-400 text-[#0e0c0a] font-medium px-10 py-3.5 rounded-xl text-sm hover:bg-amber-300 transition-colors"
        >
          Get Started for Free
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-center py-5 text-xs text-[#3a3428] border-t border-[#1a1610]">
        © 2025 SkillBridge · Campus Skill Exchange Platform
      </footer>
    </div>
  );
}
