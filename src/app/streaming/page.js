'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function StreamingPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
    loadStats();
    const interval = setInterval(loadStats, 60000); // Atualizar a cada 60 segundos (reduzido para evitar rate limit)
    return () => clearInterval(interval);
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

      const response = await api.get('/streaming/stats');
      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      } else {
        setError(response.data.error || 'Erro ao carregar informações do streaming');
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      
      // Se for erro de autenticação, o interceptor já redireciona
      if (err.response?.status === 401 || err.response?.status === 403) {
        return; // O interceptor vai redirecionar
      }
      
      let errorMessage = err.response?.data?.error || err.message || 'Erro ao conectar com o servidor.';
      
      // Tratamento específico para timeout
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.response?.status === 504) {
        errorMessage = 'A API do streaming está demorando muito para responder. Isso pode ser temporário. Tente novamente em alguns instantes.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Informações do Streaming
        </h1>
        <div className="bg-red-600/20 border-2 border-red-500/50 rounded-xl p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="text-red-400 text-4xl mb-2">⚠️</div>
          </div>
            <p className="text-red-400 text-center font-semibold mb-2">{error}</p>
            <div className="mt-4 text-sm text-gray-400 text-center space-y-2">
              {(error.includes('Token') || error.includes('inválido') || error.includes('expirado')) ? (
                <>
                  <p className="text-yellow-400 mb-2">⚠️ Seu token de acesso expirou ou é inválido.</p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      router.push('/login');
                    }}
                    className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Fazer Login Novamente
                  </button>
                </>
              ) : (
                <>
                  <p>Verifique se:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>O backend está rodando na porta 3001</li>
                    <li>Você está autenticado (faça login novamente se necessário)</li>
                    <li>A API do streaming está acessível</li>
                  </ul>
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      loadStats();
                    }}
                    className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Tentar Novamente
                  </button>
                </>
              )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Informações do Streaming
          </h1>

          {/* Cards de Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 ${
              stats?.status === 'Ligado' ? 'border-green-500/50' : 'border-red-500/50'
            } shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Status</h3>
                <div className={`w-4 h-4 rounded-full ${
                  stats?.status === 'Ligado' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
              </div>
              <p className={`text-3xl font-black ${
                stats?.status === 'Ligado' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats?.status || 'Desconhecido'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">👂 Ouvintes Online</h3>
                <span className="text-2xl">📻</span>
              </div>
              <p className="text-4xl font-black text-purple-400">
                {stats?.ouvintes_conectados || 0}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                de {stats?.plano_ouvintes || '999999999'} disponíveis
              </p>
            </div>

            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/50 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Bitrate</h3>
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-3xl font-black text-yellow-400">
                {stats?.plano_bitrate || '128Kbps'}
              </p>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Música Atual */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-red-500/50 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-red-400">🎵 Música Atual</h3>
              {stats?.capa_musica && (
                <img
                  src={stats.capa_musica}
                  alt="Capa do álbum"
                  className="w-32 h-32 rounded-xl mb-4 object-cover"
                />
              )}
              <p className="text-xl font-bold text-white mb-2">{stats?.musica_atual || 'Nenhuma música'}</p>
              <p className="text-gray-400">Gênero: {stats?.genero || 'Variado'}</p>
              {stats?.proxima_musica && (
                <div className="mt-4 pt-4 border-t border-red-500/30">
                  <p className="text-sm text-gray-400 mb-1">Próxima música:</p>
                  <p className="text-white font-semibold">{stats.proxima_musica}</p>
                </div>
              )}
            </div>

            {/* Informações do Servidor */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-purple-400">⚙️ Informações do Servidor</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">IP do Servidor:</span>
                  <span className="text-white font-semibold">{stats?.ip || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Porta:</span>
                  <span className="text-white font-semibold">{stats?.porta || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Porta DJ:</span>
                  <span className="text-white font-semibold">{stats?.porta_dj || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Shoutcast URL:</span>
                  <a
                    href={stats?.shoutcast}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 text-sm truncate max-w-[200px]"
                  >
                    {stats?.shoutcast || 'N/A'}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Título:</span>
                  <span className="text-white font-semibold">{stats?.titulo || 'Rádio Tribo'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plano */}
          <div className="mt-6 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/50 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">📦 Informações do Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Limite de Ouvintes</p>
                <p className="text-white font-bold text-xl">{stats?.plano_ouvintes || '999999999'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Espaço FTP</p>
                <p className="text-white font-bold text-xl">{stats?.plano_ftp || '50 GB'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Bitrate</p>
                <p className="text-white font-bold text-xl">{stats?.plano_bitrate || '128Kbps'}</p>
              </div>
            </div>
          </div>
    </div>
  );
}

