"use client";

import { motion } from "framer-motion";
import React from "react";

export const GlobalBackground = () => (
  <div className="fixed inset-0 -z-10 bg-[#f4f5f7] overflow-hidden pointer-events-none">
    <motion.div
      animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] right-[-10%] w-[60rem] h-[60rem] bg-blue-100/40 rounded-full blur-[80px] will-change-transform"
    />
    <motion.div
      animate={{ x: [0, -150, 150, 0], y: [0, 150, -150, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[20%] left-[-15%] w-[50rem] h-[50rem] bg-slate-200/50 rounded-full blur-[80px] will-change-transform"
    />
    <motion.div
      animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] right-[15%] w-[65rem] h-[65rem] bg-slate-300/40 rounded-full blur-[100px] will-change-transform"
    />
    <motion.div
      animate={{ x: [0, -80, 80, 0], y: [0, 120, -120, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[20%] left-[10%] w-[45rem] h-[45rem] bg-white/60 rounded-full blur-[80px] will-change-transform"
    />
  </div>
);
