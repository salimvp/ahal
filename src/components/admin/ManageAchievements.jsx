import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Edit2, Trash2, Upload, Star, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../ui/Button';

export default function ManageAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Academic',
    year: '2026',
    image_url: '',
    rank_badge: '100% Pass',
    display_order: 0
  });

  const categories = ['Academic', 'Arts & Sports', 'Institutional', 'Faculty'];

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const data = await api.getAchievements();
      setAchievements(data);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load achievements' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleReset = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      category: 'Academic',
      year: '2026',
      image_url: '',
      rank_badge: '',
      display_order: 0
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      category: item.category || 'Academic',
      year: item.year || '',
      image_url: item.image_url || '',
      rank_badge: item.rank_badge || '',
      display_order: item.display_order || 0
    });
    setIsEditing(true);
    setCurrentId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.deleteAchievement(id);
      setFeedback({ type: 'success', message: 'Achievement deleted' });
      fetchAchievements();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Delete failed' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      setFormData((prev) => ({ ...prev, image_url: res.url }));
      setFeedback({ type: 'success', message: 'Image uploaded successfully' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateAchievement(currentId, formData);
        setFeedback({ type: 'success', message: 'Achievement updated successfully' });
      } else {
        await api.createAchievement(formData);
        setFeedback({ type: 'success', message: 'Achievement created successfully' });
      }
      handleReset();
      fetchAchievements();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Save failed' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-dark-border">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light mb-1">
          Carousel Management
        </div>
        <h1 className="text-2xl font-bold font-sans text-white">
          Moving Achievements & Honors
        </h1>
        <p className="text-xs text-ink-light-muted mt-1">
          Manage the items streaming across the moving achievements marquee slider on the homepage.
        </p>
      </div>

      {feedback.message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-accent/15 border border-accent/30 text-accent-light'
              : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
          {isEditing ? <Edit2 className="w-4 h-4 text-accent-light" /> : <Plus className="w-4 h-4 text-accent-light" />}
          <span>{isEditing ? 'Edit Milestone' : 'Add Milestone to Slider'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Milestone Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 100% Pass in Kerala D.El.Ed Board"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Subtitle / Details
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. 10th Consecutive Year"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Rank Badge (Golden Pill)
              </label>
              <input
                type="text"
                value={formData.rank_badge}
                onChange={(e) => setFormData({ ...formData, rank_badge: e.target.value })}
                placeholder="e.g. State Rank #1"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Image URL / Upload Photo
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://... or upload photo"
                className="flex-1 px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
              <label className="px-4 py-2 rounded-md bg-dark hover:bg-dark-elevated text-ink-light text-xs font-semibold border border-dark-border cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-3.5 h-3.5 text-accent-light" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short summary of this achievement..."
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-dark-border">
            <Button type="submit" variant="darkPrimary" size="md" icon={false}>
              {isEditing ? 'Save Changes' : 'Add to Carousel'}
            </Button>
            {isEditing && (
              <Button type="button" onClick={handleReset} variant="dark" size="md" icon={false}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Grid of current cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((item) => (
          <div
            key={item.id}
            className="rounded-lg bg-dark-surface border border-dark-border overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-40 bg-dark">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              {item.rank_badge && (
                <span className="absolute top-2 left-2 bg-gold text-dark font-mono font-bold text-[10px] px-2 py-0.5 rounded-sm">
                  {item.rank_badge}
                </span>
              )}
            </div>
            <div className="p-4 space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase text-accent-light">{item.category} • {item.year}</div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
              <p className="text-xs text-ink-light-muted line-clamp-2">{item.description}</p>
            </div>
            <div className="p-3 border-t border-dark-border bg-dark/60 flex items-center justify-end gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="p-1.5 rounded bg-dark text-gold-dark hover:bg-dark-elevated"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded bg-dark text-rose-400 hover:bg-rose-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
