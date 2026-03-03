'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ContatosPage() {
  const router = useRouter();
  const [contatos, setContatos] = useState({
    email: '',
    website: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
    loadContatos();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadContatos = async () => {
    try {
      const response = await api.get('/config/contatos');
      if (response.data.success) {
        setContatos(response.data.data || {
          email: 'contato@radiotribofm.com.br',
          website: 'www.radiotribofm.com.br',
          instagram: '@radiotribofm1055',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      // Usar valores padrão se der erro
      setContatos({
        email: 'contato@radiotribofm.com.br',
        website: 'www.radiotribofm.com.br',
        instagram: '@radiotribofm1055',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/config/contatos', contatos);
      alert('Contatos atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      alert('Erro ao atualizar contatos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando contatos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Contatos
        </h1>
        <p className="text-gray-400 mt-2">Gerencie as informações de contato exibidas no site e app</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-8 border-2 border-red-500/30 shadow-xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📧 E-mail
            </label>
            <input
              type="email"
              value={contatos.email}
              onChange={(e) => setContatos({ ...contatos, email: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              placeholder="contato@radiotribofm.com.br"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🌐 Website
            </label>
            <input
              type="text"
              value={contatos.website}
              onChange={(e) => setContatos({ ...contatos, website: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              placeholder="www.radiotribofm.com.br"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📱 Instagram
            </label>
            <input
              type="text"
              value={contatos.instagram}
              onChange={(e) => setContatos({ ...contatos, instagram: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              placeholder="@radiotribofm1055"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


