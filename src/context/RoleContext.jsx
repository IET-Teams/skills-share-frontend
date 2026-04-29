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
  const [isTutor, setIsTutor] = useState(false);    // is_tutor from profiles table
  const [ready, setReady] = useState(false);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
    [],
  );

  // Hydrate from backend profile; also fetch is_tutor flag
  useEffect(() => {
    let alive = true;

    async function bootstrapRole() {
      const saved = localStorage.getItem("sb_role");
      let nextRole = saved === "student" || saved === "tutor" ? saved : "student";
      let tutorFlag = false;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, is_tutor")
            .eq("id", user.id)
            .maybeSingle();

          const profileRole = profile?.role;
          if (profileRole === "student" || profileRole === "tutor") {
            nextRole = profileRole;
          }

          tutorFlag = profile?.is_tutor === true;

          // If is_tutor was revoked but role is still "tutor", downgrade
          if (!tutorFlag && nextRole === "tutor") {
            nextRole = "student";
          }
        }
      } catch (error) {
        console.error("Role bootstrap failed:", error);
      } finally {
        if (!alive) return;
        setIsTutor(tutorFlag);
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

  /**
   * setRole — switches active role.
   * If switching to "tutor" but is_tutor is false, returns false so the
   * caller can open the verification modal instead.
   */
  const setRole = useCallback(
    async (r) => {
      if (r !== "student" && r !== "tutor") return true;

      // Guard: tutor mode requires is_tutor === true
      if (r === "tutor" && !isTutor) {
        return false; // signal: show verification modal
      }

      setRoleState(r);
      localStorage.setItem("sb_role", r);
      window.dispatchEvent(new CustomEvent("sb_role_change", { detail: r }));

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return true;
        await supabase.from("profiles").update({ role: r }).eq("id", user.id);
      } catch (error) {
        console.error("Role sync failed:", error);
      }

      return true;
    },
    [supabase, isTutor],
  );

  /**
   * refreshIsTutor — called after successful verification submission so the
   * context picks up the updated is_tutor value without a full page reload.
   */
  const refreshIsTutor = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_tutor")
        .eq("id", user.id)
        .maybeSingle();

      setIsTutor(profile?.is_tutor === true);
    } catch (error) {
      console.error("refreshIsTutor failed:", error);
    }
  }, [supabase]);

  // Avoid role flicker while loading persisted role.
  if (!ready) return null;

  return (
    <RoleContext.Provider value={{ role, setRole, isTutor, refreshIsTutor }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
