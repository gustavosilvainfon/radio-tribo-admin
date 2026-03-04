'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatusAlert from '@/components/StatusAlert';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingButton from '@/components/LoadingButton';

export default function AnunciosPage() {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState({
    popup: [],
    lateral: [],
    rodape: [],
  });
  const [metricas, setMetricas] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [status, setStatus] = useState({ type: null, message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, tipo: null, id: null });
  const [showModal, setShowModal] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState('popup');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    link: '',
    duration: 8,
    enabled: true,
  });
  const fileInputRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    checkAuth();
    loadAnuncios();
    loadMetricas();
    
    // Auto-refresh a cada 30 segundos
    refreshIntervalRef.current = setInterval(() => {
      loadAnuncios();
      loadMetricas();
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
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
        setAnuncios(response.data.data || { popup: [], lateral: [], rodape: [] });
      }
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      setStatus({ type: 'error', message: 'Erro ao carregar anúncios.' });
    } finally {
      setLoading(false);
    }
  };

  const loadMetricas = async () => {
    try {
      const response = await api.get('/anuncios/metricas');
      if (response.data.success) {
        setMetricas(response.data.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.gsolucoes.app.br';
      const response = await fetch(`${apiUrl}/api/anuncios/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        // A URL já vem completa do backend
        return data.imageUrl;
      } else {
        throw new Error(data.error || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setStatus({ type: 'error', message: error.message || 'Erro ao fazer upload da imagem.' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await handleFileUpload(file);
      if (imageUrl) {
        setFormData({ ...formData, image: imageUrl });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image.trim() || !formData.link.trim()) {
      setStatus({ type: 'error', message: 'Preencha a imagem e o link.' });
      return;
    }

    setSaving({ ...saving, [selectedTipo]: true });
    try {
      if (editingAnuncio) {
        await api.put(`/anuncios/${selectedTipo}/${editingAnuncio.id}`, formData);
        setStatus({ type: 'success', message: 'Anúncio atualizado com sucesso.' });
      } else {
        await api.post(`/anuncios/${selectedTipo}`, formData);
        setStatus({ type: 'success', message: 'Anúncio criado com sucesso.' });
      }
      setShowModal(false);
      setEditingAnuncio(null);
      setFormData({
        image: '',
        link: '',
        duration: 8,
        enabled: true,
      });
      // Aguardar um pouco antes de recarregar para evitar rate limit
      setTimeout(() => {
        loadAnuncios();
      }, 300);
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error);
      setStatus({ type: 'error', message: 'Erro ao salvar anúncio.' });
    } finally {
      setSaving({ ...saving, [selectedTipo]: false });
    }
  };

  const handleEdit = (anuncio) => {
    setEditingAnuncio(anuncio);
    setSelectedTipo(anuncio.tipo || 'popup');
    setFormData({
      image: anuncio.image || '',
      link: anuncio.link || '',
      duration: anuncio.duration || 8,
      enabled: anuncio.enabled !== undefined ? anuncio.enabled : true,
    });
    setShowModal(true);
  };

  const handleDelete = (tipo, id) => {
    setDeleteConfirm({ isOpen: true, tipo, id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/anuncios/${deleteConfirm.tipo}/${deleteConfirm.id}`);
      setStatus({ type: 'success', message: 'Anúncio deletado com sucesso.' });
      // Aguardar um pouco antes de recarregar para evitar rate limit
      setTimeout(() => {
        loadAnuncios();
      }, 300);
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error);
      setStatus({ type: 'error', message: 'Erro ao deletar anúncio.' });
    } finally {
      setDeleteConfirm({ isOpen: false, tipo: null, id: null });
    }
  };

  const openNewModal = (tipo) => {
    setEditingAnuncio(null);
    setSelectedTipo(tipo);
    setFormData({
      image: '',
      link: '',
      duration: 8,
      enabled: true,
    });
    setShowModal(true);
  };

  const toggleEnabled = async (tipo, id, currentEnabled) => {
    try {
      const anuncio = anuncios[tipo].find(a => a.id === id);
      if (!anuncio) return;

      await api.put(`/anuncios/${tipo}/${id}`, {
        ...anuncio,
        enabled: !currentEnabled,
      });
      setStatus({ type: 'success', message: `Anúncio ${!currentEnabled ? 'ativado' : 'desativado'} com sucesso.` });
      // Aguardar um pouco antes de recarregar para evitar rate limit
      setTimeout(() => {
        loadAnuncios();
      }, 300);
    } catch (error) {
      console.error('Erro ao alterar status do anúncio:', error);
      setStatus({ type: 'error', message: 'Erro ao alterar status do anúncio.' });
    }
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
      <StatusAlert
        status={status}
        onClose={() => setStatus({ type: null, message: '' })}
      />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Gerenciar Anúncios
          </h1>
          <p className="text-gray-400 mt-2">Configure os banners publicitários do aplicativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiposAnuncio.map((tipo) => {
          const anunciosDoTipo = anuncios[tipo.key] || [];
          return (
            <div
              key={tipo.key}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{tipo.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tipo.label}</h3>
                    <p className="text-xs text-gray-400">{tipo.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => openNewModal(tipo.key)}
                  className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 text-green-300 rounded-lg transition text-sm"
                  title="Adicionar anúncio"
                >
                  + Novo
                </button>
              </div>

              <div className="space-y-3">
                {anunciosDoTipo.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhum anúncio cadastrado
                  </div>
                ) : (
                  anunciosDoTipo.map((anuncio) => (
                    <div
                      key={anuncio.id}
                      className={`bg-black/40 rounded-lg p-4 border ${
                        anuncio.enabled ? 'border-green-500/50' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleEnabled(tipo.key, anuncio.id, anuncio.enabled)}
                            className={`relative w-10 h-5 rounded-full transition ${
                              anuncio.enabled ? 'bg-green-600' : 'bg-gray-700'
                            }`}
                            title={anuncio.enabled ? 'Desativar' : 'Ativar'}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${
                                anuncio.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-xs text-gray-400">
                            {anuncio.enabled ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-blue-400 font-bold">
                            👆 {metricas[anuncio.id] || 0} cliques
                          </span>
                          <button
                            onClick={() => handleEdit({ ...anuncio, tipo: tipo.key })}
                            className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 rounded transition text-xs"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(tipo.key, anuncio.id)}
                            className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded transition text-xs"
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {anuncio.image && (
                        <div className="mb-2">
                          <img
                            src={anuncio.image}
                            alt="Anúncio"
                            className="w-full h-20 object-cover rounded-lg border border-gray-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="truncate">
                          <span className="text-gray-500">Link:</span> {anuncio.link || 'Não definido'}
                        </div>
                        <div>
                          <span className="text-gray-500">Duração:</span> {anuncio.duration}s
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingAnuncio ? 'Editar Anúncio' : 'Novo Anúncio'} - {tiposAnuncio.find(t => t.key === selectedTipo)?.label}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload ou Link de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem do Anúncio *
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Opção 1: Upload de arquivo</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/bmp,image/x-icon"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition"
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceitos: PNG, JPEG, JPG, GIF, WEBP, SVG, BMP, ICO (máx. 5MB)
                    </p>
                  </div>
                  <div className="text-center text-gray-400 text-sm">ou</div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Opção 2: URL da imagem</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                      placeholder="https://exemplo.com/banner.jpg"
                    />
                  </div>
                </div>
                {uploading && (
                  <div className="mt-2 text-sm text-blue-400">⏳ Fazendo upload...</div>
                )}
                {formData.image && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Preview:</p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link (URL de destino) *
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="https://exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (segundos)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-black/50 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-300">
                  Anúncio ativo
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
                <LoadingButton
                  type="submit"
                  loading={saving[selectedTipo]}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition"
                >
                  {editingAnuncio ? 'Atualizar' : 'Criar'} Anúncio
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, tipo: null, id: null })}
        onConfirm={confirmDelete}
        title="Deletar Anúncio"
        message="Tem certeza que deseja deletar este anúncio? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
