'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function NoticiasPage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toLocaleDateString('pt-BR'),
    category: 'Geral',
  });

  useEffect(() => {
    checkAuth();
    loadNews();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadNews = async () => {
    try {
      const response = await api.get('/news');
      if (response.data.success) {
        setNews(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await api.put(`/news/${editingNews.id}`, formData);
      } else {
        await api.post('/news', formData);
      }
      setShowModal(false);
      setEditingNews(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toLocaleDateString('pt-BR'),
        category: 'Geral',
      });
      loadNews();
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      alert('Erro ao salvar notícia');
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      category: item.category || 'Geral',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta notícia?')) return;
    
    try {
      await api.delete(`/news/${id}`);
      loadNews();
    } catch (error) {
      console.error('Erro ao deletar notícia:', error);
      alert('Erro ao deletar notícia');
    }
  };

  const openNewModal = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toLocaleDateString('pt-BR'),
      category: 'Geral',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando notícias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Gerenciar Notícias
          </h1>
          <p className="text-gray-400 mt-2">Crie, edite e gerencie as notícias do site</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
        >
          + Nova Notícia
        </button>
      </div>

      {/* Lista de Notícias */}
      <div className="grid grid-cols-1 gap-4">
        {news.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">Nenhuma notícia cadastrada ainda</p>
            <button
              onClick={openNewModal}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Criar Primeira Notícia
            </button>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 hover:border-red-500/50 transition shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-300 text-xs font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {item.date}</span>
                    {item.createdAt && (
                      <span>Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
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
          ))
        )}
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Digite o título da notícia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition resize-none"
                  placeholder="Digite a descrição da notícia"
                  rows="5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    placeholder="DD/MM/AAAA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Programação">Programação</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Notícias">Notícias</option>
                    <option value="Promoções">Promoções</option>
                  </select>
                </div>
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
                  {editingNews ? 'Atualizar' : 'Criar'} Notícia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


