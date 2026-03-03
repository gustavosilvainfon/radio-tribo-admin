'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function PedidosPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // todos, pendente, aprovado, rejeitado

  useEffect(() => {
    checkAuth();
    loadRequests();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadRequests = async () => {
    try {
      const response = await api.get('/music-requests');
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/music-requests/${id}`, { status: newStatus });
      loadRequests();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este pedido?')) return;
    
    try {
      await api.delete(`/music-requests/${id}`);
      loadRequests();
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      alert('Erro ao deletar pedido');
    }
  };

  const filteredRequests = filter === 'todos' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-600/30 border-yellow-500/50 text-yellow-300';
      case 'aprovado':
        return 'bg-green-600/30 border-green-500/50 text-green-300';
      case 'rejeitado':
        return 'bg-red-600/30 border-red-500/50 text-red-300';
      default:
        return 'bg-gray-600/30 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando pedidos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Pedidos Musicais
        </h1>
        <p className="text-gray-400 mt-2">Gerencie os pedidos de música dos ouvintes</p>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'todos'
              ? 'bg-red-600 text-white'
              : 'bg-black/40 text-gray-400 hover:text-white'
          }`}
        >
          Todos ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pendente')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'pendente'
              ? 'bg-yellow-600 text-white'
              : 'bg-black/40 text-gray-400 hover:text-white'
          }`}
        >
          Pendentes ({requests.filter(r => r.status === 'pendente').length})
        </button>
        <button
          onClick={() => setFilter('aprovado')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'aprovado'
              ? 'bg-green-600 text-white'
              : 'bg-black/40 text-gray-400 hover:text-white'
          }`}
        >
          Aprovados ({requests.filter(r => r.status === 'aprovado').length})
        </button>
        <button
          onClick={() => setFilter('rejeitado')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'rejeitado'
              ? 'bg-red-600 text-white'
              : 'bg-black/40 text-gray-400 hover:text-white'
          }`}
        >
          Rejeitados ({requests.filter(r => r.status === 'rejeitado').length})
        </button>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">
              {filter === 'todos' 
                ? 'Nenhum pedido musical ainda' 
                : `Nenhum pedido com status "${getStatusLabel(filter)}"`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 hover:border-red-500/50 transition shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{request.musica}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2">
                    <span className="font-semibold text-purple-400">Artista:</span> {request.artista}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    <span className="font-semibold">Solicitado por:</span> {request.usuario || 'Anônimo'}
                  </p>
                  <div className="text-sm text-gray-500">
                    {request.createdAt && (
                      <span>📅 {new Date(request.createdAt).toLocaleDateString('pt-BR')} às {new Date(request.createdAt).toLocaleTimeString('pt-BR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {request.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => updateStatus(request.id, 'aprovado')}
                        className="px-4 py-2 bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 text-green-300 rounded-lg transition text-sm"
                      >
                        ✓ Aprovar
                      </button>
                      <button
                        onClick={() => updateStatus(request.id, 'rejeitado')}
                        className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition text-sm"
                      >
                        ✕ Rejeitar
                      </button>
                    </>
                  )}
                  {request.status === 'aprovado' && (
                    <button
                      onClick={() => updateStatus(request.id, 'pendente')}
                      className="px-4 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 border border-yellow-500/50 text-yellow-300 rounded-lg transition text-sm"
                    >
                      ↺ Reabrir
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


