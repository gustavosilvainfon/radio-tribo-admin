'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [config, setConfig] = useState({
    streamUrl: '',
    rssFeed: '',
    whatsappNumber: '',
    whatsappMessage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
    loadConfig();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadConfig = async () => {
    try {
      const response = await api.get('/config');
      if (response.data.success) {
        setConfig({
          streamUrl: response.data.data.streamUrl || '',
          rssFeed: response.data.data.rssFeed || '',
          whatsappNumber: response.data.data.whatsappNumber || '',
          whatsappMessage: response.data.data.whatsappMessage || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/config', config);
      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando configurações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Configurações Gerais
        </h1>
        <p className="text-gray-400 mt-2">Configure as principais opções do sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-8 border-2 border-red-500/30 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📻 URL do Stream
          </label>
          <input
            type="text"
            value={config.streamUrl}
            onChange={(e) => setConfig({ ...config, streamUrl: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
            placeholder="https://stm21.srvstm.com:6874/stream"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📰 URL do Feed RSS
          </label>
          <input
            type="text"
            value={config.rssFeed}
            onChange={(e) => setConfig({ ...config, rssFeed: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
            placeholder="https://exemplo.com/feed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📱 Número do WhatsApp (com código do país)
          </label>
          <input
            type="text"
            value={config.whatsappNumber}
            onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
            placeholder="+5511999999999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            💬 Mensagem Padrão do WhatsApp
          </label>
          <textarea
            value={config.whatsappMessage}
            onChange={(e) => setConfig({ ...config, whatsappMessage: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition resize-none"
            rows="4"
            placeholder="Olá! Recebemos seu pedido musical."
          />
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}


