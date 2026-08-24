/**
 * Security & Anti-Spam Protections
 */

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ENQUIRIES_PER_WINDOW = 5; // Max 5 submissions per minute per IP

/**
 * Check and record IP rate limit
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter out older timestamps outside current window
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_ENQUIRIES_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodically clean map
  if (rateLimitMap.size > 1000) {
    for (const [key, times] of rateLimitMap.entries()) {
      if (times.every(t => now - t > RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return true;
}

/**
 * Validate and sanitize Enquiry submission
 */
export function validateEnquiryInput(data) {
  // 1. Honeypot check (bots fill hidden field `_gotcha` or `website`)
  if (data._gotcha || data.website || data.hp_check) {
    throw new Error('Automated submission rejected.');
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const subject = typeof data.subject === 'string' ? data.subject.trim() : 'General Query';
  const message = typeof data.message === 'string' ? data.message.trim() : '';

  if (!name || name.length < 2 || name.length > 100) {
    throw new Error('Name is required and must be between 2 and 100 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email) || email.length > 150) {
    throw new Error('A valid email address is required.');
  }

  if (phone && phone.length > 30) {
    throw new Error('Phone number must not exceed 30 characters.');
  }

  if (!message || message.length < 5 || message.length > 2000) {
    throw new Error('Message is required and must be between 5 and 2000 characters.');
  }

  return {
    name,
    email,
    phone,
    subject: subject.substring(0, 100),
    message
  };
}

/**
 * Extract client IP address safely
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

export default {
  checkRateLimit,
  validateEnquiryInput,
  getClientIp
};
