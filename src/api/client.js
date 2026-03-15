import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mapedia.org/api/v1',
  timeout: 30000,
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
