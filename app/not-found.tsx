"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlobalBackground } from "@/components/GlobalBackground";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden">
      <GlobalBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative z-10 text-center px-6 max-w-xl mx-auto"
      >
        {/* Floating icon */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-white/40 backdrop-blur-[20px] border border-white/60 shadow-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8"
        >
          <Compass className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
        </motion.div>

        {/* 404 */}
        <h1 className="text-[10rem] font-black tracking-tighter leading-none text-neutral-900 mb-2 select-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-slate-700">
            404
          </span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-800 mb-4">
          Lost in the Vault
        </h2>
        <p className="text-neutral-500 font-medium text-lg mb-10 leading-relaxed">
          This page doesn&apos;t exist — or it was moved. Let&apos;s get you
          back to the good stuff.
        </p>

        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 bg-neutral-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all"
          >
            <ArrowLeft size={18} />
            Back to Portfolio
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
