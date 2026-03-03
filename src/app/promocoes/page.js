'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function PromocoesPage() {
  const router = useRouter();
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromocao, setEditingPromocao] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    ativo: true,
    imagem: '',
  });

  useEffect(() => {
    checkAuth();
    loadPromocoes();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadPromocoes = async () => {
    try {
      const response = await api.get('/promocoes');
      if (response.data.success) {
        setPromocoes(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromocao) {
        await api.put(`/promocoes/${editingPromocao.id}`, formData);
      } else {
        await api.post('/promocoes', formData);
      }
      setShowModal(false);
      setEditingPromocao(null);
      setFormData({
        titulo: '',
        descricao: '',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        ativo: true,
        imagem: '',
      });
      loadPromocoes();
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      alert('Erro ao salvar promoção');
    }
  };

  const handleEdit = (item) => {
    setEditingPromocao(item);
    setFormData({
      titulo: item.titulo,
      descricao: item.descricao,
      dataInicio: item.dataInicio ? item.dataInicio.split('/').reverse().join('-') : new Date().toISOString().split('T')[0],
      dataFim: item.dataFim ? item.dataFim.split('/').reverse().join('-') : '',
      ativo: item.ativo !== undefined ? item.ativo : true,
      imagem: item.imagem || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return;
    
    try {
      await api.delete(`/promocoes/${id}`);
      loadPromocoes();
    } catch (error) {
      console.error('Erro ao deletar promoção:', error);
      alert('Erro ao deletar promoção');
    }
  };

  const toggleAtivo = async (id, ativo) => {
    try {
      await api.put(`/promocoes/${id}`, { ativo: !ativo });
      loadPromocoes();
    } catch (error) {
      console.error('Erro ao alterar status da promoção:', error);
      alert('Erro ao alterar status');
    }
  };

  const openNewModal = () => {
    setEditingPromocao(null);
    setFormData({
      titulo: '',
      descricao: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      ativo: true,
      imagem: '',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando promoções...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Gerenciar Promoções
          </h1>
          <p className="text-gray-400 mt-2">Crie e gerencie as promoções da rádio</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
        >
          + Nova Promoção
        </button>
      </div>

      {/* Lista de Promoções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promocoes.length === 0 ? (
          <div className="col-span-full bg-black/40 backdrop-blur-lg rounded-xl p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">Nenhuma promoção cadastrada ainda</p>
            <button
              onClick={openNewModal}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Criar Primeira Promoção
            </button>
          </div>
        ) : (
          promocoes.map((item) => (
            <div
              key={item.id}
              className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 ${
                item.ativo ? 'border-green-500/50' : 'border-gray-500/50'
              } shadow-xl`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white flex-1">{item.titulo}</h3>
                <button
                  onClick={() => toggleAtivo(item.id, item.ativo)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.ativo
                      ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                      : 'bg-gray-600/30 text-gray-300 border border-gray-500/50'
                  }`}
                >
                  {item.ativo ? 'Ativa' : 'Inativa'}
                </button>
              </div>
              
              <p className="text-gray-400 mb-4 line-clamp-3">{item.descricao}</p>
              
              <div className="text-sm text-gray-500 mb-4 space-y-1">
                <div>📅 Início: {item.dataInicio}</div>
                {item.dataFim && <div>📅 Fim: {item.dataFim}</div>}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 rounded-lg transition text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
                {editingPromocao ? 'Editar Promoção' : 'Nova Promoção'}
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
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Digite o título da promoção"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition resize-none"
                  placeholder="Digite a descrição da promoção"
                  rows="5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imagem}
                  onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-black/50 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-300">
                  Promoção ativa
                </label>
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
                  {editingPromocao ? 'Atualizar' : 'Criar'} Promoção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

