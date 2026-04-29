"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  X,
  BookOpen,
  Award,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Supabase ────────────────────────────────────────────────────────────────

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// ─── Animation presets ───────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
};

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22 },
};

// ─── Step progress indicator ─────────────────────────────────────────────────

function StepDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            background: i <= current ? "#e8b84b" : "#2a2520",
          }}
          transition={{ duration: 0.25 }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  );
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

function Tag({ label, onRemove }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(232,184,75,0.1)",
        border: "1px solid rgba(232,184,75,0.25)",
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: 12,
        color: "#e8b84b",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(232,184,75,0.6)",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ─── Input field ─────────────────────────────────────────────────────────────

function Field({ label, placeholder, value, onChange, type = "text", rows }) {
  const base = {
    width: "100%",
    background: "#0e0c0a",
    border: "1px solid #2a2520",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#f5f0e8",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 500,
            color: "#8a8070",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      {rows ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={base}
          onFocus={(e) => (e.target.style.borderColor = "#4a4030")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={base}
          onFocus={(e) => (e.target.style.borderColor = "#4a4030")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
        />
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          width: 40,
          height: 40,
          background: "rgba(232,184,75,0.1)",
          border: "1px solid rgba(232,184,75,0.2)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Icon size={18} color="#e8b84b" />
      </div>
      <h2
        style={{ fontSize: 18, fontWeight: 600, color: "#f5f0e8", margin: 0 }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 13, color: "#6a6050", margin: "6px 0 0 0" }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── Step 1: Skills ───────────────────────────────────────────────────────────

function StepSkills({ data, onChange }) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (!trimmed || data.skills.includes(trimmed)) return;
    onChange({ ...data, skills: [...data.skills, trimmed] });
    setInput("");
  };

  const removeSkill = (s) =>
    onChange({ ...data, skills: data.skills.filter((x) => x !== s) });

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <motion.div key="step-skills" {...fadeUp}>
      <SectionHeader
        icon={BookOpen}
        title="What do you teach?"
        subtitle="Add the subjects or skills you can confidently teach others."
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="e.g. Python, Machine Learning, UI/UX..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          style={{
            flex: 1,
            background: "#0e0c0a",
            border: "1px solid #2a2520",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "#f5f0e8",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4a4030")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
        />
        <button
          onClick={addSkill}
          style={{
            background: "rgba(232,184,75,0.1)",
            border: "1px solid rgba(232,184,75,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#e8b84b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      {data.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <AnimatePresence>
            {data.skills.map((s) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
              >
                <Tag label={s} onRemove={() => removeSkill(s)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Field
        label="Teaching experience"
        placeholder="Briefly describe your experience teaching these subjects..."
        value={data.teachingExp}
        onChange={(v) => onChange({ ...data, teachingExp: v })}
        rows={3}
      />

      <div
        style={{
          background: "#0e0c0a",
          border: "1px solid #2a2520",
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 500,
            color: "#8a8070",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 10,
          }}
        >
          Proficiency level
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {["Intermediate", "Advanced", "Expert"].map((level) => (
            <button
              key={level}
              onClick={() => onChange({ ...data, proficiency: level })}
              style={{
                flex: 1,
                background:
                  data.proficiency === level
                    ? "rgba(232,184,75,0.12)"
                    : "transparent",
                border:
                  data.proficiency === level
                    ? "1px solid rgba(232,184,75,0.35)"
                    : "1px solid #2a2520",
                borderRadius: 8,
                padding: "8px 0",
                fontSize: 12,
                color: data.proficiency === level ? "#e8b84b" : "#6a6050",
                cursor: "pointer",
                fontWeight: data.proficiency === level ? 500 : 400,
                transition: "all 0.18s",
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Qualifications ───────────────────────────────────────────────────

function StepQualifications({ data, onChange }) {
  const addQualification = () => {
    onChange({
      ...data,
      qualifications: [
        ...data.qualifications,
        { id: Date.now(), title: "", institution: "", year: "" },
      ],
    });
  };

  const updateQualification = (id, field, value) => {
    onChange({
      ...data,
      qualifications: data.qualifications.map((q) =>
        q.id === id ? { ...q, [field]: value } : q,
      ),
    });
  };

  const removeQualification = (id) => {
    onChange({
      ...data,
      qualifications: data.qualifications.filter((q) => q.id !== id),
    });
  };

  return (
    <motion.div key="step-qual" {...fadeUp}>
      <SectionHeader
        icon={Award}
        title="Your qualifications"
        subtitle="Add degrees, certifications, or any credentials that demonstrate your expertise."
      />

      <AnimatePresence>
        {data.qualifications.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "#0e0c0a",
              border: "1px solid #2a2520",
              borderRadius: 12,
              padding: "14px",
              marginBottom: 12,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#4a4438",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Qualification {i + 1}
              </span>
              {data.qualifications.length > 1 && (
                <button
                  onClick={() => removeQualification(q.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#4a4438",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#b05252")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4438")}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input
                placeholder="Degree / Certificate"
                value={q.title}
                onChange={(e) => updateQualification(q.id, "title", e.target.value)}
                style={{
                  gridColumn: "1 / -1",
                  background: "#141210",
                  border: "1px solid #2a2520",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#f5f0e8",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4a4030")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
              />
              <input
                placeholder="Institution / Organization"
                value={q.institution}
                onChange={(e) =>
                  updateQualification(q.id, "institution", e.target.value)
                }
                style={{
                  background: "#141210",
                  border: "1px solid #2a2520",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#f5f0e8",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4a4030")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
              />
              <input
                placeholder="Year (e.g. 2022)"
                value={q.year}
                onChange={(e) =>
                  updateQualification(q.id, "year", e.target.value)
                }
                style={{
                  background: "#141210",
                  border: "1px solid #2a2520",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#f5f0e8",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4a4030")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2520")}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addQualification}
        style={{
          width: "100%",
          background: "transparent",
          border: "1px dashed #2a2520",
          borderRadius: 12,
          padding: "12px",
          fontSize: 13,
          color: "#6a6050",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 20,
          transition: "all 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#4a4030";
          e.currentTarget.style.color = "#e8b84b";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2a2520";
          e.currentTarget.style.color = "#6a6050";
        }}
      >
        <Plus size={14} />
        Add another qualification
      </button>

      <Field
        label="LinkedIn / Portfolio URL (optional)"
        placeholder="https://linkedin.com/in/yourprofile"
        value={data.linkedinUrl}
        onChange={(v) => onChange({ ...data, linkedinUrl: v })}
      />
    </motion.div>
  );
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────

function StepReview({ formData }) {
  const hasSkills = formData.skills.length > 0;
  const hasQual = formData.qualifications.some((q) => q.title);

  return (
    <motion.div key="step-review" {...fadeUp}>
      <SectionHeader
        icon={CheckCircle}
        title="Review & submit"
        subtitle="Confirm your details before applying. Once submitted, our team will review your application."
      />

      <div
        style={{
          background: "#0e0c0a",
          border: "1px solid #2a2520",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {/* Skills */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #1e1c18",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#6a6050",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 10,
            }}
          >
            Skills to teach
          </div>
          {hasSkills ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {formData.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    background: "rgba(232,184,75,0.08)",
                    border: "1px solid rgba(232,184,75,0.2)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 12,
                    color: "#e8b84b",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 13, color: "#4a4438" }}>None added</span>
          )}
        </div>

        {/* Proficiency */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #1e1c18",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "#8a8070" }}>Proficiency</span>
          <span style={{ fontSize: 13, color: "#f5f0e8", fontWeight: 500 }}>
            {formData.proficiency || "Not set"}
          </span>
        </div>

        {/* Qualifications */}
        <div style={{ padding: "14px 16px" }}>
          <div
            style={{
              fontSize: 11,
              color: "#6a6050",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 10,
            }}
          >
            Qualifications
          </div>
          {hasQual ? (
            formData.qualifications
              .filter((q) => q.title)
              .map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#f5f0e8" }}>
                    {q.title}
                    {q.institution ? ` — ${q.institution}` : ""}
                  </span>
                  {q.year && (
                    <span style={{ fontSize: 12, color: "#6a6050" }}>
                      {q.year}
                    </span>
                  )}
                </div>
              ))
          ) : (
            <span style={{ fontSize: 13, color: "#4a4438" }}>None added</span>
          )}
        </div>
      </div>

      <div
        style={{
          background: "rgba(232,184,75,0.05)",
          border: "1px solid rgba(232,184,75,0.15)",
          borderRadius: 10,
          padding: "12px 14px",
          fontSize: 12,
          color: "#8a8070",
          lineHeight: 1.6,
        }}
      >
        By submitting, you confirm that the information provided is accurate. Your profile will be reviewed and{" "}
        <span style={{ color: "#e8b84b" }}>is_tutor</span> will be set to true upon approval.
      </div>
    </motion.div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ onClose }) {
  return (
    <motion.div
      key="success"
      {...fadeUp}
      style={{ textAlign: "center", padding: "12px 0 4px" }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.45, duration: 0.55 }}
        style={{
          width: 64,
          height: 64,
          background: "rgba(29,158,117,0.12)",
          border: "1px solid rgba(29,158,117,0.3)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <CheckCircle size={28} color="#1d9e75" />
      </motion.div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#f5f0e8",
          margin: "0 0 8px",
        }}
      >
        Application submitted!
      </h2>
      <p style={{ fontSize: 13, color: "#6a6050", margin: "0 0 28px", lineHeight: 1.6 }}>
        Your tutor verification is under review. You will be notified once approved. Until then, you can continue as a student.
      </p>
      <button
        onClick={onClose}
        style={{
          background: "rgba(232,184,75,0.1)",
          border: "1px solid rgba(232,184,75,0.25)",
          borderRadius: 12,
          padding: "12px 28px",
          fontSize: 14,
          color: "#e8b84b",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Got it
      </button>
    </motion.div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

const STEPS = ["Skills", "Qualifications", "Review"];

const defaultForm = {
  skills: [],
  teachingExp: "",
  proficiency: "Advanced",
  qualifications: [{ id: 1, title: "", institution: "", year: "" }],
  linkedinUrl: "",
};

const SPIN_STYLE = (
  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
);

export default function TutorVerificationModal({ open, onClose, onVerified }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const canNext = () => {
    if (step === 0) return formData.skills.length > 0;
    if (step === 1) return formData.qualifications.some((q) => q.title.trim());
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Build tutor_profile payload
      const payload = {
        skills: formData.skills,
        teaching_experience: formData.teachingExp,
        proficiency: formData.proficiency,
        qualifications: formData.qualifications.filter((q) => q.title.trim()),
        linkedin_url: formData.linkedinUrl,
        verification_status: "pending",
        submitted_at: new Date().toISOString(),
      };

      // Update profile: store tutor_profile JSONB and mark is_tutor = true
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          tutor_profile: payload,
          is_tutor: true,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setDone(true);
      onVerified?.();
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (done) {
      setStep(0);
      setFormData(defaultForm);
      setDone(false);
      setError(null);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
    {SPIN_STYLE}
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            {...overlay}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)",
            }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#141210",
                border: "1px solid #2a2520",
                borderRadius: 20,
                width: "100%",
                maxWidth: 480,
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                pointerEvents: "auto",
                boxShadow:
                  "0 24px 64px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px 16px",
                  borderBottom: "1px solid #1e1c18",
                  flexShrink: 0,
                }}
              >
                <div>
                  {!done && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#6a6050",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        margin: "0 0 4px",
                      }}
                    >
                      Step {step + 1} of {STEPS.length} — {STEPS[step]}
                    </p>
                  )}
                  <h1
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#f5f0e8",
                      margin: 0,
                    }}
                  >
                    {done ? "Verification submitted" : "Become a Tutor"}
                  </h1>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {!done && <StepDots current={step} total={STEPS.length} />}
                  <button
                    onClick={handleClose}
                    style={{
                      background: "#1e1c18",
                      border: "1px solid #2a2520",
                      borderRadius: 8,
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#6a6050",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#c8bfb0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6a6050")
                    }
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px 20px 8px",
                }}
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <SuccessScreen onClose={handleClose} />
                  ) : step === 0 ? (
                    <StepSkills data={formData} onChange={setFormData} />
                  ) : step === 1 ? (
                    <StepQualifications data={formData} onChange={setFormData} />
                  ) : (
                    <StepReview formData={formData} />
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {!done && (
                <div
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #1e1c18",
                    flexShrink: 0,
                    display: "flex",
                    gap: 10,
                    flexDirection: "column",
                  }}
                >
                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(176,82,82,0.1)",
                        border: "1px solid rgba(176,82,82,0.25)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: "#b05252",
                      }}
                    >
                      <AlertCircle size={13} />
                      {error}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    {step > 0 && (
                      <button
                        onClick={handleBack}
                        style={{
                          background: "transparent",
                          border: "1px solid #2a2520",
                          borderRadius: 12,
                          padding: "11px 20px",
                          fontSize: 13,
                          color: "#8a8070",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={
                        step === STEPS.length - 1 ? handleSubmit : handleNext
                      }
                      disabled={!canNext() || submitting}
                      style={{
                        flex: 1,
                        background:
                          canNext() && !submitting
                            ? "#e8b84b"
                            : "rgba(232,184,75,0.2)",
                        border: "none",
                        borderRadius: 12,
                        padding: "11px 20px",
                        fontSize: 13,
                        color:
                          canNext() && !submitting
                            ? "#0e0c0a"
                            : "rgba(232,184,75,0.4)",
                        cursor:
                          canNext() && !submitting ? "pointer" : "not-allowed",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.18s",
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          Submitting...
                        </>
                      ) : step === STEPS.length - 1 ? (
                        "Submit application"
                      ) : (
                        <>
                          Continue
                          <ChevronRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
