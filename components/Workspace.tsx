"use client";

import React from "react";
import { motion } from "motion/react";
import Navbar from "./Navbar";

interface WorkspaceProps {
  children: React.ReactNode;
  id?: string;
}

export default function Workspace({ children, id = "workspace_layout" }: WorkspaceProps) {
  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans selection:bg-indigo-100" id={id}>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        id={`${id}_main_frame`}
      >
        {children}
      </motion.main>
    </div>
  );
}
