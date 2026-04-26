"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createBrowserClient } from "@supabase/ssr";

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState("student"); // "student" | "tutor"
  const [ready, setReady] = useState(false);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
    [],
  );

  // Hydrate from backend profile role first, with localStorage fallback
  useEffect(() => {
    let alive = true;

    async function bootstrapRole() {
      const saved = localStorage.getItem("sb_role");
      let nextRole = saved === "student" || saved === "tutor" ? saved : "student";

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          const profileRole = profile?.role;
          if (profileRole === "student" || profileRole === "tutor") {
            nextRole = profileRole;
          }
        }
      } catch (error) {
        console.error("Role bootstrap failed:", error);
      } finally {
        if (!alive) return;
        setRoleState(nextRole);
        localStorage.setItem("sb_role", nextRole);
        setReady(true);
      }
    }

    bootstrapRole();

    return () => {
      alive = false;
    };
  }, [supabase]);

  const setRole = useCallback(async (r) => {
    if (r !== "student" && r !== "tutor") return;
    setRoleState(r);
    localStorage.setItem("sb_role", r);

    // Dispatch a custom event so any non-context listener can react.
    window.dispatchEvent(new CustomEvent("sb_role_change", { detail: r }));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").update({ role: r }).eq("id", user.id);
    } catch (error) {
      console.error("Role sync failed:", error);
    }
  }, [supabase]);

  // Avoid role flicker while loading persisted role.
  if (!ready) return null;

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
