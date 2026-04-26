"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Image from 'next/image';

const glassContainer = "bg-white/30 backdrop-blur-[20px] will-change-transform border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem]";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'articles' | 'socials' | 'comments'>('articles');
  
  // Articles State
  const [articles, setArticles] = useState<any[]>([]);
  const [articleForm, setArticleForm] = useState({ title: '', category: '', image_url: '', content: '' });
  
  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  
  // Socials State
  const [socialsForm, setSocialsForm] = useState({ 
    whatsapp_number: '', 
    email: '', 
    linkedin_url: '', 
    instagram_url: '', 
    facebook_url: '',
    profile_image_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch logic
  useEffect(() => {
    fetchArticles();
    fetchSocials();
    fetchComments();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('is_approved', false).order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const fetchSocials = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (data) {
      setSocialsForm({
        whatsapp_number: data.whatsapp_number || '',
        email: data.email || '',
        linkedin_url: data.linkedin_url || '',
        instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '',
        profile_image_url: data.profile_image_url || ''
      });
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setStatusMessage('');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.toLowerCase().includes('bucket not found')) {
          throw new Error("Bucket 'avatars' is missing in Supabase. Please create a public bucket named 'avatars'.");
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const newUrl = data.publicUrl;
      setSocialsForm((prev) => ({ ...prev, profile_image_url: newUrl }));
      
      // Auto-save to Site Settings specifically to ensure sync
      const { error: updateError } = await supabase.from('site_settings').update({ profile_image_url: newUrl }).eq('id', 1);
      if (updateError) throw updateError;

      setStatusMessage('Image uploaded and saved successfully!');
    } catch (error: any) {
      console.error(error);
      setStatusMessage(`Upload Error: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Article Action: Create
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const { error } = await supabase.from('articles').insert([{ ...articleForm }]);
      if (error) throw error;
      
      setStatusMessage('Article added successfully!');
      setArticleForm({ title: '', category: '', image_url: '', content: '' });
      fetchArticles(); // Refresh list
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Article Action: Delete
  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await supabase.from('articles').delete().eq('id', id);
      fetchArticles();
    } catch (err: any) {
      console.error("Delete failed:", err);
    }
  };

  // Comment Actions
  const handleApproveComment = async (id: number) => {
    try {
      setLoading(true);
      await supabase.from('comments').update({ is_approved: true }).eq('id', id);
      setStatusMessage('Comment approved successfully.');
      fetchComments();
    } catch (err: any) {
      setStatusMessage('Error approving comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      setLoading(true);
      await supabase.from('comments').delete().eq('id', id);
      setStatusMessage('Comment deleted successfully.');
      fetchComments();
    } catch (err: any) {
      setStatusMessage('Error deleting comment.');
    } finally {
      setLoading(false);
    }
  };

  // Socials Action: Update
  const handleUpdateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      // Update row ID 1
      const { error } = await supabase.from('site_settings').update(socialsForm).eq('id', 1);
      if (error) throw error;
      
      setStatusMessage('Identity & Socials updated successfully!');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setPasswordInput('');
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-blue-500/20 selection:text-neutral-900 overflow-hidden text-neutral-900 pb-20 bg-[#f4f5f7]">
      <GlobalBackground />
      
      <AnimatePresence mode="wait">
        {!isAuthorized ? (
          <motion.div 
            key="login-gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/10 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`p-12 w-full max-w-md ${glassContainer} text-center relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-neutral-900">Vault Access</h1>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-8">Authorized Personnel Only</p>
              
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input 
                  type="password" 
                  placeholder="Enter Access Key"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-white/40 border border-white/60 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner font-bold text-center tracking-[0.5em] text-xl"
                  autoFocus
                />
                {authError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-black text-xs uppercase tracking-widest">
                    Invalid Key. Access Denied.
                  </motion.p>
                )}
                <button type="submit" className="mt-4 bg-neutral-900 text-white font-black py-5 rounded-2xl tracking-[0.2em] uppercase hover:bg-black transition-all active:scale-95">
                  Unlock System
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="admin-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-6 pt-32 max-w-4xl relative z-10"
          >
            <div className={`p-10 mb-8 ${glassContainer} relative`}>
              <button onClick={handleLogout} className="absolute top-8 right-8 px-4 py-2 bg-white/40 hover:bg-red-50 text-neutral-500 hover:text-red-600 border border-white/60 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Logout
              </button>
              
              <h1 className="text-4xl font-black tracking-tighter mb-8 text-center uppercase tracking-[0.2em] text-neutral-900">Control Center</h1>
              
              <div className="flex gap-4 mb-10 pb-4 border-b border-white/40 overflow-x-auto">
                <button onClick={() => setActiveTab('articles')} className={`flex-1 min-w-max py-3 px-4 font-bold uppercase tracking-wider rounded-xl transition ${activeTab === 'articles' ? 'bg-neutral-900 text-white' : 'bg-white/40 text-neutral-600'}`}>
                  Content Manager
                </button>
                <button onClick={() => setActiveTab('comments')} className={`flex-1 min-w-max py-3 px-4 font-bold uppercase tracking-wider rounded-xl transition ${activeTab === 'comments' ? 'bg-neutral-900 text-white' : 'bg-white/40 text-neutral-600'}`}>
                  Comments
                </button>
                <button onClick={() => setActiveTab('socials')} className={`flex-1 min-w-max py-3 px-4 font-bold uppercase tracking-wider rounded-xl transition ${activeTab === 'socials' ? 'bg-neutral-900 text-white' : 'bg-white/40 text-neutral-600'}`}>
                  Identity
                </button>
              </div>

              {statusMessage && (
                <div className={`mb-6 p-4 rounded-xl text-center font-bold shadow-sm ${statusMessage.includes('Error') ? 'bg-red-100/80 text-red-700' : 'bg-blue-100/80 text-blue-800'}`}>
                  {statusMessage}
                </div>
              )}

              {activeTab === 'articles' && (
                <div className="flex flex-col gap-12">
                  <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900">Manage Published Articles</h2>
                    {articles.length === 0 ? (
                      <p className="text-neutral-500 font-medium">No articles found in the Vault.</p>
                    ) : (
                      articles.map((art) => (
                        <div key={art.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/40 rounded-xl border border-white/60 shadow-sm transition hover:bg-white/60">
                          <div>
                            <h3 className="font-bold text-neutral-900">{art.title}</h3>
                            <span className="text-xs font-bold uppercase text-blue-600">{art.category}</span>
                          </div>
                          <button onClick={() => handleDeleteArticle(art.id)} className="mt-4 sm:mt-0 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-bold text-sm tracking-wide rounded-lg transition">
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleCreateArticle} className="flex flex-col gap-6 pt-8 border-t border-white/40">
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900">Post New Article</h2>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Article Title</label>
                      <input required type="text" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition shadow-inner font-medium" placeholder="E.g. Closing High-Ticket Deals" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Category Tag</label>
                      <input required type="text" value={articleForm.category} onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition shadow-inner font-medium" placeholder="E.g. Growth Hacking" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Image URL (Optional)</label>
                      <input type="text" value={articleForm.image_url} onChange={(e) => setArticleForm({ ...articleForm, image_url: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition shadow-inner font-medium" placeholder="https://domain.com/image.png" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Full Content</label>
                      <textarea required rows={5} value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition shadow-inner font-medium resize-none" placeholder="Write your insight..." />
                    </div>
                    <button type="submit" disabled={loading} className="mt-2 bg-neutral-900 text-white font-black py-4 rounded-xl tracking-widest uppercase hover:bg-black transition hover:scale-[1.02] disabled:opacity-50">
                      {loading ? 'Submitting...' : 'Save to Vault'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="flex flex-col gap-12">
                  <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900">Pending Comments</h2>
                    {comments.length === 0 ? (
                      <p className="text-neutral-500 font-medium">No pending comments in queue.</p>
                    ) : (
                      comments.map((comment) => {
                        let parsed;
                        try { parsed = JSON.parse(comment.content); } catch { parsed = { text: comment.content, image: null }; }
                        return (
                          <div key={comment.id} className="flex flex-col gap-4 p-5 bg-white/40 rounded-xl border border-white/60 shadow-sm transition hover:bg-white/60">
                            <div className="flex items-start gap-4">
                              {parsed.image && (
                                <Image src={parsed.image} alt={comment.name} width={50} height={50} className="w-12 h-12 rounded-full object-cover border border-white/60 shadow-sm shrink-0" />
                              )}
                              <div>
                                <h3 className="font-bold text-neutral-900 leading-tight">
                                  {comment.name} 
                                  <span className={`text-xs font-bold ml-2 px-2 py-0.5 rounded-full ${comment.article_id === 'home' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {comment.article_id === 'home' ? 'Homepage Testimonial' : `Article ID: ${comment.article_id}`}
                                  </span>
                                </h3>
                                <p className="text-sm text-neutral-700 mt-2 whitespace-pre-wrap font-medium">{parsed.text}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 pt-4 border-t border-white/40">
                              <button onClick={() => handleApproveComment(comment.id)} disabled={loading} className="px-5 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-black tracking-widest uppercase text-xs rounded-lg transition disabled:opacity-50">
                                Approve
                              </button>
                              <button onClick={() => handleDeleteComment(comment.id)} disabled={loading} className="px-5 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-black tracking-widest uppercase text-xs rounded-lg transition disabled:opacity-50">
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'socials' && (
                <form onSubmit={handleUpdateSocials} className="flex flex-col gap-6">
                  <h2 className="text-2xl font-black tracking-tight text-neutral-900 mb-2">Configure Global Identity</h2>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {socialsForm.profile_image_url && (
                        <Image src={socialsForm.profile_image_url} alt="Profile preview" width={64} height={64} className="w-16 h-16 rounded-[1.5rem] object-cover border-[3px] border-white/60 shadow-lg" />
                      )}
                      <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploadingImage} className="text-sm font-medium text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-neutral-900 file:text-white" />
                      {uploadingImage && <span className="text-sm font-bold text-blue-600 animate-pulse">Uploading...</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">WhatsApp Number</label>
                    <input type="text" value={socialsForm.whatsapp_number} onChange={(e) => setSocialsForm({ ...socialsForm, whatsapp_number: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Email Address</label>
                    <input type="email" value={socialsForm.email} onChange={(e) => setSocialsForm({ ...socialsForm, email: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">LinkedIn URL</label>
                    <input type="text" value={socialsForm.linkedin_url} onChange={(e) => setSocialsForm({ ...socialsForm, linkedin_url: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Instagram URL</label>
                    <input type="text" value={socialsForm.instagram_url} onChange={(e) => setSocialsForm({ ...socialsForm, instagram_url: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">Facebook URL</label>
                    <input type="text" value={socialsForm.facebook_url} onChange={(e) => setSocialsForm({ ...socialsForm, facebook_url: e.target.value })} className="w-full bg-white/40 border border-white/60 p-4 rounded-xl" />
                  </div>
                  <button type="submit" disabled={loading} className="mt-6 bg-neutral-900 text-white font-black py-4 rounded-xl tracking-widest uppercase hover:bg-black transition-all disabled:opacity-50">
                    {loading ? 'Saving...' : 'Update Settings'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
