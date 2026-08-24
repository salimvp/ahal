import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Calendar, Trash2, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';
import { api } from '../../services/api';

export default function ManageInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getInquiries();
      setInquiries(data);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load inquiries' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markInquiryRead(id);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await api.deleteInquiry(id);
      setFeedback({ type: 'success', message: 'Inquiry deleted' });
      fetchInquiries();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Delete failed' });
    }
  };

  const filtered = inquiries.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.subject && i.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-border">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light mb-1">
            Communication Inbox
          </div>
          <h1 className="text-2xl font-bold font-sans text-white">
            Admission & Contact Inquiries
          </h1>
          <p className="text-xs text-ink-light-muted mt-1">
            Manage submissions received via the public website inquiry form.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light-muted" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-dark-surface border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
          />
        </div>
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

      {loading ? (
        <div className="text-center py-10 text-xs text-ink-light-muted">Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-dark-surface rounded-xl border border-dark-border p-8 text-ink-light-muted text-xs">
          No inquiries in inbox.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-xl border transition-colors ${
                item.is_read
                  ? 'bg-dark-surface border-dark-border'
                  : 'bg-dark-surface border-accent/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    {!item.is_read && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/20 text-accent-light">
                        NEW
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] bg-dark text-ink-light-secondary border border-dark-border">
                      {item.subject || 'Inquiry'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-light-muted">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-accent-light" />
                      <a href={`mailto:${item.email}`} className="hover:text-white">
                        {item.email}
                      </a>
                    </span>
                    {item.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gold-dark" />
                        <a href={`tel:${item.phone}`} className="hover:text-white font-mono">
                          {item.phone}
                        </a>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-ink-light-muted font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="px-3 py-1 rounded bg-dark hover:bg-dark-elevated text-ink-light text-xs font-semibold border border-dark-border transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-accent-light" />
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded bg-dark hover:bg-rose-950 text-rose-400 transition-colors cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-ink-light-secondary bg-dark p-4 rounded-md border border-dark-border leading-relaxed whitespace-pre-line font-sans">
                {item.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
