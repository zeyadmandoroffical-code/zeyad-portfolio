"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Users, Briefcase, ArrowRight, Star, MessageSquareQuote, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import Link from 'next/link';
import Image from 'next/image';
import { GlobalBackground } from '@/components/GlobalBackground';

const glassBase = "bg-white/30 backdrop-blur-[20px] will-change-transform border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem]";
const glassHover = "transition-all duration-500 hover:scale-[1.03] hover:bg-white/40 hover:shadow-[0_12px_45px_0_rgba(31,38,135,0.1)] cursor-pointer";
const glassCard = `${glassBase} ${glassHover}`;
const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };

const EditorialPhoto = ({ src }: { src: string | null }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center z-20 mt-10 lg:mt-0">
      <div className="absolute inset-4 bg-slate-300/40 rounded-[3rem] blur-2xl" />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative w-full h-full rounded-[3rem] border-[8px] border-white/40 backdrop-blur-3xl shadow-xl p-2 ${glassBase}`}
      >
        <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-neutral-100 shadow-inner relative flex items-center justify-center">
          {src ? (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 z-10">
                <Image src={src} alt="Zeyad Mandor" fill className="object-cover" onLoad={() => setLoaded(true)} sizes="(max-width: 768px) 100vw, 50vw" priority />
              </motion.div>
              {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-white to-slate-300 animate-pulse z-0" />}
            </>
          ) : (
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/60 to-indigo-50/40 backdrop-blur-[20px] shadow-inner flex flex-col items-center justify-center z-0 animate-pulse border border-white/80">
              <Users className="w-16 h-16 text-blue-300 drop-shadow-md mb-2" strokeWidth={1.5} />
              <span className="text-sm font-bold text-blue-300/80 tracking-widest uppercase">Founder</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Testimonial Card ────────────────────────────────────────────────────────
interface ParsedTestimonial {
  text: string;
  image: string | null;
  job: string | null;
  featured?: boolean;
  badge?: string;
  badgeColor?: string;
}

const BADGE_COLOR_MAP: Record<string, string> = {
  '#3b82f6': 'bg-blue-100 text-blue-700',
  '#8b5cf6': 'bg-violet-100 text-violet-700',
  '#10b981': 'bg-emerald-100 text-emerald-700',
  '#f59e0b': 'bg-amber-100 text-amber-700',
  '#ef4444': 'bg-red-100 text-red-600',
  '#ec4899': 'bg-pink-100 text-pink-700',
};

const getBadgeClass = (color?: string) =>
  color ? (BADGE_COLOR_MAP[color] ?? 'bg-blue-100 text-blue-700') : 'bg-blue-100 text-blue-700';

const TestimonialCard = ({ t, index }: { t: any; index: number }) => {
  let parsed: ParsedTestimonial;
  try { parsed = JSON.parse(t.content); } catch { parsed = { text: t.content, image: null, job: null }; }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...springConfig, delay: index * 0.08 }}
      className={`
        relative p-7 flex flex-col gap-5 break-inside-avoid mb-6
        bg-white/35 backdrop-blur-[24px] border border-white/70
        shadow-[0_8px_40px_0_rgba(31,38,135,0.07)]
        rounded-[2rem] overflow-hidden
        transition-all duration-500 hover:bg-white/50 hover:shadow-[0_16px_56px_0_rgba(31,38,135,0.13)]
        ${parsed.featured ? 'ring-2 ring-amber-300/60 shadow-amber-100/40' : ''}
      `}
    >
      {/* Featured glow */}
      {parsed.featured && (
        <div className="absolute top-4 right-4">
          <Star className="w-5 h-5 text-amber-400 fill-amber-300 drop-shadow-sm" />
        </div>
      )}

      {/* Quote icon */}
      <MessageSquareQuote className="w-8 h-8 text-blue-200 shrink-0" strokeWidth={1.5} />

      {/* Text */}
      <p className="text-[15px] md:text-base text-neutral-700 font-medium leading-relaxed italic flex-1">
        "{parsed.text}"
      </p>

      {/* Badge */}
      {parsed.badge && (
        <span className={`self-start text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${getBadgeClass(parsed.badgeColor)}`}>
          {parsed.badge}
        </span>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-white/40">
        {parsed.image ? (
          <div className="w-11 h-11 rounded-full overflow-hidden shadow-md border-2 border-white/60 shrink-0">
            <Image src={parsed.image} alt={t.author_name} width={44} height={44} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md border-2 border-white/60 shrink-0">
            <Users className="text-blue-400 w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-black text-neutral-900 text-sm leading-tight truncate">{t.author_name}</h4>
          {parsed.job && <p className="text-[11px] text-neutral-400 font-medium tracking-wide mt-0.5 truncate">{parsed.job}</p>}
          {parsed.badge ? (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-0.5 inline-block"
              style={{ backgroundColor: (parsed.badgeColor || '#8b5cf6') + '22', color: parsed.badgeColor || '#8b5cf6' }}
            >
              {parsed.badge}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default function Portfolio() {
  const [articles, setArticles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Form state
  const [tName, setTName] = useState('');
  const [tJob, setTJob] = useState('');
  const [tContent, setTContent] = useState('');
  const [tImageFile, setTImageFile] = useState<File | null>(null);
  const [isSubmittingT, setIsSubmittingT] = useState(false);
  const [tStatus, setTStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      const { data: artData } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (artData) setArticles(artData);

      const { data: settsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (settsData) setSettings(settsData);

      const { data: testData } = await supabase
        .from('comments')
        .select('*')
        .is('article_id', null)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (testData) {
        // Put featured first
        const sorted = [...testData].sort((a, b) => {
          let pa: any, pb: any;
          try { pa = JSON.parse(a.content); } catch { pa = {}; }
          try { pb = JSON.parse(b.content); } catch { pb = {}; }
          return (pb.featured ? 1 : 0) - (pa.featured ? 1 : 0);
        });
        setTestimonials(sorted);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (settings?.profile_image_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = settings.profile_image_url;
    }
  }, [settings?.profile_image_url]);

  const getWhatsAppLink = (numberStr: string | null | undefined) => {
    if (!numberStr) return '#';
    let clean = numberStr.replace(/[^0-9]/g, '');
    if (clean.startsWith('01') && clean.length === 11) clean = '20' + clean.substring(1);
    return `https://wa.me/${clean}`;
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tContent) return;
    setIsSubmittingT(true);
    setTStatus('idle');
    try {
      let imageUrl: string | null = null;
      if (tImageFile) {
        const fileExt = tImageFile.name.split('.').pop();
        const fileName = `testimonial_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, tImageFile);
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }
      }
      const payload = JSON.stringify({ text: tContent, image: imageUrl, job: tJob || null });
      const { error } = await supabase.from('comments').insert([{ author_name: tName, content: payload, is_approved: false }]);
      if (error) throw error;
      setTStatus('success');
      setTName(''); setTJob(''); setTContent(''); setTImageFile(null);
    } catch {
      setTStatus('error');
    } finally {
      setIsSubmittingT(false);
    }
  };

  return (
    <div className="relative w-full text-neutral-900 pb-32 font-sans selection:bg-blue-500/20 selection:text-neutral-900 overflow-hidden">
      <GlobalBackground />

      {/* HEADER */}
      <motion.nav
        initial={{ y: -50, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={springConfig}
        className={`fixed top-6 left-1/2 z-50 px-3 py-2 flex items-center bg-white/30 backdrop-blur-[20px] will-change-transform border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] !rounded-full`}
      >
        <div className="flex items-center gap-8 px-6 hidden sm:flex">
          {['Projects', 'Vault', 'Journey', 'Testimonials'].map((item) => (
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
          href={getWhatsAppLink(settings?.whatsapp_number)}
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="ml-2 sm:ml-6 bg-neutral-900 text-white rounded-full px-7 py-3 text-[13px] font-extrabold tracking-wide uppercase shadow-[0_4px_14px_0_inherit] hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 transition-all duration-300 inline-block text-center"
        >
          Let's Talk
        </motion.a>
      </motion.nav>

      <main className="container mx-auto px-6 max-w-7xl relative z-10 pt-48">

        {/* HERO */}
        <section id="home" className="min-h-[80vh] flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-16 pb-32">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springConfig, duration: 1 }} className="flex-1 text-center md:text-left z-10 mt-6 md:mt-0">
            <h2 className="text-2xl text-neutral-600 font-medium tracking-wide mb-2">Hello, I am</h2>
            <h1 className="text-7xl md:text-9xl font-black text-neutral-900 tracking-tighter leading-[0.95] mb-6">Zeyad <br className="hidden md:block" />Mandor</h1>
            <h3 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-slate-800 mb-8 max-w-3xl">
              Build what they actually need. <br className="hidden md:block" />Hack how they find it.
            </h3>
            <p className="text-lg md:text-xl text-neutral-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              18-year-old Tech Founder, Digital Marketing Specialist, and 3rd-year high school student from Egypt. Scaling B2B SaaS and startups through Growth Hacking and Zero Ad Spend.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springConfig, delay: 0.2 }} className="flex-1 flex justify-center md:justify-end">
            <EditorialPhoto src={settings?.profile_image_url || null} />
          </motion.div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-20 text-center lg:text-left">
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 mb-6">The Ecosystem</h2>
            <p className="text-2xl text-neutral-600 font-medium">B2B mechanics. Organic velocity.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[auto]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className={`md:col-span-12 lg:col-span-8 p-12 flex flex-col justify-between ${glassCard} group min-h-[400px]`}>
              <div className="flex items-start justify-between">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-10 text-white bg-blue-600 shadow-lg"><Rocket size={34} strokeWidth={2.5} /></div>
                <ArrowRight className="text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-3 transition-transform duration-300" size={32} />
              </div>
              <div>
                <h3 className="text-5xl font-black tracking-tighter text-neutral-900 mb-2">Edour</h3>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 font-bold uppercase tracking-widest text-xs rounded-full mb-6">CEO & Founder (2024-Present)</span>
                <p className="text-2xl text-neutral-600 font-medium leading-relaxed">B2B SaaS for educators allowing them to build academies in 5 minutes.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={`md:col-span-12 lg:col-span-4 p-12 flex flex-col justify-between ${glassCard} min-h-[400px]`}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 text-white bg-indigo-600 shadow-lg"><Users size={28} strokeWidth={2.5} /></div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-neutral-900 mb-2">Lazy Code</h3>
                <span className="inline-flex px-4 py-2 bg-indigo-100 text-indigo-800 font-bold uppercase tracking-widest text-xs rounded-full mb-6">Co-Founder & Head of Marketing (Jan 2026-Present)</span>
                <p className="text-xl text-neutral-600 font-medium leading-relaxed">Educational NGO for youth.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className={`md:col-span-12 p-12 flex flex-col lg:flex-row justify-between lg:items-center gap-10 ${glassCard}`}>
              <div><div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 lg:mb-0 text-white bg-teal-600 shadow-lg"><Briefcase size={28} strokeWidth={2.5} /></div></div>
              <div className="flex-1">
                <h3 className="text-4xl font-black tracking-tighter text-neutral-900 mb-2">Nexus Team</h3>
                <span className="inline-block px-4 py-2 bg-teal-100 text-teal-800 font-bold uppercase tracking-widest text-xs rounded-full mb-4">Marketing Specialist (2024-2025)</span>
                <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed max-w-4xl">B2B Content Marketing and organic lead gen.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* VAULT */}
        <section id="vault" className="py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-16 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-8">The Founder's Vault</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <Link href={`/articles/${article.id}`} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ ...springConfig, delay: i * 0.1 }}
                  className={`p-6 flex flex-col justify-between h-full bg-white/30 backdrop-blur-[20px] will-change-transform border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem] hover:scale-[1.02] hover:-translate-y-2 hover:bg-white/40 transition-all duration-500 cursor-pointer`}
                >
                  {article.image_url ? (
                    <div className="w-full relative rounded-2xl h-48 mb-6 overflow-hidden">
                      <Image src={article.image_url} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  ) : (
                    <div className="w-full bg-black/5 rounded-2xl h-48 mb-6 shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 pointer-events-none" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-2">{article.category}</span>
                    <h3 className="text-xl font-bold text-neutral-900 leading-tight mb-3">{article.title}</h3>
                    <div className="mt-auto mb-2 pt-2 text-sm text-neutral-500 font-medium">{article.content?.substring(0, 80)}...</div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* JOURNEY */}
        <section id="journey" className="py-32 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-32">
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 mb-6">The Journey</h2>
            <p className="text-2xl text-neutral-600 font-medium">Evolution mapped in pure execution.</p>
          </motion.div>
          <div className="relative pl-10 md:pl-20">
            <div className="absolute top-6 bottom-0 left-[24px] md:left-[39px] w-1.5 bg-white/60 blur-[1px] shadow-inner" />
            <div className="absolute top-6 bottom-0 left-[25.5px] md:left-[40.5px] w-px bg-neutral-300" />
            {[
              { year: "2023", title: "Sidi Gazy School", desc: "The beginning of the entrepreneurial spark." },
              { year: "2024", title: "Nexus Team", desc: "Execution and closing inside Nexus Team." },
              { year: "2025", title: "Edour Launch", desc: "Scaling educational infrastructure organically." },
              { year: "2026", title: "Lazy Code", desc: "Empowering youth with foundational logic and growth tactics." }
            ].map((node, i) => (
              <div key={i} className="relative mb-20 last:mb-0 group">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={springConfig} className="absolute left-[-26px] md:left-[-60px] top-4 md:top-6 w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/80 backdrop-blur-md shadow-2xl border-4 border-white flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110">
                  <div className="w-3 h-3 md:w-5 md:h-5 bg-blue-600 rounded-full" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className={`ml-10 md:ml-16 p-10 md:p-14 ${glassCard}`}>
                  <span className="inline-block px-5 py-2 bg-neutral-900 text-white font-black tracking-widest text-sm uppercase rounded-full mb-6 shadow-md">{node.year}</span>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 mb-4">{node.title}</h3>
                  <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed">{node.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WALL OF LOVE ─────────────────────────────────────────────────── */}
        <section id="testimonials" className="py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-6 text-center">
            <span className="inline-block px-5 py-2 bg-amber-100 text-amber-700 font-black text-xs uppercase tracking-[0.2em] rounded-full mb-6">Wall of Love</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-neutral-900 mb-4">What People Say</h2>
            <p className="text-xl text-neutral-500 font-medium max-w-xl mx-auto">Honest words from partners, clients, and collaborators.</p>
          </motion.div>

          {/* Masonry Grid */}
          {testimonials.length > 0 && (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 mb-16 mt-16">
              {testimonials.map((t, i) => <TestimonialCard key={t.id} t={t} index={i} />)}
            </div>
          )}

          {/* ── Submit Form ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`max-w-2xl mx-auto mt-8 p-8 md:p-12 ${glassBase} border-2 border-blue-400/20`}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-widest text-neutral-900 mb-1">Leave Your Mark</h3>
              <p className="text-sm text-neutral-500 font-medium">Submit your name, role, comment & photo — shown after approval.</p>
            </div>
            <form onSubmit={handleTestimonialSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" value={tName} onChange={e => setTName(e.target.value)} placeholder="Your Name *" className="bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-neutral-900 placeholder:text-neutral-400" />
                <input type="text" value={tJob} onChange={e => setTJob(e.target.value)} placeholder="Your Role / Title (optional)" className="bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium text-neutral-900 placeholder:text-neutral-400" />
              </div>
              <textarea required rows={4} value={tContent} onChange={e => setTContent(e.target.value)} placeholder="Your testimonial or feedback... *" className="bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium resize-none text-neutral-900 placeholder:text-neutral-400" />
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-2">Your Photo (optional)</label>
                <input type="file" accept="image/*" onChange={e => setTImageFile(e.target.files?.[0] || null)} className="w-full bg-white/50 border border-white/70 p-3 rounded-2xl text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-black file:bg-neutral-900 file:text-white file:text-xs" />
              </div>
              <button type="submit" disabled={isSubmittingT} className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200">
                {isSubmittingT ? 'Uploading…' : '✦ Submit to Wall'}
              </button>
              {tStatus === 'success' && <p className="text-center text-green-600 font-bold text-sm bg-green-50/80 p-3 rounded-xl border border-green-200">🎉 Submitted! Awaiting approval — thank you!</p>}
              {tStatus === 'error' && <p className="text-center text-red-600 font-bold text-sm bg-red-50/80 p-3 rounded-xl border border-red-200">❌ Something went wrong. Please try again.</p>}
            </form>
          </motion.div>
        </section>

      </main>

      {/* SOCIAL DOCK */}
      {settings && (
        <motion.div
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          className="fixed bottom-6 left-1/2 z-50 px-6 py-4 flex items-center gap-6 bg-white/30 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-full"
        >
          <a href={settings.linkedin_url || '#'} target="_blank" rel="noreferrer" className={`transition-transform ${settings.linkedin_url ? 'text-neutral-600 hover:text-blue-600 hover:scale-110' : 'text-neutral-400 opacity-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          <a href={settings.instagram_url || '#'} target="_blank" rel="noreferrer" className={`transition-transform ${settings.instagram_url ? 'text-neutral-600 hover:text-pink-600 hover:scale-110' : 'text-neutral-400 opacity-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href={settings.facebook_url || '#'} target="_blank" rel="noreferrer" className={`transition-transform ${settings.facebook_url ? 'text-neutral-600 hover:text-blue-800 hover:scale-110' : 'text-neutral-400 opacity-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </motion.div>
      )}

      <footer className="mt-20 pb-20 text-center relative z-10">
        <p className="text-neutral-500 font-bold tracking-widest uppercase text-sm">© {new Date().getFullYear()} Zeyad Mandor. All rights reserved.</p>
      </footer>
    </div>
  );
}