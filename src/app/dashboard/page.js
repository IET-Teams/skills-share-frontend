"use client";

import { signOut } from "@/app/action";
import React from "react";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1>Dashboard Page</h1>
      <h6>In Progress...</h6>
      <div className="flex justify-center">
        <button
          onClick={() => signOut()}
          className="bg-amber-400 text-[#0e0c0a] font-medium px-7 py-3 rounded-xl text-sm hover:bg-amber-300 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
