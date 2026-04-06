"use client";

import { motion } from "framer-motion";
import { 
  Rocket, 
  Users, 
  Briefcase, 
  ArrowRight
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

/**
 * THE ULTIMATE GLASS RECIPE
 * Applied strictly globally for 100% pure refraction.
 */
const glassBase = "bg-white/30 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem]";
const glassHover = "transition-all duration-500 hover:scale-[1.03] hover:bg-white/40 hover:shadow-[0_12px_45px_0_rgba(31,38,135,0.1)] cursor-pointer";
const glassCard = `${glassBase} ${glassHover}`;

const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20
};

import Link from 'next/link';
import { GlobalBackground } from '@/components/GlobalBackground';

/**
 * EDITORIAL MASTERPIECE PHOTO
 * A stunning, deep-layered squircle frame with intrinsic glow.
 */
const EditorialPhoto = ({ src }: { src: string | null }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center z-20 mt-10 lg:mt-0">
      {/* Absolute Glowing Blur */}
      <div className="absolute inset-4 bg-slate-300/40 rounded-[3rem] blur-2xl" />
      
      {/* Floating Container */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative w-full h-full rounded-[3rem] border-[8px] border-white/40 backdrop-blur-3xl shadow-xl p-2 ${glassBase}`}
      >
        {/* Image Mask */}
        <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-neutral-100 shadow-inner relative flex items-center justify-center">
          {src ? (
            <>
              <motion.img 
                src={src} 
                alt="Zeyad Mandor" 
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                onLoad={() => setLoaded(true)}
                className="w-full h-full object-cover absolute inset-0 z-10"
              />
              {/* Fallback while loading */}
              {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-white to-slate-300 animate-pulse z-0" />}
            </>
          ) : (
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-slate-200 via-white to-slate-300 animate-pulse z-0" />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function Portfolio() {
  const [articles, setArticles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: artData } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (artData) setArticles(artData);

      const { data: settsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (settsData) setSettings(settsData);
    };
    fetchData();
  }, []);

  // Update Favicon dynamically
  useEffect(() => {
    if (settings?.profile_image_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.profile_image_url;
    }
  }, [settings?.profile_image_url]);

  return (
    <div className="relative w-full text-neutral-900 pb-32 font-sans selection:bg-blue-500/20 selection:text-neutral-900 overflow-hidden">
      <GlobalBackground />
      
      {/* 1. THE INTELLIGENT HEADER */}
      <motion.nav 
        initial={{ y: -50, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={springConfig}
        className={`fixed top-6 left-1/2 z-50 px-3 py-2 flex items-center bg-white/30 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] !rounded-full`}
      >
        <div className="flex items-center gap-8 px-6 hidden sm:flex">
          {['Projects', 'Vault', 'Journey'].map((item) => (
            <motion.a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </div>
        <motion.a 
          href={settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}` : '#'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 sm:ml-6 bg-neutral-900 text-white rounded-full px-7 py-3 text-[13px] font-extrabold tracking-wide uppercase shadow-[0_4px_14px_0_inherit] hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 transition-all duration-300 inline-block text-center"
        >
          Let's Talk
        </motion.a>
      </motion.nav>

      <main className="container mx-auto px-6 max-w-7xl relative z-10 pt-48">
        
        {/* 2. THE HERO SECTION */}
        <section id="home" className="min-h-[80vh] flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-16 pb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springConfig, duration: 1 }}
            className="flex-1 text-center md:text-left z-10 mt-6 md:mt-0"
          >
            <h2 className="text-2xl text-neutral-600 font-medium tracking-wide mb-2">
              Hello, I am
            </h2>
            <h1 className="text-7xl md:text-9xl font-black text-neutral-900 tracking-tighter leading-[0.95] mb-6">
              Zeyad <br className="hidden md:block" />
              Mandor
            </h1>
            <h3 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-slate-800 mb-8 max-w-3xl">
              Build what they actually need. <br className="hidden md:block" />
              Hack how they find it.
            </h3>
            <p className="text-lg md:text-xl text-neutral-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              18-year-old Tech Founder, Digital Marketing Specialist, and 3rd-year high school student from Egypt. Scaling B2B SaaS and startups through Growth Hacking and Zero Ad Spend.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springConfig, delay: 0.2 }}
            className="flex-1 flex justify-center md:justify-end"
          >
            <EditorialPhoto src={settings?.profile_image_url || null} />
          </motion.div>
        </section>

        {/* 3. THE ECOSYSTEM (BENTO GRID) */}
        <section id="projects" className="py-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20 text-center lg:text-left"
          >
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 mb-6">The Ecosystem</h2>
            <p className="text-2xl text-neutral-600 font-medium">B2B mechanics. Organic velocity.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[auto]">
            
            {/* Card 1: Edour (Large Span) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`md:col-span-12 lg:col-span-8 p-12 flex flex-col justify-between ${glassCard} group min-h-[400px]`}
            >
              <div className="flex items-start justify-between">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-10 text-white bg-blue-600 shadow-lg">
                  <Rocket size={34} strokeWidth={2.5} />
                </div>
                <ArrowRight className="text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-3 transition-transform duration-300" size={32} />
              </div>
              <div>
                <h3 className="text-5xl font-black tracking-tighter text-neutral-900 mb-2">Edour</h3>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 font-bold uppercase tracking-widest text-xs rounded-full mb-6">
                  CEO & Founder (2024-Present)
                </span>
                <p className="text-2xl text-neutral-600 font-medium leading-relaxed">
                  B2B SaaS for educators allowing them to build academies in 5 minutes.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Lazy Code (Tall) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`md:col-span-12 lg:col-span-4 p-12 flex flex-col justify-between ${glassCard} min-h-[400px]`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 text-white bg-indigo-600 shadow-lg">
                <Users size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-neutral-900 mb-2">Lazy Code</h3>
                <span className="inline-flex px-4 py-2 bg-indigo-100 text-indigo-800 font-bold uppercase tracking-widest text-xs rounded-full mb-6">
                  Co-Founder & Head of Marketing (Jan 2026-Present)
                </span>
                <p className="text-xl text-neutral-600 font-medium leading-relaxed">
                  Educational NGO for youth.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Nexus Team */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`md:col-span-12 p-12 flex flex-col lg:flex-row justify-between lg:items-center gap-10 ${glassCard}`}
            >
              <div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 lg:mb-0 text-white bg-teal-600 shadow-lg">
                  <Briefcase size={28} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-black tracking-tighter text-neutral-900 mb-2">Nexus Team</h3>
                <span className="inline-block px-4 py-2 bg-teal-100 text-teal-800 font-bold uppercase tracking-widest text-xs rounded-full mb-4">
                  Marketing Specialist (2024-2025)
                </span>
                <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed max-w-4xl">
                  B2B Content Marketing and organic lead gen.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 4. THE KNOWLEDGE HUB (Articles & Resources) */}
        <section id="vault" className="py-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-8">The Founder's Vault</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <Link href={`/articles/${article.id}`} key={i}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...springConfig, delay: i * 0.1 }}
                  className={`p-6 flex flex-col justify-between h-full bg-white/30 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem] hover:scale-[1.02] hover:-translate-y-2 hover:bg-white/40 transition-all duration-500 cursor-pointer`}
                >
                  {/* Image Placeholder */}
                  {article.image_url ? (
                    <div className="w-full rounded-2xl h-48 mb-6 overflow-hidden">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full bg-black/5 rounded-2xl h-48 mb-6 shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 pointer-events-none" />
                    </div>
                  )}
                  
                  <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-2">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-bold text-neutral-900 leading-tight mb-3">
                      {article.title}
                    </h3>
                    <div className="mt-auto mb-2 pt-2 text-sm text-neutral-500 font-medium">
                      {article.content?.substring(0, 80)}...
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. THE INTERACTIVE JOURNEY (Vertical Glass Path) */}
        <section id="journey" className="py-32 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-32"
          >
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 mb-6">The Journey</h2>
            <p className="text-2xl text-neutral-600 font-medium">Evolution mapped in pure execution.</p>
          </motion.div>

          <div className="relative pl-10 md:pl-20">
            
            {/* The Path */}
            <div className="absolute top-6 bottom-0 left-[24px] md:left-[39px] w-1.5 bg-white/60 blur-[1px] shadow-inner" />
            <div className="absolute top-6 bottom-0 left-[25.5px] md:left-[40.5px] w-px bg-neutral-300" />

            {[
              { year: "2023", title: "Sidi Gazy School", desc: "The beginning of the entrepreneurial spark." },
              { year: "2024", title: "Nexus Team", desc: "Execution and closing inside Nexus Team." },
              { year: "2025", title: "Edour Launch", desc: "Scaling educational infrastructure organically." },
              { year: "2026", title: "Lazy Code", desc: "Empowering youth with foundational logic and growth tactics." }
            ].map((node, i) => (
              <div key={i} className="relative mb-20 last:mb-0 group">
                
                {/* Popping Node */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={springConfig}
                  className="absolute left-[-26px] md:left-[-60px] top-4 md:top-6 w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/80 backdrop-blur-md shadow-2xl border-4 border-white flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110"
                >
                  <div className="w-3 h-3 md:w-5 md:h-5 bg-blue-600 rounded-full" />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`ml-10 md:ml-16 p-10 md:p-14 ${glassCard}`}
                >
                  <span className="inline-block px-5 py-2 bg-neutral-900 text-white font-black tracking-widest text-sm uppercase rounded-full mb-6 shadow-md">
                    {node.year}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 mb-4">{node.title}</h3>
                  <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed">
                    {node.desc}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

      </main>
      
      {/* 6. FLOATING SOCIAL DOCK */}
      {settings && (
        <motion.div 
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          className={`fixed bottom-6 left-1/2 z-50 px-6 py-4 flex items-center gap-6 bg-white/30 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-full`}
        >
          {settings.linkedin_url && (
            <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-blue-600 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          )}
          {settings.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-pink-600 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          )}
          {settings.facebook_url && (
            <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-blue-800 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          )}
        </motion.div>
      )}

      <footer className="mt-20 pb-20 text-center relative z-10">
        <p className="text-neutral-500 font-bold tracking-widest uppercase text-sm">
          © {new Date().getFullYear()} Zeyad Mandor. All rights reserved.
        </p>
      </footer>
    </div>
  );
}