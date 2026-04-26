"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentStatus, setCommentStatus] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      setLoading(true);
      const { data: articleData } = await supabase.from('articles').select('*').eq('id', id).single();
      if (articleData) setArticle(articleData);
      
      // Only show approved comments for article
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

      const payload = JSON.stringify({ text: commentContent, image: imageUrl });

      const { error } = await supabase.from('comments').insert([{
        article_id: id,
        author_name: commentName,
        content: payload,
        is_approved: false
      }]);

      if (error) throw error;
      setCommentStatus('success');
      setCommentName('');
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
          <h3 className="text-3xl font-black text-neutral-900 mb-8">Discussion</h3>
          
          {/* Leave a Comment Form */}
          <div className="bg-white/30 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem] p-8 md:p-10 mb-10">
            <h4 className="text-xl font-black mb-1 text-neutral-900 uppercase tracking-widest">Leave a Reply</h4>
            <p className="text-sm text-neutral-500 font-medium mb-6">Your comment will appear after review.</p>
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-5">
              <input
                required
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition font-bold text-neutral-900"
              />
              <textarea
                required
                rows={4}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Your Comment"
                className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition font-medium resize-none text-neutral-900"
              />
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Your Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCommentImage(e.target.files?.[0] || null)}
                  className="w-full bg-white/40 border border-white/60 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-neutral-900 file:text-white"
                />
              </div>
              <button
                disabled={isSubmittingComment}
                type="submit"
                className="mt-2 bg-neutral-900 text-white font-black py-4 px-8 rounded-xl tracking-widest uppercase hover:bg-black transition-all disabled:opacity-50 self-start"
              >
                {isSubmittingComment ? 'Submitting...' : 'Post Comment'}
              </button>
              {commentStatus === 'success' && (
                <div className="mt-2 text-sm font-bold text-green-700 bg-green-50/80 p-4 rounded-xl border border-green-200">
                  ✅ Your comment is awaiting approval. Thank you!
                </div>
              )}
              {commentStatus === 'error' && (
                <div className="mt-2 text-sm font-bold text-red-600 bg-red-50/80 p-4 rounded-xl border border-red-200">
                  ❌ Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>

          {/* Approved Comments Display */}
          <div className="flex flex-col gap-6">
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                let parsed;
                try { parsed = JSON.parse(comment.content); } catch { parsed = { text: comment.content, image: null }; }
                return (
                  <motion.div
                    key={comment.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/40 border border-white/60 p-6 rounded-2xl shadow-sm flex gap-4 items-start"
                  >
                    {parsed.image ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/60 shadow-md shrink-0">
                        <Image src={parsed.image} alt={comment.author_name} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white/60 shadow-md shrink-0 flex items-center justify-center">
                        <User className="text-blue-500 w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-black text-neutral-900">{comment.author_name}</h5>
                      <p className="text-sm text-neutral-400 mb-2 font-medium">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-neutral-700 font-medium leading-relaxed">{parsed.text}</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-neutral-500 font-medium bg-white/30 p-6 rounded-2xl border border-white/60 text-center">
                No comments yet. Be the first to start the discussion!
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
