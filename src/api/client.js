import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mapedia.org/api/v1',
  timeout: 30000,
});

// Simple in-memory GET cache (60 second TTL, max 100 entries)
const cache = new Map();
const CACHE_TTL = 60 * 1000;
const CACHE_MAX = 100;

const CACHEABLE = ['/categories/', '/categories/?', '/venues/?search'];

function isCacheable(url) {
  return CACHEABLE.some(prefix => url.includes(prefix));
}

api.interceptors.request.use((config) => {
  if (config.method === 'get' && isCacheable(config.url)) {
    const key = config.url + JSON.stringify(config.params || {});
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      config._fromCache = true;
      config._cacheData = cached.data;
    }
  }
  return config;
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Store successful GET responses in cache
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    if (config.method === 'get' && isCacheable(config.url)) {
      const key = config.url + JSON.stringify(config.params || {});
      if (cache.size >= CACHE_MAX) {
        cache.delete(cache.keys().next().value);
      }
      cache.set(key, { data: response.data, ts: Date.now() });
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token on 401, logout on failure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh');

      if (!refreshToken) {
        return logoutAndRedirect(error);
      }

      try {
        const res = await axios.post('https://mapedia.org/api/v1/auth/refresh/', {
          refresh: refreshToken
        });

        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);

      } catch {
        return logoutAndRedirect(error);
      }
    }

    return Promise.reject(error);
  }
);

const logoutAndRedirect = (error) => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  window.location.href = '/login';
  return Promise.reject(error);
};

export default api;
