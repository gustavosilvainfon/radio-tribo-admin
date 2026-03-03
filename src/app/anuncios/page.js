'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AnunciosPage() {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState({
    popup: { enabled: false, image: '', link: '', duration: 8 },
    lateral: { enabled: false, image: '', link: '', duration: 8 },
    rodape: { enabled: false, image: '', link: '', duration: 10 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    checkAuth();
    loadAnuncios();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadAnuncios = async () => {
    try {
      const response = await api.get('/anuncios');
      if (response.data.success) {
        setAnuncios(response.data.data || anuncios);
      }
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tipo) => {
    setSaving({ ...saving, [tipo]: true });
    try {
      await api.put(`/anuncios/${tipo}`, anuncios[tipo]);
      alert('Anúncio atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error);
      alert('Erro ao atualizar anúncio');
    } finally {
      setSaving({ ...saving, [tipo]: false });
    }
  };

  const handleChange = (tipo, field, value) => {
    setAnuncios({
      ...anuncios,
      [tipo]: {
        ...anuncios[tipo],
        [field]: value,
      },
    });
  };

  const tiposAnuncio = [
    {
      key: 'popup',
      label: 'Banner Pop-up',
      icon: '📢',
      description: 'Anúncio que aparece no centro da tela ao abrir o app',
    },
    {
      key: 'lateral',
      label: 'Banner Lateral',
      icon: '📌',
      description: 'Anúncio fixo na lateral esquerda da tela',
    },
    {
      key: 'rodape',
      label: 'Banner Rodapé',
      icon: '⬇️',
      description: 'Anúncio fixo na parte inferior da tela',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando anúncios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Gerenciar Anúncios
        </h1>
        <p className="text-gray-400 mt-2">Configure os banners publicitários do aplicativo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiposAnuncio.map((tipo) => {
          const anuncio = anuncios[tipo.key];
          return (
            <div
              key={tipo.key}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{tipo.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{tipo.label}</h3>
                  <p className="text-xs text-gray-400">{tipo.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Ativar</label>
                  <button
                    onClick={() => handleChange(tipo.key, 'enabled', !anuncio.enabled)}
                    className={`relative w-12 h-6 rounded-full transition ${
                      anuncio.enabled ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                        anuncio.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={anuncio.image}
                    onChange={(e) => handleChange(tipo.key, 'image', e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition"
                    placeholder="https://exemplo.com/banner.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link (URL de destino)
                  </label>
                  <input
                    type="text"
                    value={anuncio.link}
                    onChange={(e) => handleChange(tipo.key, 'link', e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (segundos)
                  </label>
                  <input
                    type="number"
                    value={anuncio.duration}
                    onChange={(e) => handleChange(tipo.key, 'duration', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition"
                    min="0"
                  />
                </div>

                {anuncio.image && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Preview:</p>
                    <img
                      src={anuncio.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() => handleSave(tipo.key)}
                  disabled={saving[tipo.key]}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {saving[tipo.key] ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


