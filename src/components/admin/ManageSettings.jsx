import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, User, Phone, Mail, MapPin, CheckCircle2, AlertCircle, X, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

export default function ManageSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passFeedback, setPassFeedback] = useState({ type: '', message: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setFeedback({ type: 'success', message: 'Settings saved and applied to website' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    try {
      const res = await api.uploadFile(file);
      handleChange(key, res.url);
      setFeedback({ type: 'success', message: 'Image uploaded successfully' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassFeedback({ type: '', message: '' });

    if (passwords.next !== passwords.confirm) {
      setPassFeedback({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.next });
      if (error) throw error;
      setPassFeedback({ type: 'success', message: 'Password updated successfully' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPassFeedback({ type: 'error', message: err.message || 'Password update failed' });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-ink-light-muted text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="pb-6 border-b border-dark-border">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light mb-1">
          System Configuration
        </div>
        <h1 className="text-2xl font-bold font-sans text-white">
          Institute Profile & Leadership Desks
        </h1>
        <p className="text-xs text-ink-light-muted mt-1">
          Configure Principal & Manager welcome messages, campus contact numbers, and hero media.
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

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Principal's Desk */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
            <User className="w-4 h-4 text-accent-light" />
            <span>Principal's Desk Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Principal Name
              </label>
              <input
                type="text"
                value={settings.principal_name || ''}
                onChange={(e) => handleChange('principal_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Qualifications
              </label>
              <input
                type="text"
                value={settings.principal_qualification || ''}
                onChange={(e) => handleChange('principal_qualification', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Designation
              </label>
              <input
                type="text"
                value={settings.principal_designation || ''}
                onChange={(e) => handleChange('principal_designation', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Principal Portrait Image URL / Upload
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={settings.principal_image || ''}
                onChange={(e) => handleChange('principal_image', e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
              <label className="px-4 py-2 rounded-md bg-dark hover:bg-dark-elevated text-ink-light text-xs font-semibold border border-dark-border cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-3.5 h-3.5 text-accent-light" />
                <span>Upload</span>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload('principal_image', e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Principal Welcome Message
            </label>
            <textarea
              rows={4}
              value={settings.principal_message || ''}
              onChange={(e) => handleChange('principal_message', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>
        </div>

        {/* Manager's Desk */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
            <User className="w-4 h-4 text-gold-dark" />
            <span>Manager's Desk (Tirurangadi Muslim Orphanage Committee)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Manager / General Secretary Name
              </label>
              <input
                type="text"
                value={settings.manager_name || ''}
                onChange={(e) => handleChange('manager_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Designation
              </label>
              <input
                type="text"
                value={settings.manager_designation || ''}
                onChange={(e) => handleChange('manager_designation', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                value={settings.manager_qualification || ''}
                onChange={(e) => handleChange('manager_qualification', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Manager Portrait Image URL / Upload
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={settings.manager_image || ''}
                onChange={(e) => handleChange('manager_image', e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
              <label className="px-4 py-2 rounded-md bg-dark hover:bg-dark-elevated text-ink-light text-xs font-semibold border border-dark-border cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-3.5 h-3.5 text-gold-dark" />
                <span>Upload</span>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload('manager_image', e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Manager Message
            </label>
            <textarea
              rows={4}
              value={settings.manager_message || ''}
              onChange={(e) => handleChange('manager_message', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>
        </div>

        {/* Contact & Hero Media */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-accent-light" />
            <span>Campus Contact & Hero Background</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Contact Phone Numbers
              </label>
              <input
                type="text"
                value={settings.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Contact Email Address
              </label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Full Campus Address
            </label>
            <input
              type="text"
              value={settings.contact_address || ''}
              onChange={(e) => handleChange('contact_address', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Hero Video MP4 URL
              </label>
              <input
                type="text"
                value={settings.hero_video_url || ''}
                onChange={(e) => handleChange('hero_video_url', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                Hero Fallback Photo URL
              </label>
              <input
                type="text"
                value={settings.hero_poster_image || ''}
                onChange={(e) => handleChange('hero_poster_image', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="darkPrimary"
          size="lg"
          loading={saving}
          iconComponent={Save}
        >
          Save All System Settings
        </Button>
      </form>

      {/* Password Management */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 sm:p-8 space-y-5">
        <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-light" />
          <span>Security & Password Management</span>
        </h2>

        {passFeedback.message && (
          <div
            className={`p-3 rounded-md text-xs ${
              passFeedback.type === 'success'
                ? 'bg-accent/15 border border-accent/30 text-accent-light'
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
            }`}
          >
            {passFeedback.message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-md text-xs text-white focus:outline-none focus:border-accent-light"
            />
          </div>

          <Button type="submit" variant="dark" size="sm" icon={false}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
