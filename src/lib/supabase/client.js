import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
};

export const supabaseSignOut = async () => {
  await supabase.auth.signOut();
};

