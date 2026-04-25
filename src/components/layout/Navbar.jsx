"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard,
  User,
  Compass,
  CalendarCheck,
  Briefcase,
  MessageCircle,
  LogOut,
  ChevronRight,
  Zap,
  Bell,
  Settings,
  X,
  Menu,
} from "lucide-react";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/internships", icon: Briefcase, label: "Internships" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SB"
  );
}

function isActive(pathname, href) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar({ profile, pathname, onLogout, unreadCount }) {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const initials = getInitials(profile?.name);

  // Close user menu on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ type: "spring", damping: 28, stiffness: 240 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden"
      style={{
        background: "#0a0908",
        borderRight: "1px solid #1e1c18",
      }}
    >
      {/* Logo row */}
      <div
        className="flex h-14 items-center px-4"
        style={{ borderBottom: "1px solid #1a1814" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          {/* Logo mark */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(232,184,75,0.25) 0%, rgba(232,184,75,0.08) 100%)",
              border: "1px solid rgba(232,184,75,0.2)",
            }}
          >
            <Zap size={14} style={{ color: "#e8b84b" }} />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="text-sm font-medium truncate"
                style={{ color: "#f5f0e8" }}
              >
                SkillBridge
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse toggle */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ color: "#3a342c" }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronRight size={13} />
          </motion.div>
        </motion.button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          const isChatWithBadge = href === "/chat" && unreadCount > 0;

          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: active ? "rgba(232,184,75,0.08)" : "transparent",
                  color: active ? "#e8b84b" : "#6a6050",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  if (!active) e.currentTarget.style.color = "#c8bfb0";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                  if (!active) e.currentTarget.style.color = "#6a6050";
                }}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                    style={{ background: "#e8b84b" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}

                <div className="relative shrink-0">
                  <Icon size={16} />
                  {isChatWithBadge && (
                    <span
                      className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-xs"
                      style={{
                        background: "#e8b84b",
                        color: "#0e0c0a",
                        fontSize: 8,
                        fontWeight: 600,
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="truncate text-sm"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div
                    className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    style={{
                      background: "#1a1814",
                      color: "#f5f0e8",
                      border: "1px solid #2a2520",
                    }}
                  >
                    {label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-1" style={{ borderTop: "1px solid #1a1814" }} />

      {/* User section */}
      <div className="relative px-2 pb-3" ref={menuRef}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
          style={{ color: "#6a6050" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.color = "#c8bfb0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#6a6050";
          }}
        >
          {/* Avatar */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-7 w-7 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium"
              style={{ background: "rgba(232,184,75,0.12)", color: "#e8b84b" }}
            >
              {initials}
            </div>
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1 text-left"
              >
                <p
                  className="truncate text-xs font-medium"
                  style={{ color: "#c8bfb0" }}
                >
                  {profile?.name || "Student"}
                </p>
                <p className="truncate text-xs" style={{ color: "#4a4438" }}>
                  {profile?.department?.split("·")[0]?.trim() || "Campus"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User dropdown */}
        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border py-1 shadow-2xl"
              style={{ background: "#141210", borderColor: "#2a2520" }}
            >
              {/* Profile header */}
              <div
                className="flex items-center gap-2.5 px-3 py-2.5"
                style={{ borderBottom: "1px solid #1a1814" }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium"
                    style={{
                      background: "rgba(232,184,75,0.12)",
                      color: "#e8b84b",
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className="truncate text-xs font-medium"
                    style={{ color: "#f5f0e8" }}
                  >
                    {profile?.name || "Student"}
                  </p>
                  <p className="truncate text-xs" style={{ color: "#4a4438" }}>
                    {profile?.department || ""}
                  </p>
                </div>
              </div>

              {[
                { href: "/profile", icon: User, label: "View profile" },
                {
                  href: "/profile?tab=settings",
                  icon: Settings,
                  label: "Settings",
                },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors"
                    style={{ color: "#8a8070" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = "#c8bfb0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#8a8070";
                    }}
                  >
                    <Icon size={13} />
                    {label}
                  </div>
                </Link>
              ))}

              <div
                style={{ borderTop: "1px solid #1a1814" }}
                className="mt-1 pt-1"
              >
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs transition-colors"
                  style={{ color: "#8a8070" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#b05252";
                    e.currentTarget.style.background = "rgba(176,82,82,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#8a8070";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ pathname, unreadCount }) {
  // Show 5 main items on mobile
  const mobileItems = NAV_ITEMS.slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center px-2 pb-safe"
      style={{
        background: "rgba(10,9,8,0.96)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid #1a1814",
        height: 60,
      }}
    >
      {mobileItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href);
        const isChatWithBadge = href === "/chat" && unreadCount > 0;

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
          >
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center gap-0.5"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-all"
                style={{
                  background: active ? "rgba(232,184,75,0.12)" : "transparent",
                }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? "#e8b84b" : "#4a4438" }}
                />
                {isChatWithBadge && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                    style={{
                      background: "#e8b84b",
                      color: "#0e0c0a",
                      fontSize: 8,
                      fontWeight: 600,
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className="text-xs"
                style={{ color: active ? "#e8b84b" : "#3a342c", fontSize: 10 }}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute -bottom-1 h-0.5 w-4 rounded-full"
                  style={{ background: "#e8b84b" }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
function MobileTopBar({ profile, pathname, onLogout, unreadCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = getInitials(profile?.name);

  const currentPage = NAV_ITEMS.find((n) => isActive(pathname, n.href));

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between px-4"
        style={{
          background: "rgba(10,9,8,0.96)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1a1814",
        }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "rgba(232,184,75,0.12)",
              border: "1px solid rgba(232,184,75,0.18)",
            }}
          >
            <Zap size={12} style={{ color: "#e8b84b" }} />
          </div>
          <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {currentPage?.label || "SkillBridge"}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg">
            <Bell size={15} style={{ color: "#6a6050" }} />
            {unreadCount > 0 && (
              <span
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                style={{ background: "#e8b84b" }}
              />
            )}
          </button>

          {/* Avatar / menu */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "rgba(232,184,75,0.08)" }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <span
                className="text-xs font-medium"
                style={{ color: "#e8b84b" }}
              >
                {initials}
              </span>
            )}
          </motion.button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col"
              style={{ background: "#0a0908", borderLeft: "1px solid #1e1c18" }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #1a1814" }}
              >
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium"
                      style={{
                        background: "rgba(232,184,75,0.12)",
                        color: "#e8b84b",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#f5f0e8" }}
                    >
                      {profile?.name || "Student"}
                    </p>
                    <p className="text-xs" style={{ color: "#4a4438" }}>
                      {profile?.department?.split("·")[0]?.trim() || "Campus"}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "#141210" }}
                >
                  <X size={14} style={{ color: "#8a8070" }} />
                </motion.button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                        style={{
                          background: active
                            ? "rgba(232,184,75,0.08)"
                            : "transparent",
                          color: active ? "#e8b84b" : "#8a8070",
                          borderLeft: active
                            ? "2px solid #e8b84b"
                            : "2px solid transparent",
                        }}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{label}</span>
                        {href === "/chat" && unreadCount > 0 && (
                          <span
                            className="ml-auto rounded-full px-1.5 py-0.5 text-xs font-medium"
                            style={{ background: "#e8b84b", color: "#0e0c0a" }}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom actions */}
              <div
                className="border-t px-3 py-3 space-y-0.5"
                style={{ borderColor: "#1a1814" }}
              >
                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                    style={{ color: "#6a6050" }}
                  >
                    <Settings size={15} />
                    Settings
                  </div>
                </Link>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                  style={{ color: "#6a6050" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#b05252";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#6a6050";
                  }}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Navbar export ───────────────────────────────────────────────────────
export default function Navbar({ CURRENT_USER, children }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // ── Detect mobile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  // useEffect(() => {
  //   async function loadProfile() {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     if (!user) return;

  //     const { data } = await supabase
  //       .from("profiles")
  //       .select("id, name, department, avatar_url")
  //       .eq("id", user.id)
  //       .single();

  //     setProfile(data);
  //   }
  //   loadProfile();
  // }, [supabase]);

  // ── Unread messages count (realtime) ──────────────────────────────────────
  useEffect(() => {
    async function loadUnread() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("read", false);

      setUnreadCount(count || 0);

      // Subscribe to new messages
      const channel = supabase
        .channel("unread-messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${user.id}`,
          },
          () => setUnreadCount((c) => c + 1),
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
    loadUnread();
  }, [supabase]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Don't render on auth pages
  const shouldRender = pathname !== "/" && pathname !== "/login";
  // const isAuthPage = pathname?.startsWith("/login") || (!pathname?.startsWith("/main") && pathname !== "/");

  if (!shouldRender || !CURRENT_USER) return <>{children}</>;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#0e0c0a" }}>
      {isMobile ? (
        <>
          <MobileTopBar
            profile={profile}
            pathname={pathname}
            onLogout={handleLogout}
            unreadCount={unreadCount}
          />
          <main className="pb-16 pt-14">{children}</main>
          <MobileBottomNav pathname={pathname} unreadCount={unreadCount} />
        </>
      ) : (
        <div className="flex">
          <DesktopSidebar
            profile={profile}
            pathname={pathname}
            onLogout={handleLogout}
            unreadCount={unreadCount}
          />
          {/* Offset content by sidebar width — 220px expanded, 68px collapsed */}
          <main
            className="flex-1 transition-all duration-300"
            style={{ marginLeft: 220 }}
          >
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
