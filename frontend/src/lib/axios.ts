import axios from 'axios';
import type { AxiosError } from 'axios';
import { store } from '@/redux/store';
import { logOut } from '@/redux/authSlice';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

let isRefreshing = false;
const failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue.length = 0;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if ((originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    (originalRequest as any)._retry = true;
    isRefreshing = true;

    return new Promise((resolve, reject) => {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        store.dispatch(logOut());
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return reject('No refresh token');
      }

      axios
        .post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        })
        .then((response) => {
          const { access: newToken } = response.data;
          localStorage.setItem('access_token', newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          resolve(axiosInstance(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          store.dispatch(logOut());
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
);

export default axiosInstance;