import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não remover token em erros de timeout ou 504 (Gateway Timeout)
    if (error.response?.status === 504 || error.code === 'ECONNABORTED') {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expirado ou inválido
      const currentPath = window.location.pathname;
      localStorage.removeItem('token');
      // Redirecionar apenas se não estiver já na página de login
      if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
        // Usar setTimeout para evitar problemas de navegação durante renderização
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

