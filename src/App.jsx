import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';

// Public Section Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Announcements from './components/Announcements';
import AnnouncementModal from './components/AnnouncementModal';
import AboutUs from './components/AboutUs';

import Achievements from './components/Achievements';
import WhySSMO from './components/WhySSMO';
import Courses from './components/Courses';
import Gallery from './components/Gallery';
import GalleryPage from './components/GalleryPage';
import FacultiesPage from './components/FacultiesPage';
import ContactLocation from './components/ContactLocation';
import Footer from './components/Footer';

// Admin CMS Components
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import ManageAnnouncements from './components/admin/ManageAnnouncements';
import ManageAchievements from './components/admin/ManageAchievements';
import ManageGallery from './components/admin/ManageGallery';
import ManageInquiries from './components/admin/ManageInquiries';
import ManageSettings from './components/admin/ManageSettings';

// Public Homepage Flow with Art-Directed Section Pacing
function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModalAnnouncement, setActiveModalAnnouncement] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [annRes, achRes, galRes, setRes] = await Promise.all([
          api.getAnnouncements(),
          api.getAchievements(),
          api.getGallery('All', 6),
          api.getSettings()
        ]);
        setAnnouncements(annRes || []);
        setAchievements(achRes || []);
        setGallery(galRes || []);
        setSettings(setRes || {});
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col selection:bg-accent selection:text-white">
      {/* Navigation Header */}
      <Navbar
        announcements={announcements}
        onOpenAnnouncementModal={(item) => setActiveModalAnnouncement(item)}
      />

      {/* 01. HERO SECTION — Cinematic / Dark */}
      <Hero settings={settings} />

      {/* 02. ANNOUNCEMENTS & CIRCULARS — Clean / Light Editorial */}
      <Announcements
        announcements={announcements}
        onSelectAnnouncement={(item) => setActiveModalAnnouncement(item)}
        loading={loading}
      />

      {/* 03. OUR STORY & LEADERSHIP — Editorial Split */}
      <AboutUs settings={settings} />



      {/* 05. ACHIEVEMENTS & ACCOLADES — Wide Editorial Image Carousel / Light */}
      <Achievements achievements={achievements} />

      {/* 06. WHY SSMO — Custom Visual Narrative / Dark */}
      <WhySSMO />

      {/* 07. ACADEMIC PROGRAM (D.El.Ed) — Structured Specifications / Light */}
      <Courses />

      {/* 08. PHOTO & MEDIA ARCHIVE — Asymmetric Editorial Gallery / Light */}
      <Gallery gallery={gallery} />

      {/* 09. VISIT US & LOCATION — Connection / Dark */}
      <ContactLocation settings={settings} />

      {/* 10. FOOTER — Substantial Architectural Closure / Dark */}
      <Footer settings={settings} />

      {/* Interactive Announcement Modal Reader */}
      {activeModalAnnouncement && (
        <AnnouncementModal
          announcement={activeModalAnnouncement}
          onClose={() => setActiveModalAnnouncement(null)}
        />
      )}
    </div>
  );
}

// Protected Admin Route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-ink-light-muted text-xs font-mono">Verifying admin session...</div>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<HomePage />} />

          {/* Gallery Full Page */}
          <Route path="/gallery" element={<GalleryPage />} />

          {/* Faculties Full Page */}
          <Route path="/faculties" element={<FacultiesPage />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin CMS */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/announcements" replace />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route path="achievements" element={<ManageAchievements />} />
            <Route path="gallery" element={<ManageGallery />} />
            <Route path="inquiries" element={<ManageInquiries />} />
            <Route path="settings" element={<ManageSettings />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
