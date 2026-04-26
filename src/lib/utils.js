import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


// utils/grantChatAccess.js
export async function grantChatAccess(supabase, currentUserId, partnerUserId) {
  // Add partnerUserId to current user's chat_access (if not already "all")
  const { data: profile } = await supabase
    .from("profiles")
    .select("chat_access")
    .eq("id", currentUserId)
    .single();

  const current = profile?.chat_access || [];

  // Don't modify if already public
  if (current.includes("all")) return;

  // Add partner if not already there
  if (!current.includes(partnerUserId)) {
    await supabase
      .from("profiles")
      .update({ chat_access: [...current, partnerUserId] })
      .eq("id", currentUserId);
  }
}