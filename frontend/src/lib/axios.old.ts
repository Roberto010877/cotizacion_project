import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/redux/store';
import { logOut } from '@/redux/authSlice';

// Crear la instancia de axios
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Variables para manejar el refresco del token
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y refrescar el token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      if (isRefreshing) {
        try {
          // Esperar a que se refresque el token
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      // Marcar esta petición como retry
      (originalRequest as any)._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken
        });

        const { access: newToken } = response.data;
        
        // Guardar el nuevo token
        localStorage.setItem('access_token', newToken);
        
        // Actualizar el header de la petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Procesar la cola de peticiones pendientes
        processQueue(null, newToken);
        
        // Reintentar la petición original
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si hay error al refrescar, limpiar todo
        processQueue(refreshError, null);
        store.dispatch(logOut());
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Si no es error 401 o ya se intentó refrescar, rechazar la promesa
    return Promise.reject(error);
  }
);

export default axiosInstance;

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access;
          processQueue(null, access);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          store.dispatch(logOut());
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        store.dispatch(logOut());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          
          // Retry the original request with new token
          const config = error.config;
          config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(config);
        } catch (refreshError) {
          // Refresh token failed, logout user
          store.dispatch(logOut());
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        // No refresh token available, logout user
        store.dispatch(logOut());
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;