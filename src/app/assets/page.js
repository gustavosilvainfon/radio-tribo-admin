'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'logo',
    url: '',
  });

  useEffect(() => {
    checkAuth();
    loadAssets();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadAssets = async () => {
    try {
      const response = await api.get('/assets');
      if (response.data.success) {
        setAssets(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, formData);
      } else {
        await api.post('/assets', formData);
      }
      setShowModal(false);
      setEditingAsset(null);
      setFormData({ name: '', type: 'logo', url: '' });
      loadAssets();
    } catch (error) {
      console.error('Erro ao salvar asset:', error);
      alert('Erro ao salvar asset');
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      url: asset.url,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este asset?')) return;

    try {
      await api.delete(`/assets/${id}`);
      loadAssets();
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      alert('Erro ao deletar asset');
    }
  };

  const openNewModal = () => {
    setEditingAsset(null);
    setFormData({ name: '', type: 'logo', url: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Assets Visuais
          </h1>
          <p className="text-gray-400 mt-2">Gerencie imagens, logos e outros recursos visuais</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
        >
          + Novo Asset
        </button>
      </div>

      {/* Grid de Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length === 0 ? (
          <div className="col-span-full bg-black/40 backdrop-blur-lg rounded-xl p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">Nenhum asset cadastrado ainda</p>
            <button
              onClick={openNewModal}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Criar Primeiro Asset
            </button>
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 hover:border-red-500/50 transition shadow-xl"
            >
              <div className="mb-4">
                {asset.url ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-48 object-cover rounded-lg border border-gray-700 mb-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-black/50 rounded-lg border border-gray-700 flex items-center justify-center mb-4">
                    <span className="text-gray-500 text-4xl">🖼️</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                  <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-300 text-xs font-semibold">
                    {asset.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate" title={asset.url}>
                  {asset.url || 'Sem URL'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(asset)}
                  className="flex-1 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 rounded-lg transition text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="flex-1 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition text-sm"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingAsset ? 'Editar Asset' : 'Novo Asset'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Ex: Logo Principal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="logo">Logo</option>
                  <option value="banner">Banner</option>
                  <option value="icone">Ícone</option>
                  <option value="imagem">Imagem</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Por enquanto, use URLs de imagens hospedadas externamente. Upload de arquivos será implementado na próxima fase.
                </p>
              </div>

              {formData.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preview
                  </label>
                  <img
                    src={formData.url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition"
                >
                  {editingAsset ? 'Atualizar' : 'Criar'} Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


