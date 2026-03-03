'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatusAlert from '@/components/StatusAlert';

export default function ProgramacaoPage() {
  const router = useRouter();
  const [programacao, setProgramacao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [formData, setFormData] = useState({
    diaSemana: 'Segunda-feira',
    horario: '',
    programa: '',
    apresentador: '',
    descricao: '',
  });

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  useEffect(() => {
    checkAuth();
    loadProgramacao();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadProgramacao = async () => {
    try {
      const response = await api.get('/programacao');
      if (response.data.success) {
        setProgramacao(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar programação:', error);
      setStatus({ type: 'error', message: 'Erro ao carregar programação.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.horario.trim() || !formData.programa.trim()) {
      setStatus({ type: 'error', message: 'Preencha os campos obrigatórios (Horário e Programa).' });
      return;
    }

    try {
      if (editingItem) {
        await api.put(`/programacao/${editingItem.id}`, formData);
        setStatus({ type: 'success', message: 'Programa atualizado com sucesso.' });
      } else {
        await api.post('/programacao', formData);
        setStatus({ type: 'success', message: 'Programa criado com sucesso.' });
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        diaSemana: 'Segunda-feira',
        horario: '',
        programa: '',
        apresentador: '',
        descricao: '',
      });
      loadProgramacao();
    } catch (error) {
      console.error('Erro ao salvar programação:', error);
      setStatus({ type: 'error', message: 'Erro ao salvar programação.' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      diaSemana: item.diaSemana,
      horario: item.horario,
      programa: item.programa,
      apresentador: item.apresentador || '',
      descricao: item.descricao || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este item da programação?')) return;
    
    try {
      await api.delete(`/programacao/${id}`);
      loadProgramacao();
    } catch (error) {
      console.error('Erro ao deletar programação:', error);
      setStatus({ type: 'error', message: 'Erro ao deletar programação.' });
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      diaSemana: 'Segunda-feira',
      horario: '',
      programa: '',
      apresentador: '',
      descricao: '',
    });
    setShowModal(true);
  };

  // Agrupar por dia da semana
  const programacaoPorDia = programacao.reduce((acc, item) => {
    if (!acc[item.diaSemana]) {
      acc[item.diaSemana] = [];
    }
    acc[item.diaSemana].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando programação...</div>
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
            Gerenciar Programação
          </h1>
          <p className="text-gray-400 mt-2">Gerencie os horários e programas da rádio</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
        >
          + Novo Programa
        </button>
      </div>

      {/* Lista de Programação por Dia */}
      {Object.keys(programacaoPorDia).length === 0 ? (
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-12 text-center border border-gray-700">
          <p className="text-gray-400 text-lg">Nenhum programa cadastrado ainda</p>
          <button
            onClick={openNewModal}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Criar Primeiro Programa
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {diasSemana.map((dia) => {
            const itemsDoDia = programacaoPorDia[dia] || [];
            if (itemsDoDia.length === 0) return null;

            return (
              <div
                key={dia}
                className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-4">{dia}</h2>
                <div className="space-y-3">
                  {itemsDoDia.map((item) => (
                    <div
                      key={item.id}
                      className="bg-black/40 rounded-lg p-4 border border-purple-500/30 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-red-400 font-bold">{item.horario}</span>
                          <h3 className="text-xl font-bold text-white">{item.programa}</h3>
                        </div>
                        {item.apresentador && (
                          <p className="text-purple-300 mb-2">Apresentador: {item.apresentador}</p>
                        )}
                        {item.descricao && (
                          <p className="text-gray-400 text-sm">{item.descricao}</p>
                        )}
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? 'Editar Programa' : 'Novo Programa'}
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
                    Dia da Semana *
                  </label>
                  <select
                    value={formData.diaSemana}
                    onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    required
                  >
                    {diasSemana.map((dia) => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horário * (ex: 06:00 - 10:00)
                  </label>
                  <input
                    type="text"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    placeholder="06:00 - 10:00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Programa *
                </label>
                <input
                  type="text"
                  value={formData.programa}
                  onChange={(e) => setFormData({ ...formData, programa: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Ex: Manhã Tribo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apresentador
                </label>
                <input
                  type="text"
                  value={formData.apresentador}
                  onChange={(e) => setFormData({ ...formData, apresentador: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="Ex: DJ João"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition resize-none"
                  placeholder="Descrição do programa"
                  rows="3"
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
                  {editingItem ? 'Atualizar' : 'Criar'} Programa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

