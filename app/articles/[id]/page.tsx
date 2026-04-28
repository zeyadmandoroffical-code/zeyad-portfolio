"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Heart, Share2, Eye, Clock, Twitter, Linkedin, Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to calculate reading time
const getReadingTime = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200); // 200 words per minute
  return time;
};

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data: articleData, error } = await supabase.from('articles').select('*').eq('id', id).single();
      
      if (articleData) {
        setArticle(articleData);
        setViews(articleData.views_count || 0);
        setLikes(articleData.likes_count || 0);

        // Check local storage for like
        const liked = localStorage.getItem(`liked_article_${id}`);
        if (liked) setHasLiked(true);

        // Increment View Count (silent fail if column missing)
        try {
          const newViews = (articleData.views_count || 0) + 1;
          await supabase.from('articles').update({ views_count: newViews }).eq('id', id);
        } catch (e) {
          // Ignore if column doesn't exist yet
        }
      }
      setLoading(false);
    };
    if (id) fetchArticle();
  }, [id]);

  const handleLike = async () => {
    if (hasLiked || !article) return;
    
    // Optimistic UI update
    setHasLiked(true);
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem(`liked_article_${id}`, 'true');

    // Update DB (silent fail if column missing)
    try {
      await supabase.from('articles').update({ likes_count: newLikes }).eq('id', id);
    } catch (e) {
      // Revert if error
      setHasLiked(false);
      setLikes(likes);
      localStorage.removeItem(`liked_article_${id}`);
    }
  };

  const handleShare = async (platform: 'copy' | 'twitter' | 'linkedin') => {
    const url = window.location.href;
    const title = article?.title || 'Check out this article';

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }
  };

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

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 origin-left z-[100]" 
        style={{ scaleX }} 
      />

      {/* Floating Back Button */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-6 z-50 rounded-full"
      >
        <Link href="/">
          <div className="px-6 py-4 flex items-center gap-2 bg-white/40 backdrop-blur-[40px] border border-white/60 shadow-lg rounded-full hover:scale-105 transition-all text-neutral-600 hover:text-neutral-900 font-bold tracking-wide group">
            <ArrowLeft size={20} className="text-neutral-900 group-hover:-translate-x-1 transition-transform" />
            Vault
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
          {/* Header Area */}
          <div className="flex flex-col z-20 relative mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                {article.category}
              </span>
              <div className="flex items-center gap-4 text-neutral-500 font-bold text-sm">
                <span className="flex items-center gap-1.5"><Clock size={16} /> {getReadingTime(article.content)} min read</span>
                <span className="flex items-center gap-1.5"><Eye size={16} /> {views}</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-neutral-900 leading-[1.1] mb-8">
              {article.title}
            </h1>
            
            {/* Author / Date Info (Optional styling) */}
            <div className="flex items-center justify-between border-y border-white/40 py-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">Zeyad Mandor</p>
                  <p className="text-xs text-neutral-500 font-medium">{new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              
              {/* Top Share/Like Buttons */}
              <div className="flex items-center gap-2">
                <button onClick={handleLike} className={`p-2.5 rounded-full transition-all flex items-center gap-2 ${hasLiked ? 'bg-red-50 text-red-500' : 'bg-white/50 hover:bg-white/80 text-neutral-600 shadow-sm border border-white/60'}`}>
                  <Heart size={18} className={hasLiked ? 'fill-red-500' : ''} />
                  <span className="font-bold text-xs">{likes}</span>
                </button>
                <button onClick={() => handleShare('copy')} className="p-2.5 rounded-full transition-all bg-white/50 hover:bg-white/80 text-neutral-600 shadow-sm border border-white/60">
                  {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          {article.image_url && (
            <div className="w-full h-[300px] md:h-[450px] mb-16 rounded-[2rem] overflow-hidden shadow-inner isolate z-10 relative group">
              <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority sizes="(max-width: 768px) 100vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-lg prose-neutral max-w-none z-20 relative">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
          
          {/* Bottom Engagement Bar */}
          <div className="mt-20 pt-10 border-t border-white/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-black text-xl mb-1">Found this valuable?</h4>
              <p className="text-neutral-500 font-medium text-sm">Leave a like or share it with your network.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike} 
                className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-black tracking-widest uppercase text-sm shadow-sm border ${hasLiked ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white/60 hover:bg-white border-white/80 text-neutral-700 hover:shadow-md'}`}
              >
                <Heart size={20} className={hasLiked ? 'fill-red-500' : ''} />
                {hasLiked ? 'Liked' : 'Like'} ({likes})
              </button>
              
              <button onClick={() => handleShare('twitter')} className="p-3 bg-white/60 hover:bg-white border border-white/80 rounded-2xl text-[#1DA1F2] transition shadow-sm hover:shadow-md"><Twitter size={20} /></button>
              <button onClick={() => handleShare('linkedin')} className="p-3 bg-white/60 hover:bg-white border border-white/80 rounded-2xl text-[#0A66C2] transition shadow-sm hover:shadow-md"><Linkedin size={20} /></button>
            </div>
          </div>
        </motion.article>
      </main>
    </div>
  );
}
