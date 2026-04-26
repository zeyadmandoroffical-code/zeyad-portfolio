"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { GlobalBackground } from '@/components/GlobalBackground';
import Image from 'next/image';
import { Star, Trash2, CheckCircle, XCircle, ChevronUp, ChevronDown, Users } from 'lucide-react';

const glass = "bg-white/30 backdrop-blur-[20px] will-change-transform border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] rounded-[2.5rem]";

const BADGE_PRESETS = [
  { label: 'Top Pick', color: '#8b5cf6' },
  { label: 'Partner', color: '#3b82f6' },
  { label: 'Client', color: '#10b981' },
  { label: 'Mentor', color: '#f59e0b' },
  { label: 'Friend', color: '#ec4899' },
  { label: 'Team', color: '#ef4444' },
];

function parseContent(raw: string) {
  try { return JSON.parse(raw); } catch { return { text: raw, image: null, job: null }; }
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'socials' | 'comments' | 'testimonials'>('articles');

  // Articles
  const [articles, setArticles] = useState<any[]>([]);
  const [articleForm, setArticleForm] = useState({ title: '', category: '', image_url: '', content: '' });

  // Comments (pending, any article)
  const [pendingComments, setPendingComments] = useState<any[]>([]);

  // Approved Testimonials (article_id IS NULL)
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Editing state for testimonials
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBadge, setEditBadge] = useState('');
  const [editBadgeColor, setEditBadgeColor] = useState('#8b5cf6');

  // Socials
  const [socialsForm, setSocialsForm] = useState({ whatsapp_number: '', email: '', linkedin_url: '', instagram_url: '', facebook_url: '', profile_image_url: '' });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchArticles();
    fetchSocials();
    fetchPendingComments();
    fetchTestimonials();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const fetchPendingComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('is_approved', false).order('created_at', { ascending: false });
    if (data) setPendingComments(data);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase.from('comments').select('*').is('article_id', null).eq('is_approved', true).order('created_at', { ascending: false });
    if (data) {
      const sorted = [...data].sort((a, b) => {
        const pa = parseContent(a.content), pb = parseContent(b.content);
        return (pb.featured ? 1 : 0) - (pa.featured ? 1 : 0);
      });
      setTestimonials(sorted);
    }
  };

  const fetchSocials = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (data) setSocialsForm({ whatsapp_number: data.whatsapp_number || '', email: data.email || '', linkedin_url: data.linkedin_url || '', instagram_url: data.instagram_url || '', facebook_url: data.facebook_url || '', profile_image_url: data.profile_image_url || '' });
  };

  // ── Comment Actions ──────────────────────────────────────────────
  const approveComment = async (id: string) => {
    setLoading(true);
    await supabase.from('comments').update({ is_approved: true }).eq('id', id);
    setStatusMessage('✅ Approved!');
    fetchPendingComments();
    fetchTestimonials();
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    setLoading(true);
    await supabase.from('comments').delete().eq('id', id);
    setStatusMessage('🗑️ Deleted.');
    fetchPendingComments();
    fetchTestimonials();
    setLoading(false);
  };

  // ── Testimonial Meta Update ──────────────────────────────────────
  const updateTestimonialMeta = async (id: string, meta: Record<string, any>) => {
    const t = testimonials.find(x => x.id === id);
    if (!t) return;
    const parsed = parseContent(t.content);
    const merged = { ...parsed, ...meta };
    await supabase.from('comments').update({ content: JSON.stringify(merged) }).eq('id', id);
    fetchTestimonials();
  };

  const toggleFeatured = async (t: any) => {
    const parsed = parseContent(t.content);
    await updateTestimonialMeta(t.id, { featured: !parsed.featured });
  };

  const saveEdits = async (id: string) => {
    await updateTestimonialMeta(id, { badge: editBadge, badgeColor: editBadgeColor });
    setEditingId(null);
  };

  const clearBadge = async (id: string) => {
    await updateTestimonialMeta(id, { badge: '', badgeColor: '' });
    setEditingId(null);
  };

  const moveTestimonial = async (index: number, dir: 'up' | 'down') => {
    const newList = [...testimonials];
    const [item] = newList.splice(index, 1);
    const newIdx = dir === 'up' ? index - 1 : index + 1;
    newList.splice(newIdx, 0, item);
    // Store order in content meta
    for (let i = 0; i < newList.length; i++) {
      const parsed = parseContent(newList[i].content);
      parsed.order = i;
      await supabase.from('comments').update({ content: JSON.stringify(parsed) }).eq('id', newList[i].id);
    }
    setTestimonials(newList);
  };

  // ── Article Actions ──────────────────────────────────────────────
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setStatusMessage('');
    try {
      const { error } = await supabase.from('articles').insert([{ ...articleForm }]);
      if (error) throw error;
      setStatusMessage('✅ Article added!');
      setArticleForm({ title: '', category: '', image_url: '', content: '' });
      fetchArticles();
    } catch (err: any) { setStatusMessage(`❌ ${err.message}`); }
    finally { setLoading(false); }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm('Delete this article?')) return;
    await supabase.from('articles').delete().eq('id', id);
    fetchArticles();
  };

  // ── Image Upload ─────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true); setStatusMessage('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newUrl = data.publicUrl;
      setSocialsForm(p => ({ ...p, profile_image_url: newUrl }));
      await supabase.from('site_settings').update({ profile_image_url: newUrl }).eq('id', 1);
      setStatusMessage('✅ Photo uploaded & saved!');
    } catch (err: any) { setStatusMessage(`❌ ${err.message}`); }
    finally { setUploadingImage(false); }
  };

  const handleUpdateSocials = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setStatusMessage('');
    try {
      const { error } = await supabase.from('site_settings').update(socialsForm).eq('id', 1);
      if (error) throw error;
      setStatusMessage('✅ Identity & Socials updated!');
    } catch (err: any) { setStatusMessage(`❌ ${err.message}`); }
    finally { setLoading(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) { setIsAuthorized(true); setAuthError(false); }
    else { setAuthError(true); setPasswordInput(''); }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden">
        <GlobalBackground />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative z-10 w-full max-w-md p-10 ${glass}`}>
          <h1 className="text-3xl font-black tracking-tighter mb-2 text-center">Admin Access</h1>
          <p className="text-sm text-neutral-500 text-center mb-8 font-medium">Restricted area. Enter password.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold" />
            {authError && <p className="text-red-500 font-bold text-sm text-center">Incorrect password.</p>}
            <button type="submit" className="bg-neutral-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-black transition-all">Enter</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs: { key: 'articles' | 'socials' | 'comments' | 'testimonials'; label: string; badge?: number }[] = [
    { key: 'articles', label: '📝 Articles' },
    { key: 'socials', label: '🌐 Identity' },
    { key: 'comments', label: '💬 Pending', badge: pendingComments.length },
    { key: 'testimonials', label: '⭐ Testimonials', badge: testimonials.length },
  ];

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden text-neutral-900 pb-32">
      <GlobalBackground />
      <main className="container mx-auto px-4 max-w-6xl pt-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-2">Control Center</h1>
          <p className="text-neutral-500 font-medium">Manage every pixel of your portfolio.</p>
          {statusMessage && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 inline-block px-5 py-2 bg-white/60 border border-white/70 rounded-full font-bold text-sm text-neutral-700">{statusMessage}</motion.p>}
        </motion.div>

        {/* TABS */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative shrink-0 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${activeTab === tab.key ? 'bg-neutral-900 text-white shadow-lg' : 'bg-white/40 text-neutral-600 hover:bg-white/60 border border-white/60'}`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>

            {/* ── ARTICLES ─────────────────────────────────────────── */}
            {activeTab === 'articles' && (
              <div className="flex flex-col gap-8">
                <div className={`p-8 md:p-10 ${glass}`}>
                  <h2 className="text-2xl font-black mb-6 tracking-tight">Add New Article</h2>
                  <form onSubmit={handleCreateArticle} className="flex flex-col gap-4">
                    <input required value={articleForm.title} onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))} placeholder="Article Title *" className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold" />
                    <input required value={articleForm.category} onChange={e => setArticleForm(p => ({ ...p, category: e.target.value }))} placeholder="Category (e.g. Growth, SaaS) *" className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium" />
                    <input value={articleForm.image_url} onChange={e => setArticleForm(p => ({ ...p, image_url: e.target.value }))} placeholder="Image URL (optional)" className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium" />
                    <textarea required rows={6} value={articleForm.content} onChange={e => setArticleForm(p => ({ ...p, content: e.target.value }))} placeholder="Article Content *" className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium resize-none" />
                    <button type="submit" disabled={loading} className="bg-neutral-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-black transition disabled:opacity-50">
                      {loading ? 'Publishing…' : '✦ Publish Article'}
                    </button>
                  </form>
                </div>
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-black tracking-tight">Published Articles ({articles.length})</h2>
                  {articles.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-5 bg-white/40 rounded-2xl border border-white/60 gap-4">
                      <div className="min-w-0">
                        <p className="font-black text-neutral-900 truncate">{a.title}</p>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">{a.category}</p>
                      </div>
                      <button onClick={() => handleDeleteArticle(a.id)} className="shrink-0 p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── IDENTITY / SOCIALS ─────────────────────────────── */}
            {activeTab === 'socials' && (
              <div className={`p-8 md:p-10 ${glass}`}>
                <h2 className="text-2xl font-black mb-8 tracking-tight">Identity & Social Links</h2>
                <div className="mb-6">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-500 block mb-2">Profile Photo</label>
                  {socialsForm.profile_image_url && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/60 shadow-md mb-3">
                      <Image src={socialsForm.profile_image_url} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full bg-white/50 border border-white/70 p-3 rounded-2xl text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-black file:bg-neutral-900 file:text-white file:text-xs" />
                  {uploadingImage && <p className="text-xs text-blue-500 font-bold mt-2">Uploading…</p>}
                </div>
                <form onSubmit={handleUpdateSocials} className="flex flex-col gap-4">
                  {[
                    { key: 'whatsapp_number', label: 'WhatsApp Number', ph: '01XXXXXXXXX' },
                    { key: 'email', label: 'Email Address', ph: 'you@email.com' },
                    { key: 'linkedin_url', label: 'LinkedIn URL', ph: 'https://linkedin.com/in/...' },
                    { key: 'instagram_url', label: 'Instagram URL', ph: 'https://instagram.com/...' },
                    { key: 'facebook_url', label: 'Facebook URL', ph: 'https://facebook.com/...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-black uppercase tracking-wider text-neutral-500 block mb-1">{f.label}</label>
                      <input value={(socialsForm as any)[f.key]} onChange={e => setSocialsForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full bg-white/50 border border-white/70 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-medium" />
                    </div>
                  ))}
                  <button type="submit" disabled={loading} className="mt-2 bg-neutral-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-black transition disabled:opacity-50">
                    {loading ? 'Saving…' : '✦ Save Identity'}
                  </button>
                </form>
              </div>
            )}

            {/* ── PENDING COMMENTS ──────────────────────────────── */}
            {activeTab === 'comments' && (
              <div className="flex flex-col gap-5">
                <h2 className="text-2xl font-black tracking-tight">Pending Review ({pendingComments.length})</h2>
                {pendingComments.length === 0 ? (
                  <div className={`p-10 text-center ${glass}`}>
                    <p className="text-neutral-400 font-bold text-lg">All clear — no pending comments! 🎉</p>
                  </div>
                ) : pendingComments.map(c => {
                  const p = parseContent(c.content);
                  const isTestimonial = !c.article_id;
                  return (
                    <motion.div key={c.id} layout className="flex flex-col gap-4 p-6 bg-white/40 rounded-2xl border border-white/60 shadow-sm">
                      <div className="flex items-start gap-4">
                        {p.image ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/60 shadow shrink-0">
                            <Image src={p.image} alt={c.author_name} width={48} height={48} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white/60 shadow shrink-0">
                            <Users size={20} className="text-blue-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-neutral-900">{c.author_name}</span>
                            {p.job && <span className="text-xs text-neutral-400 font-medium">{p.job}</span>}
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isTestimonial ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                              {isTestimonial ? '✦ Testimonial' : 'Article Comment'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 font-medium leading-relaxed mt-1">{p.text}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-white/40">
                        <button onClick={() => approveComment(c.id)} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 hover:bg-green-200 font-black text-xs tracking-widest uppercase rounded-xl transition disabled:opacity-50">
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button onClick={() => deleteComment(c.id)} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 font-black text-xs tracking-widest uppercase rounded-xl transition disabled:opacity-50">
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── TESTIMONIALS MANAGER ──────────────────────────── */}
            {activeTab === 'testimonials' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-black tracking-tight">Live Testimonials ({testimonials.length})</h2>
                  <p className="text-xs text-neutral-400 font-bold">⭐ = Featured · Drag to reorder · Edit badge & color</p>
                </div>
                {testimonials.length === 0 ? (
                  <div className={`p-10 text-center ${glass}`}>
                    <p className="text-neutral-400 font-bold text-lg">No approved testimonials yet.</p>
                  </div>
                ) : testimonials.map((t, i) => {
                  const p = parseContent(t.content);
                  const isEditing = editingId === t.id;
                  return (
                    <motion.div key={t.id} layout className={`flex flex-col gap-4 p-6 bg-white/40 rounded-2xl border-2 transition-all ${p.featured ? 'border-amber-200 bg-amber-50/30 shadow-amber-100' : 'border-white/60'} shadow-sm`}>
                      {/* Top Row */}
                      <div className="flex items-start gap-4">
                        {p.image ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/60 shadow shrink-0">
                            <Image src={p.image} alt={t.author_name} width={48} height={48} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white/60 shadow shrink-0">
                            <Users size={20} className="text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-neutral-900">{t.author_name}</span>
                            {p.job && <span className="text-xs text-neutral-400 font-medium italic">{p.job}</span>}
                            {p.featured && <Star size={14} className="text-amber-400 fill-amber-300" />}
                            {p.badge && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: (p.badgeColor || '#8b5cf6') + '22', color: p.badgeColor || '#8b5cf6' }}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 font-medium leading-relaxed mt-1 line-clamp-3">{p.text}</p>
                        </div>
                      </div>

                      {/* Badge Editor */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/70 flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Badge Label</label>
                              <input value={editBadge} onChange={e => setEditBadge(e.target.value)} placeholder="e.g. Top Pick, Partner, Client" className="bg-white/70 border border-white/70 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 font-bold text-sm" />
                              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Badge Color</label>
                              <div className="flex gap-2 flex-wrap">
                                {BADGE_PRESETS.map(preset => (
                                  <button key={preset.color} onClick={() => { setEditBadgeColor(preset.color); setEditBadge(preset.label); }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${editBadgeColor === preset.color ? 'ring-2 ring-offset-1 ring-neutral-900' : ''}`}
                                    style={{ backgroundColor: preset.color + '22', color: preset.color }}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <button onClick={() => saveEdits(t.id)} className="flex-1 bg-neutral-900 text-white font-black py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-black transition">Save Badge</button>
                                <button onClick={() => clearBadge(t.id)} className="px-4 bg-neutral-100 text-neutral-600 font-black py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-neutral-200 transition">Clear</button>
                                <button onClick={() => setEditingId(null)} className="px-4 bg-neutral-100 text-neutral-600 font-black py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-neutral-200 transition">Cancel</button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions Row */}
                      <div className="flex gap-2 flex-wrap pt-3 border-t border-white/40">
                        {/* Feature toggle */}
                        <button onClick={() => toggleFeatured(t)}
                          className={`flex items-center gap-1.5 px-4 py-2 font-black text-xs tracking-widest uppercase rounded-xl transition ${p.featured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-neutral-100 text-neutral-500 hover:bg-amber-50 hover:text-amber-600'}`}
                        >
                          <Star size={12} className={p.featured ? 'fill-amber-400' : ''} />
                          {p.featured ? 'Unfeature' : 'Feature'}
                        </button>

                        {/* Edit badge */}
                        <button onClick={() => { setEditingId(isEditing ? null : t.id); setEditBadge(p.badge || ''); setEditBadgeColor(p.badgeColor || '#8b5cf6'); }}
                          className="px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 font-black text-xs tracking-widest uppercase rounded-xl transition"
                        >
                          🏷 Badge
                        </button>

                        {/* Move Up */}
                        {i > 0 && (
                          <button onClick={() => moveTestimonial(i, 'up')} className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl transition">
                            <ChevronUp size={14} />
                          </button>
                        )}
                        {/* Move Down */}
                        {i < testimonials.length - 1 && (
                          <button onClick={() => moveTestimonial(i, 'down')} className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl transition">
                            <ChevronDown size={14} />
                          </button>
                        )}

                        {/* Delete */}
                        <button onClick={() => deleteComment(t.id)} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 font-black text-xs tracking-widest uppercase rounded-xl transition">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
