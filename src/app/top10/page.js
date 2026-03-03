'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function Top10Page() {
  const router = useRouter();
  const [top10, setTop10] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    posicao: 1,
    musica: '',
    artista: '',
    votos: 0,
    imagem: '',
  });

  useEffect(() => {
    checkAuth();
    loadTop10();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadTop10 = async () => {
    try {
      const response = await api.get('/top10');
      if (response.data.success) {
        setTop10(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar Top 10:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/top10/${editingItem.id}`, formData);
      } else {
        await api.post('/top10', formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        posicao: 1,
        musica: '',
        artista: '',
        votos: 0,
        imagem: '',
      });
      loadTop10();
    } catch (error) {
      console.error('Erro ao salvar Top 10:', error);
      alert(error.response?.data?.error || 'Erro ao salvar item do Top 10');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      posicao: item.posicao,
      musica: item.musica,
      artista: item.artista,
      votos: item.votos || 0,
      imagem: item.imagem || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este item do Top 10?')) return;
    
    try {
      await api.delete(`/top10/${id}`);
      loadTop10();
    } catch (error) {
      console.error('Erro ao deletar item do Top 10:', error);
      alert('Erro ao deletar item');
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      posicao: top10.length + 1,
      musica: '',
      artista: '',
      votos: 0,
      imagem: '',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando Top 10...</div>
        </div>
      </div>
    );
  }

  // Ordenar por posição
  const sortedTop10 = [...top10].sort((a, b) => a.posicao - b.posicao);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Gerenciar Top 10
          </h1>
          <p className="text-gray-400 mt-2">Gerencie o ranking das músicas mais tocadas</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
        >
          + Nova Música
        </button>
      </div>

      {/* Lista do Top 10 */}
      {sortedTop10.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-12 text-center border border-gray-700">
          <p className="text-gray-400 text-lg">Nenhuma música no Top 10 ainda</p>
          <button
            onClick={openNewModal}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Adicionar Primeira Música
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTop10.map((item, index) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 shadow-xl"
            >
              <div className="flex items-center space-x-6">
                {/* Posição */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${
                    item.posicao === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-black' :
                    item.posicao === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                    item.posicao === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                    'bg-gradient-to-br from-red-600 to-purple-600 text-white'
                  }`}>
                    {item.posicao}
                  </div>
                </div>

                {/* Imagem (se tiver) */}
                {item.imagem && (
                  <div className="flex-shrink-0">
                    <img
                      src={item.imagem}
                      alt={item.musica}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Informações */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{item.musica}</h3>
                  <p className="text-purple-300 mb-2">{item.artista}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>🎵 {item.votos} votos</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 rounded-lg transition text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition text-sm"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? 'Editar Música' : 'Nova Música'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Posição * (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.posicao}
                    onChange={(e) => setFormData({ ...formData, posicao: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Votos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.votos}
                    onChange={(e) => setFormData({ ...formData, votos: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Música *
                </label>
                <input
                  type="text"
                  value={formData.musica}
                  onChange={(e) => setFormData({ ...formData, musica: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Ex: Música Exemplo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artista *
                </label>
                <input
                  type="text"
                  value={formData.artista}
                  onChange={(e) => setFormData({ ...formData, artista: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Ex: Artista Exemplo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem (Capa do Álbum)
                </label>
                <input
                  type="url"
                  value={formData.imagem}
                  onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="https://exemplo.com/capa.jpg"
                />
              </div>

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
                  {editingItem ? 'Atualizar' : 'Criar'} Música
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

