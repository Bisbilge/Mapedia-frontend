// src/api/client.js

import axios from 'axios';

const API_BASE_URL = 'https://mapedia-ql15.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── IN-MEMORY CACHE (60s TTL) ──────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60 * 1000;
const CACHE_MAX = 100;

const CACHEABLE = ['/categories/', '/venues/?search'];

function isCacheable(url = '') {
  return CACHEABLE.some(prefix => url.includes(prefix));
}

// ── REQUEST INTERCEPTORS ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // 1. Auth token ekleme
    const token = localStorage.getItem('access');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Cache kontrolü (adapter override ile gerçek istek engelleme)
    if (config.method === 'get' && isCacheable(config.url)) {
      const key = (config.url || '') + JSON.stringify(config.params || {});
      const cached = cache.get(key);

      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        // İsteği network'e göndermeden doğrudan önbellekten dön
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK (from cache)',
            headers: {},
            config,
            request: {},
          });
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTORS ──────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    const config = response.config;

    // Sadece gerçek ve geçerli JSON verilerini cache'e al (HTML gelirse saklama)
    const isHtmlResponse = typeof response.data === 'string' && response.data.trim().startsWith('<!doctype');

    if (config.method === 'get' && isCacheable(config.url) && !isHtmlResponse && response.status === 200) {
      const key = (config.url || '') + JSON.stringify(config.params || {});
      if (cache.size >= CACHE_MAX) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      cache.set(key, { data: response.data, ts: Date.now() });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized durumunda Token Refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');

      // Refresh token yoksa veya public bir istekse zorla login sayfasına yönlendirip döngüye sokma
      if (!refreshToken) {
        localStorage.removeItem('access');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
