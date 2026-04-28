"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Heart, Share2, Eye, Clock, Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to calculate reading time
const getReadingTime = (text: string) => {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200); 
  return time;
};

// SVG for X / Twitter
const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 3.97H5.078z"></path>
  </svg>
);

// SVG for LinkedIn
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentJob, setCommentJob] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentStatus, setCommentStatus] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      setLoading(true);
      const { data: articleData } = await supabase.from('articles').select('*').eq('id', id).single();
      
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
          // Ignore
        }
      }

      // Fetch Approved Comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });
      if (commentsData) setComments(commentsData);

      setLoading(false);
    };
    if (id) fetchArticleAndComments();
  }, [id]);

  const handleLike = async () => {
    if (hasLiked || !article) return;
    setHasLiked(true);
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem(`liked_article_${id}`, 'true');

    try {
      await supabase.from('articles').update({ likes_count: newLikes }).eq('id', id);
    } catch (e) {
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentContent) return;
    setIsSubmittingComment(true);
    setCommentStatus('');
    try {
      let imageUrl: string | null = null;
      if (commentImage) {
        const fileExt = commentImage.name.split('.').pop();
        const fileName = `comment_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, commentImage);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      const payload = JSON.stringify({ text: commentContent, image: imageUrl, job: commentJob });

      const { error } = await supabase.from('comments').insert([{
        article_id: id,
        author_name: commentName,
        content: payload,
        is_approved: false
      }]);

      if (error) throw error;
      setCommentStatus('success');
      setCommentName('');
      setCommentJob('');
      setCommentContent('');
      setCommentImage(null);
    } catch (err: any) {
      setCommentStatus('error');
    } finally {
      setIsSubmittingComment(false);
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

  if (!article) return <div className="min-h-screen flex items-center justify-center font-sans"><GlobalBackground /><h1 className="text-3xl font-black">Article not found.</h1></div>;

  return (
    <div className="relative min-h-screen font-sans selection:bg-blue-500/20 selection:text-neutral-900 overflow-x-hidden text-neutral-900 pb-32">
      <GlobalBackground />

      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 origin-left z-[100] shadow-sm" style={{ scaleX }} />

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-6 left-6 z-50 rounded-full">
        <Link href="/">
          <div className="px-6 py-4 flex items-center gap-2 bg-white/40 backdrop-blur-[40px] border border-white/60 shadow-lg rounded-full hover:scale-105 transition-all text-neutral-600 hover:text-neutral-900 font-bold tracking-wide group">
            <ArrowLeft size={20} className="text-neutral-900 group-hover:-translate-x-1 transition-transform" />
            Vault
          </div>
        </Link>
      </motion.div>

      <main className="container mx-auto px-4 max-w-4xl pt-32">
        <motion.article 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white/30 backdrop-blur-[50px] border border-white/60 shadow-2xl rounded-[3rem] p-8 md:p-16 overflow-hidden relative"
        >
          <div className="flex flex-col z-20 relative mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm border border-blue-200/50">
                {article.category}
              </span>
              <div className="flex items-center gap-4 text-neutral-500 font-bold text-sm">
                <span className="flex items-center gap-1.5 bg-white/40 px-3 py-1 rounded-full"><Clock size={16} className="text-blue-500" /> {getReadingTime(article.content)} min read</span>
                <span className="flex items-center gap-1.5 bg-white/40 px-3 py-1 rounded-full"><Eye size={16} className="text-indigo-500" /> {views} views</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-neutral-900 leading-[1.1] mb-8">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between border-y border-neutral-300/40 py-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">Zeyad Mandor</p>
                  <p className="text-xs text-neutral-500 font-medium">{new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={handleLike} className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 font-bold text-sm shadow-sm border ${hasLiked ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white/50 hover:bg-white/80 text-neutral-600 border-white/60'}`}>
                  <Heart size={16} className={hasLiked ? 'fill-red-500' : ''} /> {likes}
                </button>
                <button onClick={() => handleShare('copy')} className="p-2.5 rounded-full transition-all bg-white/50 hover:bg-white/80 text-neutral-600 shadow-sm border border-white/60">
                  {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
          </div>

          {article.image_url && (
            <div className="w-full h-[300px] md:h-[450px] mb-16 rounded-[2rem] overflow-hidden shadow-inner isolate z-10 relative group">
              <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority sizes="(max-width: 768px) 100vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Premium Markdown Styling applied via prose classes defined in globals.css */}
          <div className="prose prose-lg prose-neutral prose-blue max-w-none z-20 relative">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
          
          <div className="mt-20 pt-10 border-t border-neutral-300/40 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/20 p-8 rounded-[2rem]">
            <div className="text-center md:text-left">
              <h4 className="font-black text-xl mb-1 text-neutral-900">Found this valuable?</h4>
              <p className="text-neutral-500 font-medium text-sm">Leave a like or share it with your network.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-black tracking-widest uppercase text-sm shadow-sm border ${hasLiked ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white hover:bg-neutral-50 border-white/80 text-neutral-700 hover:shadow-md'}`}>
                <Heart size={20} className={hasLiked ? 'fill-red-500' : ''} /> {hasLiked ? 'Liked' : 'Like'} ({likes})
              </button>
              <button onClick={() => handleShare('twitter')} className="p-3 bg-neutral-900 hover:bg-black border border-transparent rounded-2xl text-white transition shadow-sm hover:shadow-md"><XIcon /></button>
              <button onClick={() => handleShare('linkedin')} className="p-3 bg-[#0A66C2] hover:bg-[#084e96] border border-transparent rounded-2xl text-white transition shadow-sm hover:shadow-md"><LinkedInIcon /></button>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <section className="mt-16 mb-20 relative z-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black tracking-tight text-neutral-900">Discussion <span className="text-neutral-400">({comments.length})</span></h3>
          </div>

          <div className="space-y-6 mb-16">
            {comments.map((c, idx) => {
              const parsed = JSON.parse(c.content || '{}');
              return (
                <div key={idx} className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-[2rem] shadow-sm flex gap-4">
                  <div className="shrink-0">
                    {parsed.image ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden relative shadow-inner">
                        <Image src={parsed.image} alt="Avatar" fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center shadow-inner">
                        <User className="text-blue-400" size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-neutral-900">{c.author_name}</h4>
                      {parsed.job && <span className="text-xs font-medium px-2 py-0.5 bg-white/50 text-neutral-500 rounded-full">{parsed.job}</span>}
                      <span className="text-xs text-neutral-400 ml-2">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">{parsed.text}</p>
                  </div>
                </div>
              );
            })}
            {comments.length === 0 && (
              <div className="text-center py-12 bg-white/20 border border-white/40 rounded-[2rem]">
                <p className="text-neutral-500 font-medium">Be the first to share your thoughts.</p>
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <div className="bg-white/30 backdrop-blur-[40px] border border-white/60 p-8 rounded-[2rem] shadow-xl">
            <h3 className="text-2xl font-black mb-6 tracking-tight text-neutral-900">Join the Conversation</h3>
            
            {commentStatus === 'success' ? (
              <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-medium text-center">
                Your comment has been submitted and is waiting for approval by Zeyad.
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" value={commentName} onChange={(e) => setCommentName(e.target.value)} required className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-neutral-900" />
                  <input type="text" placeholder="Your Job Title / Company" value={commentJob} onChange={(e) => setCommentJob(e.target.value)} className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium text-neutral-900" />
                </div>
                
                <textarea placeholder="What are your thoughts?" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} required rows={4} className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium resize-none text-neutral-900" />
                
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <input type="file" accept="image/*" onChange={(e) => setCommentImage(e.target.files?.[0] || null)} className="text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white/50 file:text-blue-600 hover:file:bg-white" />
                  <button type="submit" disabled={isSubmittingComment} className="w-full md:w-auto bg-neutral-900 text-white font-black px-8 py-4 rounded-2xl uppercase tracking-widest hover:bg-black transition shadow-lg disabled:opacity-50">
                    {isSubmittingComment ? 'Submitting...' : 'Post Comment'}
                  </button>
                </div>
                {commentStatus === 'error' && <p className="text-red-500 text-sm font-bold mt-2">Failed to submit comment. Please try again.</p>}
              </form>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
