"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase.from('articles').select('*').eq('id', id).single();
      if (data) setArticle(data);
      setLoading(false);
    };
    if (id) fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <GlobalBackground />
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <GlobalBackground />
        <h1 className="text-3xl font-black text-neutral-900">Article not found.</h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans selection:bg-blue-500/20 selection:text-neutral-900 overflow-x-hidden text-neutral-900 pb-32">
      <GlobalBackground />

      {/* Floating Back Button */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-6 z-50 rounded-full"
      >
        <Link href="/">
          <div className="px-6 py-4 flex items-center gap-2 bg-white/40 backdrop-blur-[40px] border border-white/60 shadow-lg rounded-full hover:scale-105 transition-all text-neutral-600 hover:text-neutral-900 font-bold tracking-wide">
            <ArrowLeft size={20} className="text-neutral-900" />
            Back to Home
          </div>
        </Link>
      </motion.div>

      <main className="container mx-auto px-4 max-w-4xl pt-32">
        <motion.article 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/30 backdrop-blur-[50px] border border-white/60 shadow-2xl rounded-[3rem] p-8 md:p-16 overflow-hidden relative"
        >
          {article.image_url && (
            <div className="w-full h-[300px] md:h-[450px] mb-12 rounded-[2rem] overflow-hidden shadow-inner isolate z-10 relative">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          )}

          <div className="flex flex-col z-20 relative">
            <span className="text-sm font-black uppercase text-blue-600 tracking-[0.2em] mb-4">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-neutral-900 leading-[1.1] mb-8">
              {article.title}
            </h1>
            
            <div className="w-16 h-1 bg-neutral-900 rounded-full mb-10" />

            <div className="text-lg md:text-xl text-neutral-700 font-medium leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>

        </motion.article>
      </main>
    </div>
  );
}
