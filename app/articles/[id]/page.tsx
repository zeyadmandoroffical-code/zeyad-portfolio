"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', content: '' });
  const [commentStatus, setCommentStatus] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      setLoading(true);
      const { data: articleData } = await supabase.from('articles').select('*').eq('id', id).single();
      if (articleData) setArticle(articleData);
      
      const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*').eq('article_id', id).order('created_at', { ascending: false });
      console.log('Comments fetched:', commentsData, 'Error:', commentsError);
      if (commentsData) setComments(commentsData);
      
      setLoading(false);
    };
    if (id) fetchArticleAndComments();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name || !commentForm.content) return;
    setIsSubmittingComment(true);
    setCommentStatus('');
    try {
      console.log('Submitting comment for article:', id, commentForm);
      const { error, data } = await supabase.from('comments').insert([{ article_id: id, name: commentForm.name, content: commentForm.content, is_approved: false }]).select('*');
      console.log('Insert attempt:', data, 'Error:', error);
      if (error) throw error;
      setCommentStatus('Your comment is awaiting approval!');
      setCommentForm({ name: '', content: '' });
    } catch (err: any) {
      console.error(err);
      setCommentStatus('Error submitting comment.');
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
              <Image src={article.image_url} alt={article.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 100vw" />
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

        {/* Comments Section */}
        <section className="mt-16 mb-20 relative z-20">
          <h3 className="text-3xl font-black text-neutral-900 mb-8">Comments</h3>
          
          <div className="bg-white/30 backdrop-blur-[20px] will-change-transform border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem] p-8 md:p-10 mb-10">
            <h4 className="text-xl font-bold mb-6 text-neutral-800">Leave a reply</h4>
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <input required type="text" value={commentForm.name} onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} placeholder="Your Name" className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition shadow-inner font-medium text-neutral-900" />
              </div>
              <div className="flex flex-col gap-2">
                <textarea required rows={4} value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} placeholder="Your Comment" className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition shadow-inner font-medium resize-none text-neutral-900" />
              </div>
              <button disabled={isSubmittingComment} type="submit" className="mt-2 bg-neutral-900 text-white font-black py-4 px-8 rounded-xl tracking-widest uppercase hover:bg-black transition-all disabled:opacity-50 self-start">
                {isSubmittingComment ? 'Submitting...' : 'Post Comment'}
              </button>
              {commentStatus && (
                <div className="mt-2 text-sm font-bold text-blue-600 bg-blue-50/50 p-3 rounded-lg inline-block border border-blue-100">{commentStatus}</div>
              )}
            </form>
          </div>

          <div className="flex flex-col gap-6">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <motion.div key={comment.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 border border-white/60 p-6 rounded-2xl shadow-sm">
                  <h5 className="font-bold text-neutral-900 text-lg">{comment.name} {comment.is_approved ? '' : <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full ml-2">Pending</span>}</h5>
                  <p className="text-neutral-600 mt-2 whitespace-pre-wrap">{comment.content}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-neutral-500 font-medium bg-white/30 p-6 rounded-2xl border border-white/60 text-center">No comments yet. Be the first to start the discussion!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
