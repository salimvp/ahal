import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../ui/Button';

export default function ManageGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    title: '',
    category: 'Campus',
    image_url: '',
    description: '',
    display_order: 0
  });

  const categories = ['Campus', 'Academic', 'Arts & Sports', 'Internship', 'Community'];

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await api.getGallery();
      setGallery(data);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch gallery photos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      setFormData((prev) => ({ ...prev, image_url: res.url }));
      setFeedback({ type: 'success', message: 'Photo uploaded successfully' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image_url) {
      setFeedback({ type: 'error', message: 'Please provide or upload an image' });
      return;
    }

    try {
      await api.createGalleryItem(formData);
      setFeedback({ type: 'success', message: 'Photo added to archive successfully' });
      setFormData({
        title: '',
        category: 'Campus',
        image_url: '',
        description: '',
        display_order: 0
      });
      fetchGallery();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Save failed' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo from archive?')) return;
    try {
      await api.deleteGalleryItem(id);
      setFeedback({ type: 'success', message: 'Photo deleted' });
      fetchGallery();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Delete failed' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-dark-border">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light mb-1">
          Archive Management
        </div>
        <h1 className="text-2xl font-bold font-sans text-white">
          Photo Gallery & Media Archive
        </h1>
        <p className="text-xs text-ink-light-muted mt-1">
          Upload and curate images for the editorial photo archive on the public site.
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
          <Plus className="w-4 h-4 text-accent-light" />
          <span>Upload / Add New Photo</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Photo Caption / Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Smart Classroom Micro-Teaching Session"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Image URL / Upload File *
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://... or select photo file"
                className="flex-1 px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
              <label className="px-4 py-2 rounded-md bg-dark hover:bg-dark-elevated text-ink-light text-xs font-semibold border border-dark-border cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-3.5 h-3.5 text-accent-light" />
                <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Context Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short note about the photo context..."
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light resize-none"
            />
          </div>

          <Button type="submit" variant="darkPrimary" size="md" icon={false}>
            Add Photo to Archive
          </Button>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-lg bg-dark-surface border border-dark-border overflow-hidden"
          >
            <div className="h-40 bg-dark">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <span className="text-[10px] font-mono font-bold text-accent-light uppercase">{item.category}</span>
              <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 p-1.5 rounded bg-dark/80 text-rose-400 hover:bg-rose-950 transition-colors"
              title="Delete Photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
