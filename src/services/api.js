import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth — login/signup are handled by Supabase Auth UI directly
  // These are kept for potential API-level operations

  async verifyToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      return session.user;
    } catch {
      return null;
    }
  },

  // Announcements
  async getAnnouncements(category = 'All', search = '', includeInactive = false) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (includeInactive) params.append('includeInactive', 'true');

    const res = await fetch(`${API_BASE}/announcements?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  async getAnnouncementById(id) {
    const res = await fetch(`${API_BASE}/announcements/${id}`);
    if (!res.ok) throw new Error('Announcement not found');
    return res.json();
  },

  async createAnnouncement(payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create announcement');
    return data;
  },

  async updateAnnouncement(id, payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update announcement');
    return data;
  },

  async deleteAnnouncement(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete announcement');
    return data;
  },

  // Achievements
  async getAchievements() {
    const res = await fetch(`${API_BASE}/achievements`);
    if (!res.ok) throw new Error('Failed to fetch achievements');
    return res.json();
  },

  async createAchievement(payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/achievements`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create achievement');
    return data;
  },

  async updateAchievement(id, payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/achievements/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update achievement');
    return data;
  },

  async deleteAchievement(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/achievements/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete achievement');
    return data;
  },

  // Gallery
  async getGallery(category = 'All', limit = null) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (limit) params.append('limit', limit);
    const res = await fetch(`${API_BASE}/gallery?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch gallery');
    return res.json();
  },

  async createGalleryItem(payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add gallery item');
    return data;
  },

  async deleteGalleryItem(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete gallery item');
    return data;
  },

  // Inquiries
  async submitInquiry(payload) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
    return data;
  },

  async getInquiries() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/inquiries`, { headers });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
  },

  async markInquiryRead(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/inquiries/${id}/read`, {
      method: 'PUT',
      headers,
    });
    return res.json();
  },

  async deleteInquiry(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/inquiries/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete inquiry');
    return data;
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },

  // Upload
  async uploadFile(file) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'File upload failed');
    return data;
  },
};
