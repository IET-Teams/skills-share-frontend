// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { RoleProvider } from "@/context/RoleContext"; // Added this import

const InterFont = Inter({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "SkillBridge",
    template: "%s | SkillBridge",
  },
  description: "Learn and teach skills with peers",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${InterFont.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Wrapped here */}
        <RoleProvider>
          <Navbar CURRENT_USER={user}>{children}</Navbar>
        </RoleProvider>
      </body>
    </html>
  );
}
