'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function EstatisticasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    googleAnalytics: {
      enabled: false,
      trackingId: '',
    },
    metaPixel: {
      enabled: false,
      pixelId: '',
    },
  });

  useEffect(() => {
    checkAuth();
    // Simular carregamento de estatísticas
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Estatísticas e Analytics
        </h1>
        <p className="text-gray-400 mt-2">Visualize métricas e configure integrações de analytics</p>
      </div>

      {/* Configuração de Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Google Analytics */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-blue-500/30 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="text-xl font-bold text-white">Google Analytics</h3>
              <p className="text-xs text-gray-400">Configure o tracking ID do GA4</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Ativar</label>
              <button
                onClick={() => setStats({
                  ...stats,
                  googleAnalytics: { ...stats.googleAnalytics, enabled: !stats.googleAnalytics.enabled }
                })}
                className={`relative w-12 h-6 rounded-full transition ${
                  stats.googleAnalytics.enabled ? 'bg-green-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                    stats.googleAnalytics.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tracking ID (G-XXXXXXXXXX)
              </label>
              <input
                type="text"
                value={stats.googleAnalytics.trackingId}
                onChange={(e) => setStats({
                  ...stats,
                  googleAnalytics: { ...stats.googleAnalytics, trackingId: e.target.value }
                })}
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-sm">
              Salvar Configuração
            </button>
          </div>
        </div>

        {/* Meta Pixel */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-purple-500/30 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="text-xl font-bold text-white">Meta Pixel</h3>
              <p className="text-xs text-gray-400">Configure o Pixel ID do Facebook/Meta</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Ativar</label>
              <button
                onClick={() => setStats({
                  ...stats,
                  metaPixel: { ...stats.metaPixel, enabled: !stats.metaPixel.enabled }
                })}
                className={`relative w-12 h-6 rounded-full transition ${
                  stats.metaPixel.enabled ? 'bg-green-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                    stats.metaPixel.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pixel ID
              </label>
              <input
                type="text"
                value={stats.metaPixel.pixelId}
                onChange={(e) => setStats({
                  ...stats,
                  metaPixel: { ...stats.metaPixel, pixelId: e.target.value }
                })}
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition"
                placeholder="123456789012345"
              />
            </div>

            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-sm">
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">📈 Dashboard de Métricas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Visualizações do Site</div>
            <div className="text-3xl font-black text-blue-400">-</div>
            <div className="text-xs text-gray-500 mt-1">Integração pendente</div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Usuários Únicos</div>
            <div className="text-3xl font-black text-purple-400">-</div>
            <div className="text-xs text-gray-500 mt-1">Integração pendente</div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Taxa de Conversão</div>
            <div className="text-3xl font-black text-green-400">-</div>
            <div className="text-xs text-gray-500 mt-1">Integração pendente</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-300 text-sm">
            ⚠️ <strong>Nota:</strong> As integrações com Google Analytics e Meta Pixel serão implementadas na próxima fase. 
            Configure os IDs acima para quando a integração estiver pronta.
          </p>
        </div>
      </div>
    </div>
  );
}


