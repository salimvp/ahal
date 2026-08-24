import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';
import Button from '../ui/Button';

export default function ManageFaculties() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    image_url: '',
    image_key: null,
    display_order: 0,
    is_active: true
  });

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const data = await api.getFaculties('All', '', true);
      setFaculties(data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load faculty directory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleResetForm = () => {
    setFormData({
      name: '',
      department: '',
      image_url: '',
      image_key: null,
      display_order: faculties.length + 1,
      is_active: true
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      department: item.department || '',
      image_url: item.image_url || '',
      image_key: item.image_key || null,
      display_order: item.display_order ?? 0,
      is_active: item.is_active !== false && item.is_active !== 0
    });
    setIsEditing(true);
    setCurrentId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteFaculty(id);
      setFeedback({ type: 'success', message: 'Faculty profile deleted successfully' });
      fetchFaculties();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Delete failed' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFeedback({ type: '', message: '' });
    try {
      const result = await api.uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        image_url: result.url,
        image_key: result.key
      }));
      setFeedback({ type: 'success', message: `Photo uploaded successfully: ${result.filename}` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Faculty name is required' });
      return;
    }

    try {
      if (isEditing) {
        await api.updateFaculty(currentId, formData);
        setFeedback({ type: 'success', message: 'Faculty profile updated successfully' });
      } else {
        await api.createFaculty(formData);
        setFeedback({ type: 'success', message: 'New faculty profile added successfully' });
      }
      handleResetForm();
      fetchFaculties();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const filtered = faculties.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-dark-border">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light mb-1">
          Faculty Directory Management
        </div>
        <h1 className="text-2xl font-bold font-sans text-white">
          Faculty Section
        </h1>
        <p className="text-xs text-ink-light-muted mt-1">
          Add, edit, or delete faculty members with their photo, name, and typed department.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-accent/15 border border-accent/30 text-accent-light'
              : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simplified Faculty Form Card */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
            {isEditing ? <Edit2 className="w-4 h-4 text-accent-light" /> : <Plus className="w-4 h-4 text-accent-light" />}
            <span>{isEditing ? 'Edit Faculty Member' : 'Add New Faculty Member'}</span>
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-ink-light-muted hover:text-white transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Faculty Name */}
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Faculty Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. A. Basheer / Shanavas Paravannur"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
              />
            </div>

            {/* Typed Department */}
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Department (Type any department / role)
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Pedagogy, Mathematics, Science, Principal, Administration"
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
              />
            </div>
          </div>

          {/* Big Box Image Upload & Preview */}
          <div className="p-4 bg-dark/60 border border-dark-border rounded-lg space-y-3">
            <label className="block text-xs font-semibold text-ink-light-secondary">
              Faculty Photo (Box Shaped Image)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {formData.image_url ? (
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden border border-dark-border bg-dark relative shrink-0 shadow-soft-md">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover object-top"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '', image_key: null })}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-950/80 hover:bg-rose-900 text-white rounded-full transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl border-2 border-dashed border-dark-border bg-dark flex flex-col items-center justify-center text-ink-light-muted shrink-0">
                  <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                  <span className="text-[10px]">No Photo</span>
                </div>
              )}

              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-dark-border hover:bg-white/10 text-white rounded-md text-xs font-semibold transition-colors">
                    <Upload className="w-3.5 h-3.5 text-accent-light" />
                    <span>{uploading ? 'Uploading to Supabase...' : 'Upload Photo to Supabase'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-[11px] text-ink-light-muted">
                  Or paste direct image URL:
                </div>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... or /principal.jpeg"
                  className="w-full px-3 py-2 bg-dark border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Options & Order */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })}
                className="w-24 px-3 py-1.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-dark-border text-accent focus:ring-accent bg-dark"
              />
              <span className="text-xs text-ink-light font-medium">
                Active & Visible on Public Website
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center gap-3">
            <Button type="submit" variant="primary" size="md" disabled={uploading}>
              {isEditing ? 'Save Changes' : 'Add Faculty Member'}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" size="md" onClick={handleResetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-light-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name or department..."
            className="w-full pl-9 pr-3 py-2 bg-dark-surface border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light"
          />
        </div>
        <div className="text-xs text-ink-light-muted">
          Total Faculty: {filtered.length}
        </div>
      </div>

      {/* Faculty Cards Grid (Big Box Image Frame) */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-ink-light-muted">
            Loading faculty directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center bg-dark-surface border border-dark-border rounded-xl text-xs text-ink-light-muted">
            No faculty members found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((faculty) => (
              <div
                key={faculty.id}
                className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col justify-between group hover:border-accent/40 transition-all shadow-soft-sm"
              >
                {/* Big Box Image Frame */}
                <div className="relative aspect-[4/5] w-full bg-dark overflow-hidden border-b border-dark-border">
                  <img
                    src={faculty.image_url || '/principal.jpeg'}
                    alt={faculty.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/principal.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />

                  {/* Top Status */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        faculty.is_active
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {faculty.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {/* Overlay Info (Name & Typed Department) */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-bold text-white leading-tight drop-shadow-sm">
                      {faculty.name}
                    </h3>
                    {faculty.department && (
                      <p className="text-xs font-semibold text-accent-light drop-shadow-sm mt-0.5">
                        {faculty.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3.5 flex items-center justify-between gap-2 bg-dark-surface">
                  <span className="text-[10px] font-mono text-ink-light-muted">
                    Order: #{faculty.display_order ?? 0}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(faculty)}
                      className="p-1.5 rounded text-ink-light-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit faculty"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faculty.id, faculty.name)}
                      className="p-1.5 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete faculty"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
