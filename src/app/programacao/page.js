'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/lib/api';
import StatusAlert from '@/components/StatusAlert';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingButton from '@/components/LoadingButton';

// Componente de item arrastável
function SortableItem({ id, item, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-black/40 rounded-lg p-4 border border-purple-500/30 hover:border-purple-500/60 transition relative group"
    >
      {/* Handle de arrastar - só aparece no hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <div className="flex justify-between items-start pl-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {item.horario && <span className="text-red-400 font-bold text-[10px] whitespace-nowrap">{item.horario}</span>}
            <h3 className="text-sm font-bold text-white truncate">{item.programa}</h3>
          </div>
          {item.apresentador && (
            <p className="text-purple-300 text-[10px] mb-0.5 truncate">Apresentador: {item.apresentador}</p>
          )}
          {item.descricao && (
            <p className="text-gray-400 text-[10px] line-clamp-1">{item.descricao}</p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 rounded transition text-[10px]"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded transition text-[10px]"
            title="Deletar"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgramacaoPage() {
  const router = useRouter();
  const [programacao, setProgramacao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('grade');
  const [activeId, setActiveId] = useState(null);
  const [formData, setFormData] = useState({
    diaSemana: '',
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

  // Horários otimizados: períodos de 2h (mais compacto)
  const horarios = [
    { inicio: '06:00', fim: '08:00', label: '06:00-08:00' },
    { inicio: '08:00', fim: '10:00', label: '08:00-10:00' },
    { inicio: '10:00', fim: '12:00', label: '10:00-12:00' },
    { inicio: '12:00', fim: '14:00', label: '12:00-14:00' },
    { inicio: '14:00', fim: '16:00', label: '14:00-16:00' },
    { inicio: '16:00', fim: '18:00', label: '16:00-18:00' },
    { inicio: '18:00', fim: '20:00', label: '18:00-20:00' },
    { inicio: '20:00', fim: '22:00', label: '20:00-22:00' },
    { inicio: '22:00', fim: '00:00', label: '22:00-00:00' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa arrastar pelo menos 8px para ativar
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const item = programacao.find(p => p.id === parseInt(active.id));
    if (!item) return;

    // Se arrastou para um slot da grade
    if (over.id && typeof over.id === 'string' && over.id.startsWith('slot-')) {
      // Buscar o elemento para pegar os data attributes
      const slotElement = document.getElementById(over.id);
      if (!slotElement) return;

      const dia = slotElement.dataset.dia;
      const periodoLabel = slotElement.dataset.periodo;
      
      if (!dia || !periodoLabel) return;
      
      const periodo = horarios.find(h => h.label === periodoLabel);
      if (!periodo) return;
      
      const novoHorario = `${periodo.inicio} - ${periodo.fim}`;
      
      try {
        const response = await api.put(`/programacao/${item.id}`, {
          diaSemana: dia,
          horario: novoHorario,
          programa: item.programa,
          apresentador: item.apresentador || '',
          descricao: item.descricao || '',
        });
        
        if (response.data.success) {
          setStatus({ type: 'success', message: 'Programa movido com sucesso.' });
          await loadProgramacao();
        }
      } catch (error) {
        console.error('Erro ao mover programa:', error);
        setStatus({ type: 'error', message: error.response?.data?.error || 'Erro ao mover programa.' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.programa.trim()) {
      setStatus({ type: 'error', message: 'Preencha o nome do programa.' });
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/programacao/${editingItem.id}`, formData);
        setStatus({ type: 'success', message: 'Programa atualizado com sucesso.' });
      } else {
        const dataToSend = {
          ...formData,
          diaSemana: formData.diaSemana || 'Não agendado',
          horario: formData.horario || '',
        };
        await api.post('/programacao', dataToSend);
        setStatus({ type: 'success', message: 'Programa criado com sucesso.' });
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        diaSemana: '',
        horario: '',
        programa: '',
        apresentador: '',
        descricao: '',
      });
      loadProgramacao();
    } catch (error) {
      console.error('Erro ao salvar programação:', error);
      setStatus({ type: 'error', message: 'Erro ao salvar programação.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      diaSemana: item.diaSemana || '',
      horario: item.horario || '',
      programa: item.programa,
      apresentador: item.apresentador || '',
      descricao: item.descricao || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/programacao/${deleteConfirm.id}`);
      setStatus({ type: 'success', message: 'Programa deletado com sucesso.' });
      loadProgramacao();
    } catch (error) {
      console.error('Erro ao deletar programação:', error);
      setStatus({ type: 'error', message: 'Erro ao deletar programação.' });
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      diaSemana: '',
      horario: '',
      programa: '',
      apresentador: '',
      descricao: '',
    });
    setShowModal(true);
  };

  // Separar programas agendados e não agendados
  const programasAgendados = programacao.filter(p => p.diaSemana && p.diaSemana !== 'Não agendado' && p.horario);
  const programasNaoAgendados = programacao.filter(p => !p.diaSemana || p.diaSemana === 'Não agendado' || !p.horario);

  // Função para encontrar programas em um slot específico
  const getProgramasNoSlot = (dia, periodo) => {
    return programasAgendados.filter(p => {
      if (p.diaSemana !== dia || !p.horario) return false;
      // Verifica se o horário do programa está dentro do período
      const [hInicio] = p.horario.split(' - ')[0].split(':');
      return hInicio === periodo.inicio.split(':')[0];
    });
  };

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

  const activeItem = activeId ? programacao.find(p => p.id === parseInt(activeId)) : null;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
          <div className="flex items-center space-x-4">
            <div className="flex bg-black/40 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setViewMode('grade')}
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'grade'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Grade Horária
              </button>
              <button
                onClick={() => setViewMode('lista')}
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'lista'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lista
              </button>
            </div>
            <button
              onClick={openNewModal}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              + Novo Programa
            </button>
          </div>
        </div>

        {viewMode === 'grade' ? (
          <>
            {/* Lista de Programas Não Agendados */}
            {programasNaoAgendados.length > 0 && (
              <div className="mb-8 bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Programas Não Agendados</h2>
                <p className="text-gray-400 text-sm mb-4">Passe o mouse sobre um programa e arraste pelo ícone ☰ para agendar na grade</p>
                <SortableContext items={programasNaoAgendados.map(p => p.id.toString())}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {programasNaoAgendados.map((item) => (
                      <SortableItem
                        key={item.id}
                        id={item.id.toString()}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )}

            {/* Grade Horária Otimizada */}
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-gray-700 overflow-x-auto">
              <h2 className="text-lg font-bold text-white mb-3">Grade Horária Semanal</h2>
              <div className="min-w-full">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border border-gray-700 p-1.5 text-left text-gray-300 sticky left-0 bg-black/60 z-10 min-w-[90px] text-xs">Horário</th>
                      {diasSemana.map((dia) => (
                        <th key={dia} className="border border-gray-700 p-1.5 text-center text-gray-300 min-w-[140px] bg-black/40 text-xs">
                          {dia.split('-')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map((periodo) => (
                      <tr key={periodo.label}>
                        <td className="border border-gray-700 p-1.5 text-gray-400 font-mono text-xs sticky left-0 bg-black/60 z-10">
                          {periodo.label}
                        </td>
                        {diasSemana.map((dia) => {
                          const slotId = `slot-${dia}-${periodo.label}`;
                          const programasNoSlot = getProgramasNoSlot(dia, periodo);
                          return (
                            <td
                              key={slotId}
                              id={slotId}
                              data-dia={dia}
                              data-periodo={periodo.label}
                              className="border border-gray-700 p-1.5 min-h-[60px] bg-black/20 hover:bg-black/40 transition align-top"
                            >
                              {programasNoSlot.length > 0 ? (
                                <SortableContext items={programasNoSlot.map(p => p.id.toString())}>
                                  <div className="space-y-1">
                                    {programasNoSlot.map((item) => (
                                      <SortableItem
                                        key={item.id}
                                        id={item.id.toString()}
                                        item={item}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                      />
                                    ))}
                                  </div>
                                </SortableContext>
                              ) : (
                                <div className="text-gray-600 text-[10px] text-center py-2 opacity-50">
                                  Arraste
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Vista de Lista */
          <div className="space-y-6">
            {diasSemana.map((dia) => {
              const itemsDoDia = programasAgendados.filter(p => p.diaSemana === dia);
              if (itemsDoDia.length === 0) return null;

              return (
                <div
                  key={dia}
                  className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-red-500/30 shadow-xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">{dia}</h2>
                  <SortableContext items={itemsDoDia.map(p => p.id.toString())}>
                    <div className="space-y-3">
                      {itemsDoDia.map((item) => (
                        <SortableItem
                          key={item.id}
                          id={item.id.toString()}
                          item={item}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="bg-black/80 rounded-lg p-4 border-2 border-purple-500 shadow-xl opacity-90">
              <div className="flex items-center space-x-3">
                {activeItem.horario && <span className="text-red-400 font-bold text-sm">{activeItem.horario}</span>}
                <h3 className="text-lg font-bold text-white">{activeItem.programa}</h3>
              </div>
            </div>
          ) : null}
        </DragOverlay>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dia da Semana (opcional)
                    </label>
                    <select
                      value={formData.diaSemana}
                      onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Não agendado</option>
                      {diasSemana.map((dia) => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horário (opcional, ex: 06:00 - 10:00)
                    </label>
                    <input
                      type="text"
                      value={formData.horario}
                      onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                      placeholder="06:00 - 10:00"
                    />
                  </div>
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
                  <LoadingButton
                    type="submit"
                    loading={saving}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition"
                  >
                    {editingItem ? 'Atualizar' : 'Criar'} Programa
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        )}

        <DeleteConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={confirmDelete}
          title="Deletar Programa"
          message="Tem certeza que deseja deletar este programa? Esta ação não pode ser desfeita."
        />
      </div>
    </DndContext>
  );
}
