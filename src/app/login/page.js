"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EyeIcon, EyedropperIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  forgotPassword,
  signInWithEmail,
  signInWithGoogle,
} from "@/app/action";

const features = [
  "Teach skills you know to earn campus reputation",
  "Learn from peers through one-on-one sessions",
  "Discover internships posted within the community",
  "Real-time chat and session scheduling built in",
];

const avatars = [
  { initials: "AR", color: "bg-amber-500/20 text-amber-400" },
  { initials: "NP", color: "bg-emerald-500/20 text-emerald-400" },
  { initials: "KM", color: "bg-violet-500/20 text-violet-400" },
  { initials: "SR", color: "bg-orange-500/20 text-orange-400" },
];

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupDOB, setSignupDOB] = useState("");

  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const [googleLoginActionState, googleLoginAction] =
    useActionState(signInWithGoogle);

  const [resetPasswordActionState, resetPasswordAction] =
    useActionState(forgotPassword);

  // ── Google OAuth ──
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    // signInWithGoogle()
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  // ── Email Login ──
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // 🔥 IMPORTANT: force session refresh
    await supabase.auth.getSession();

    // Small delay helps cookie propagation (optional but useful)
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh(); // 🔥 important for SSR
    }, 100);

    setLoading(false);
  };

  // ── Email Signup ──
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName, dob: signupDOB, phone: signupPhone },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/profile?setup=true");
    }
    setLoading(false);
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  };

  const [forgotState, setForgotState] = useState(false);

  return (
    <div className="min-h-screen bg-[#0e0c0a] grid grid-cols-1 md:grid-cols-2 font-sans">
      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-col justify-between bg-[#0a0908] border-r border-[#2a2520] p-12">
        {/* Logo */}
        <span className="text-lg font-medium text-amber-400">
          Skill<span className="text-[#f5f0e8]">Bridge</span>
        </span>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Avatar row */}
          <div className="flex items-center mb-6">
            {avatars.map((av, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-[#0a0908] -mr-1.5 ${av.color}`}
                style={{ zIndex: avatars.length - i }}
              >
                {av.initials}
              </div>
            ))}
            <span className="ml-5 text-xs text-[#6a6050]">
              480+ students active
            </span>
          </div>

          <h2 className="text-2xl font-medium text-[#f5f0e8] leading-tight tracking-tight mb-6">
            Your campus community
            <br />
            for <span className="text-amber-400">learning</span> &amp;
            <br />
            <span className="text-amber-400">growing together</span>
          </h2>

          <div className="flex flex-col gap-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-sm text-[#8a8070] leading-relaxed">
                  {f}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <span className="text-xs text-[#3a3428]">
          © 2025 SkillBridge · Campus Platform
        </span>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <span className="text-xl font-medium text-amber-400">
              Skill<span className="text-[#f5f0e8]">Bridge</span>
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[#141210] border border-[#2a2520] rounded-xl p-1 mb-8">
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                className={`flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
                  tab === t
                    ? "bg-[#1e1a14] text-amber-400 "
                    : "text-[#6a6050] hover:text-[#a09880]"
                }`}
              >
                {t === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Error message */}
          {forgotState && (
            <AnimatePresence>
              {resetPasswordActionState?.success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-lg mb-4"
                >
                  {resetPasswordActionState?.success}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {forgotState && (
            <AnimatePresence>
              {resetPasswordActionState?.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-4"
                >
                  {resetPasswordActionState?.error}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Panels */}
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h1 className="text-xl font-medium text-[#f5f0e8] mb-1 tracking-tight">
                  {forgotState ? "Forgot Password" : "Welcome back"}
                </h1>
                <p className="text-sm text-[#6a6050] mb-6">
                  {forgotState
                    ? "Enter Email to reset password"
                    : "Sign in to your SkillBridge account"}
                </p>

                {/* Google Button */}
                {!forgotState && (
                  <>
                    <form action={googleLoginAction}>
                      <input
                        type="hidden"
                        name="next"
                        value={searchParams.next || "/dashboard"}
                      />
                      <GoogleButton
                        state={googleLoginActionState}
                        label="Sign up with Google"
                      />
                    </form>
                    <Divider />
                  </>
                )}

                {forgotState ? (
                  <form
                    // onSubmit={handleEmailLogin}
                    action={resetPasswordAction}
                    className="flex flex-col gap-4"
                  >
                    <FormField
                      label="Email address"
                      type="email"
                      name="email"
                      placeholder="you@college.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <SubmitButton loading={loading} label="Reset Password" />
                  </form>
                ) : (
                  <form
                    // onSubmit={handleEmailLogin}
                    action={signInWithEmail}
                    className="flex flex-col gap-4"
                  >
                    <FormField
                      label="Email address"
                      type="email"
                      name="email"
                      placeholder="you@college.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <div>
                      <FormField
                        label="Password"
                        name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="text-[#4a4438] hover:text-amber-400 transition-colors"
                          >
                            {showPass ? (
                              <EyedropperIcon size={15} />
                            ) : (
                              <EyeIcon size={15} />
                            )}
                          </button>
                        }
                      />
                      <div
                        className="text-right mt-1"
                        onClick={() => setForgotState(true)}
                      >
                        <span className="text-xs text-[#6a6050] hover:text-amber-400 cursor-pointer transition-colors">
                          Forgot password?
                        </span>
                      </div>
                    </div>

                    <SubmitButton loading={loading} label="Sign in" />
                  </form>
                )}

                <p className="text-center text-xs text-[#6a6050] mt-4">
                  No account?{" "}
                  <button
                    onClick={() => setTab("signup")}
                    className="text-amber-400 hover:underline"
                  >
                    Create one free
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h1 className="text-xl font-medium text-[#f5f0e8] mb-1 tracking-tight">
                  Create account
                </h1>
                <p className="text-sm text-[#6a6050] mb-6">
                  {`Join SkillBridge — it's free`}
                </p>

                <form action={googleLoginAction}>
                  <input
                    type="hidden"
                    name="next"
                    value={searchParams.next || "/dashboard"}
                  />
                  <GoogleButton
                    state={googleLoginActionState}
                    label="Sign up with Google"
                  />
                </form>

                <Divider />

                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  <FormField
                    label="Full name"
                    type="text"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                  <FormField
                    label="Email address"
                    type="email"
                    placeholder="you@college.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                  <FormField
                    label="Password"
                    type={showSignupPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowSignupPass(!showSignupPass)}
                        className="text-[#4a4438] hover:text-amber-400 transition-colors"
                      >
                        {showSignupPass ? (
                          <EyedropperIcon size={15} />
                        ) : (
                          <EyeIcon size={15} />
                        )}
                      </button>
                    }
                  />
                  <FormField
                    label="Phone No."
                    type="text"
                    placeholder="Your Phone no."
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                  />
                  <FormField
                    label="DOB"
                    type="date"
                    placeholder="Your DOB"
                    value={signupDOB}
                    onChange={(e) => setSignupDOB(e.target.value)}
                  />

                  <SubmitButton loading={loading} label="Create account" />
                </form>

                <p className="text-center text-xs text-[#6a6050] mt-4">
                  Already have an account?{" "}
                  <button
                    onClick={() => setTab("login")}
                    className="text-amber-400 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ──

function GoogleButton({ state, label }) {
  return (
    <motion.button
      type="submit"
      disabled={state?.error}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-2.5 bg-[#f5f0e8] hover:bg-white text-[#1a1610] font-medium text-sm py-3 rounded-xl transition-colors mb-5 disabled:opacity-60"
    >
      {state?.error ? (
        <svg
          className="animate-spin w-4 h-4 text-[#1a1610]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.1-6.1C34.46 3.14 29.53 1 24 1 14.82 1 7.07 6.48 3.72 14.23l7.12 5.53C12.5 13.67 17.79 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.7c-.55 2.97-2.2 5.48-4.69 7.17l7.18 5.58C43.46 37.26 46.52 31.38 46.52 24.5z"
          />
          <path
            fill="#FBBC05"
            d="M10.84 28.76A14.59 14.59 0 019.5 24c0-1.66.28-3.27.77-4.77l-7.12-5.53A23.93 23.93 0 001 24c0 3.86.92 7.51 2.55 10.73l7.29-5.97z"
          />
          <path
            fill="#34A853"
            d="M24 47c5.52 0 10.16-1.83 13.55-4.97l-7.18-5.58C28.6 37.84 26.41 38.5 24 38.5c-6.21 0-11.5-4.17-13.16-9.74l-7.29 5.97C7.07 42.52 14.82 47 24 47z"
          />
        </svg>
      )}
      {state?.error ? "Redirecting..." : label}
    </motion.button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-[#2a2520]" />
      <span className="text-xs text-[#4a4438]">or continue with email</span>
      <div className="flex-1 h-px bg-[#2a2520]" />
    </div>
  );
}

function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  suffix,
  name,
}) {
  return (
    <div>
      <label className="block text-xs text-[#8a8070] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-[#141210] border border-[#2a2520] rounded-xl px-3.5 py-2.5 text-sm text-[#f5f0e8] placeholder-[#4a4438] outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
          style={{ paddingRight: suffix ? "38px" : undefined }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-amber-400 hover:bg-amber-300 text-[#0e0c0a] font-medium text-sm py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      {loading ? "Please wait..." : label}
    </motion.button>
  );
}
