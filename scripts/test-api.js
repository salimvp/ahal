/**
 * End-to-End API Test Suite for SSMO Backend
 * 
 * Usage:
 *   node scripts/test-api.js
 */

import http from 'node:http';
import { handleApiRequest } from '../api/_lib/router.js';

function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        await handleApiRequest(req, res);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`
      });
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' Starting SSMO Backend Integration Tests');
  console.log('====================================================\n');

  const { server, baseUrl } = await createTestServer();
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('PASSED');
      passed++;
    } catch (err) {
      console.log(`FAILED\n  Error: ${err.message}`);
      failed++;
    }
  }

  let authToken = '';
  let createdAnnId = '';
  let createdAchId = '';
  let createdGalId = '';
  let createdInqId = '';

  try {
    // 1. Admin Login
    await test('POST /api/auth/login - Admin Authentication', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'ssmo@admin2026' })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      authToken = data.token;
    });

    // 2. Token Verify
    await test('GET /api/auth/verify - Verify JWT Token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.authenticated) throw new Error('Token verification failed');
    });

    // 3. Public Announcements
    await test('GET /api/announcements - Retrieve Public Announcements', async () => {
      const res = await fetch(`${baseUrl}/api/announcements`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Expected array of announcements');
    });

    // 4. Create Announcement (Admin)
    await test('POST /api/announcements - Admin Create Announcement', async () => {
      const res = await fetch(`${baseUrl}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Test Circular 2026',
          category: 'Admissions',
          badge: 'NEW',
          content: 'This is a test announcement created during verification.',
          is_pinned: true,
          is_active: true
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.id) throw new Error('Expected created announcement with ID');
      createdAnnId = data.id;
    });

    // 5. Update Announcement
    await test(`PUT /api/announcements/:id - Update Announcement`, async () => {
      const res = await fetch(`${baseUrl}/api/announcements/${createdAnnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Updated Circular 2026',
          badge: 'IMPORTANT'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.title !== 'Updated Circular 2026') throw new Error('Update title mismatch');
    });

    // 6. Delete Announcement
    await test(`DELETE /api/announcements/:id - Delete Announcement`, async () => {
      const res = await fetch(`${baseUrl}/api/announcements/${createdAnnId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error('Delete failed');
    });

    // 7. Public Achievements
    await test('GET /api/achievements - Retrieve Public Achievements', async () => {
      const res = await fetch(`${baseUrl}/api/achievements`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Expected array of achievements');
    });

    // 8. Create Achievement
    await test('POST /api/achievements - Admin Create Milestone', async () => {
      const res = await fetch(`${baseUrl}/api/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'State Excellence Recognition 2026',
          subtitle: 'Best Teacher Training Institute',
          category: 'Pedagogy',
          year: '2026',
          rank_badge: 'Rank #1',
          image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.id) throw new Error('Expected created achievement with ID');
      createdAchId = data.id;
    });

    // 9. Delete Achievement
    await test(`DELETE /api/achievements/:id - Delete Achievement`, async () => {
      const res = await fetch(`${baseUrl}/api/achievements/${createdAchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });

    // 10. Public Gallery
    await test('GET /api/gallery - Retrieve Public Gallery Photos', async () => {
      const res = await fetch(`${baseUrl}/api/gallery`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Expected array of gallery photos');
    });

    // 11. Create Gallery Item
    await test('POST /api/gallery - Admin Add Photo to Archive', async () => {
      const res = await fetch(`${baseUrl}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Campus Laboratory Practice Session',
          category: 'Campus',
          image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000',
          description: 'Students working in teaching lab'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.id) throw new Error('Expected created gallery photo with ID');
      createdGalId = data.id;
    });

    // 12. Delete Gallery Item
    await test(`DELETE /api/gallery/:id - Delete Gallery Item`, async () => {
      const res = await fetch(`${baseUrl}/api/gallery/${createdGalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });

    // 13. Public Inquiry Submission
    await test('POST /api/inquiries - Submit Visitor Inquiry', async () => {
      const res = await fetch(`${baseUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ahmed Zubair',
          email: 'zubair@example.com',
          phone: '+91 9876543210',
          subject: 'Admission Query 2026',
          message: 'I would like to inquire regarding the D.El.Ed eligibility criteria.'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.id) throw new Error('Expected created inquiry with ID');
      createdInqId = data.id;
    });

    // 14. Admin Inquiries List
    await test('GET /api/inquiries - Admin Retrieve Inquiries', async () => {
      const res = await fetch(`${baseUrl}/api/inquiries`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Expected array of inquiries');
    });

    // 15. Mark Inquiry Read
    await test(`PUT /api/inquiries/:id/read - Mark Inquiry as Read`, async () => {
      const res = await fetch(`${baseUrl}/api/inquiries/${createdInqId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });

    // 16. Delete Inquiry
    await test(`DELETE /api/inquiries/:id - Delete Inquiry`, async () => {
      const res = await fetch(`${baseUrl}/api/inquiries/${createdInqId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });

    // 17. Public Settings
    await test('GET /api/settings - Retrieve Settings Map', async () => {
      const res = await fetch(`${baseUrl}/api/settings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data !== 'object') throw new Error('Expected settings object');
    });

    // 18. Admin Update Settings
    await test('PUT /api/settings - Admin Update Settings', async () => {
      const res = await fetch(`${baseUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          tagline: 'Learn With Passion, Live With Purpose - Verified'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.tagline.includes('Verified')) throw new Error('Settings update mismatch');
    });

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(` Test Summary: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
