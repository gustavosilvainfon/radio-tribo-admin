'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    musicRequests: 0,
    news: 0,
    pendingRequests: 0,
    streaming: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fazer requisições em paralelo, mas tratar erros individualmente
      const [requestsRes, newsRes, streamingRes] = await Promise.allSettled([
        api.get('/music-requests').catch(err => {
          // Se for erro de autenticação, não continuar
          if (err.response?.status === 401 || err.response?.status === 403) {
            throw err;
          }
          return { data: { data: [] } };
        }),
        api.get('/news').catch(err => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            throw err;
          }
          return { data: { data: [] } };
        }),
        api.get('/streaming/stats').catch(err => {
          // Para streaming, não bloquear se der erro (pode ser timeout)
          if (err.response?.status === 401 || err.response?.status === 403) {
            throw err;
          }
          return { data: { success: false } };
        })
      ]);

      const requests = requestsRes.status === 'fulfilled' ? (requestsRes.value.data.data || []) : [];
      const pending = requests.filter(r => r.status === 'pendente').length;
      const news = newsRes.status === 'fulfilled' ? (newsRes.value.data.data?.length || 0) : 0;
      const streaming = streamingRes.status === 'fulfilled' && streamingRes.value.data.success 
        ? streamingRes.value.data.data 
        : null;

      setStats({
        musicRequests: requests.length,
        news: news,
        pendingRequests: pending,
        streaming: streaming
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Se for erro de autenticação, o interceptor já vai redirecionar
      if (error.response?.status === 401 || error.response?.status === 403) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/50 shadow-xl">
          <div className="text-gray-400 text-sm mb-2">Pedidos Musicais</div>
          <div className="text-3xl font-black text-red-400">{stats.musicRequests}</div>
        </div>

        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-purple-500/50 shadow-xl">
          <div className="text-gray-400 text-sm mb-2">Notícias Publicadas</div>
          <div className="text-3xl font-black text-purple-400">{stats.news}</div>
        </div>

        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-yellow-500/50 shadow-xl">
          <div className="text-gray-400 text-sm mb-2">Pedidos Pendentes</div>
          <div className="text-3xl font-black text-yellow-400">{stats.pendingRequests}</div>
        </div>

        {stats.streaming && (
          <div className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 ${
            stats.streaming.status === 'Ligado' ? 'border-green-500/50' : 'border-red-500/50'
          } shadow-xl`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">👂 Ouvintes Online</div>
              <div className={`w-2 h-2 rounded-full ${
                stats.streaming.status === 'Ligado' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
            </div>
            <div className="text-3xl font-black text-green-400">
              {stats.streaming.ouvintes_conectados || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Status: {stats.streaming.status}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/pedidos-musicais')}
            className="p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-white transition"
          >
            Ver Pedidos
          </button>
          <button
            onClick={() => router.push('/noticias')}
            className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white transition"
          >
            Gerenciar Notícias
          </button>
          <button
            onClick={() => router.push('/configuracoes')}
            className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-lg text-white transition"
          >
            Configurações
          </button>
          <button
            onClick={() => router.push('/estatisticas')}
            className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-lg text-white transition"
          >
            Estatísticas
          </button>
        </div>
      </div>
    </div>
  );
}
