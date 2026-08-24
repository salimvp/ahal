import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  Pin,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Search
} from 'lucide-react';
import { api } from '../../services/api';
import AnnouncementModal from '../AnnouncementModal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    content: '',
    category: 'Notices',
    badge: 'NEW',
    is_pinned: false,
    is_active: true
  });

  const categories = ['Admissions', 'Examinations', 'Notices', 'Events', 'Academic', 'Achievements'];
  const badges = ['NEW', 'IMPORTANT', 'URGENT', 'EXAM', 'ADMISSIONS', 'LATEST', 'CIRCULAR'];

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements('All', '', true);
      setAnnouncements(data);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load announcements' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleResetForm = () => {
    setFormData({
      title: '',
      link: '',
      content: '',
      category: 'Notices',
      badge: 'NEW',
      is_pinned: false,
      is_active: true
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      link: item.link || '',
      content: item.content || '',
      category: item.category || 'Notices',
      badge: item.badge || 'NEW',
      is_pinned: !!item.is_pinned,
      is_active: item.is_active !== 0
    });
    setIsEditing(true);
    setCurrentId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this circular?')) return;
    try {
      await api.deleteAnnouncement(id);
      setFeedback({ type: 'success', message: 'Announcement deleted successfully' });
      fetchAnnouncements();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Delete failed' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      setFormData((prev) => ({ ...prev, link: result.url }));
      setFeedback({ type: 'success', message: `File uploaded: ${result.filename}` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      if (isEditing) {
        await api.updateAnnouncement(currentId, formData);
        setFeedback({ type: 'success', message: 'Announcement updated successfully' });
      } else {
        await api.createAnnouncement(formData);
        setFeedback({ type: 'success', message: 'Announcement published successfully' });
      }
      handleResetForm();
      fetchAnnouncements();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-dark-border">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light mb-1">
          Bulletin Management
        </div>
        <h1 className="text-2xl font-bold font-sans text-white">
          Announcements & Circulars
        </h1>
        <p className="text-xs text-ink-light-muted mt-1">
          Add or edit circular titles and attached document links that display on the public announcement board.
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

      {/* Clean Form Card (Design Principle 46) */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
          {isEditing ? <Edit2 className="w-4 h-4 text-accent-light" /> : <Plus className="w-4 h-4 text-accent-light" />}
          <span>{isEditing ? 'Edit Announcement' : 'Create New Circular Notice'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Notice Title * (Appears as main clickable link)
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. D.El.Ed Admission Notification 2026-2028 Batch Open for Registration"
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Target URL / File Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://... or /uploads/circular.pdf"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
                />
                {formData.link && (
                  <a
                    href={formData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-light"
                    title="Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col justify-end">
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Or Upload Document
              </label>
              <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md bg-dark hover:bg-dark-elevated text-ink-light text-xs font-semibold border border-dark-border cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-accent-light" />
                <span>{uploading ? 'Uploading...' : 'Upload PDF/Image'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Full Circular Content (Renders in the modal reader)
            </label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Detailed instructions, dates, eligibility details..."
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                Badge
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              >
                {badges.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="w-4 h-4 rounded bg-dark border-dark-border text-accent focus:ring-accent"
              />
              <label htmlFor="is_pinned" className="text-xs font-semibold text-ink-light-secondary cursor-pointer flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-gold-dark" /> Pin Notice
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded bg-dark border-dark-border text-accent focus:ring-accent"
              />
              <label htmlFor="is_active" className="text-xs font-semibold text-ink-light-secondary cursor-pointer">
                Publish Active
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-dark-border">
            <Button
              type="submit"
              variant="darkPrimary"
              size="md"
              icon={false}
            >
              {isEditing ? 'Save Changes' : 'Publish Notice'}
            </Button>

            {isEditing && (
              <Button
                type="button"
                onClick={handleResetForm}
                variant="dark"
                size="md"
                icon={false}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Table (Design Principle 47) */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold font-sans text-white">
            Published Records ({filtered.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-ink-light-muted">Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-ink-light-muted">No notices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark text-ink-light-muted uppercase font-mono text-[10px] border-b border-dark-border">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Title & Link</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {item.is_pinned === 1 && (
                          <Pin className="w-3.5 h-3.5 text-gold-dark" title="Pinned" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.is_active ? 'bg-accent/20 text-accent-light' : 'bg-white/5 text-ink-light-muted'
                        }`}>
                          {item.is_active ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-white truncate">
                        {item.title}
                      </div>
                      {item.link && (
                        <div className="text-[11px] text-accent-light truncate">
                          {item.link}
                        </div>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap text-ink-light-secondary">
                      {item.category}
                    </td>

                    <td className="p-3 whitespace-nowrap text-ink-light-muted font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 rounded bg-dark hover:bg-dark-elevated text-ink-light transition-colors cursor-pointer"
                          title="Preview Modal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded bg-dark hover:bg-dark-elevated text-gold-dark transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded bg-dark hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {previewItem && (
        <AnnouncementModal
          announcement={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}
