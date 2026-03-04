'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/lib/api';
import StatusAlert from '@/components/StatusAlert';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingButton from '@/components/LoadingButton';

// Componente de slot droppable
function DroppableSlot({ id, horario, dia, programas, onEdit, onDelete, onDuplicate }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${dia}-${horario}`,
    data: {
      type: 'slot',
      horario,
      dia,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`border border-gray-700 rounded-lg p-2 bg-black/20 hover:bg-black/40 transition min-h-[120px] ${
        isOver ? 'bg-purple-500/30 border-purple-500' : ''
      }`}
    >
      <div className="text-gray-400 font-mono text-xs font-bold mb-2 text-center border-b border-gray-700 pb-1">
        {horario}
      </div>
      <div className="min-h-[90px]">
        {programas.length > 0 ? (
          <SortableContext items={programas.map(p => `grade-${dia}-${horario}-${p.id}`)}>
            <div className="space-y-1.5">
              {programas.map((item) => (
                <SortableItem
                  key={`grade-${dia}-${horario}-${item.id}`}
                  id={item.id.toString()}
                  item={item}
                  prefix={`grade-${dia}-${horario}`}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="text-gray-600 text-[10px] text-center py-6 opacity-50">
            Arraste aqui
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de item arrastável
function SortableItem({ id, item, onEdit, onDelete, onDuplicate, prefix = '' }) {
  // Usar prefixo para evitar conflitos de ID entre diferentes listas
  // Garantir que o ID seja sempre string e único
  const itemId = prefix ? `${prefix}-${id}` : `item-${id}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-black/40 rounded-lg p-3 border border-purple-500/30 hover:border-purple-500/60 transition relative group mb-2"
    >
      {/* Handle de arrastar - só aparece no hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <div className="flex flex-col pl-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] font-bold text-white truncate mb-0.5" title={item.programa}>
            {item.programa}
          </h3>
          {item.apresentador && (
            <p className="text-purple-300 text-[9px] truncate mb-1" title={item.apresentador}>
              {item.apresentador}
            </p>
          )}
          {item.horario && item.horario.includes(' - ') && (
            <p className="text-red-400 text-[8px] mb-1">
              {item.horario.split(' - ')[0]} - {item.horario.split(' - ')[1]}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end space-x-1 mt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="px-1.5 py-0.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 rounded transition text-[9px]"
            title="Editar"
          >
            ✏️
          </button>
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(item);
              }}
              className="px-1.5 py-0.5 bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 text-green-300 rounded transition text-[9px]"
              title="Duplicar"
            >
              📋
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="px-1.5 py-0.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded transition text-[9px]"
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
  const [selectedDia, setSelectedDia] = useState('Segunda-feira');
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

  // Horários de 1 em 1 hora (24h)
  const horarios = [];
  for (let h = 0; h < 24; h++) {
    horarios.push(`${String(h).padStart(2, '0')}:00`);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
    // Sempre limpar o activeId primeiro
    setActiveId(null);
    
    // Extrair o ID real do item (remover prefixo se houver)
    const activeIdString = typeof event.active.id === 'string' ? event.active.id : String(event.active.id);
    
    console.log('🔵 Drag START - Active ID original:', activeIdString);
    
    // Se tem prefixo (ex: "nao-agendado-123", "grade-Segunda-feira-06:00-123", ou "item-123"), pegar o último número
    let activeId;
    if (activeIdString.includes('-')) {
      const parts = activeIdString.split('-');
      // Pegar o último elemento que deve ser o ID numérico
      activeId = parseInt(parts[parts.length - 1]);
      console.log('🔵 Extraído ID numérico:', activeId, 'de:', activeIdString);
    } else {
      activeId = parseInt(activeIdString);
    }
    
    if (isNaN(activeId)) {
      console.error('❌ ID inválido extraído:', activeIdString);
      return;
    }
    
    setActiveId(activeId);
    // Encontrar o item correto
    const item = programacao.find(p => p.id === activeId);
    console.log('🔵 Item encontrado:', item ? `${item.programa} (ID: ${item.id})` : 'NÃO ENCONTRADO');
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    console.log('🟢 Drag END - Active ID:', active.id, 'Over ID:', over?.id);

    // Sempre limpar o activeId no final
    setActiveId(null);

    if (!over) {
      console.log('🟢 Sem over, cancelando');
      return;
    }

    // Se arrastou para o mesmo lugar, não faz nada
    if (active.id === over.id) {
      console.log('🟢 Mesmo lugar, cancelando');
      return;
    }

    // Extrair o ID real do item (remover prefixo se houver)
    const activeIdString = typeof active.id === 'string' ? active.id : String(active.id);
    
    let activeId;
    if (activeIdString.includes('-')) {
      const parts = activeIdString.split('-');
      // Pegar o último elemento que deve ser o ID numérico
      activeId = parseInt(parts[parts.length - 1]);
      console.log('🟢 Extraído ID numérico:', activeId, 'de:', activeIdString);
    } else {
      activeId = parseInt(activeIdString);
    }
    
    if (isNaN(activeId)) {
      console.error('❌ ID inválido extraído:', activeIdString);
      return;
    }
    
    const item = programacao.find(p => p.id === activeId);
    
    if (!item) {
      console.error('❌ Item não encontrado! ID:', activeId, 'Active ID original:', active.id);
      console.error('❌ Programação disponível:', programacao.map(p => ({ id: p.id, programa: p.programa })));
      return;
    }
    
    console.log('✅ Movendo item:', item.programa, 'ID:', item.id, 'Para slot:', over.data?.current);

    // Verificar se arrastou para um slot
    if (over.data?.current?.type === 'slot') {
      const { horario: horarioSlot, dia: diaSlot } = over.data.current;
      
      if (!horarioSlot || !diaSlot) {
        console.log('Dados do slot incompletos:', over.data.current);
        return;
      }

      // Se o programa já tinha horário, mantém a duração original
      let novoHorario;
      if (item.horario && item.horario.includes(' - ')) {
        const [hInicio, hFim] = item.horario.split(' - ');
        const [hInicioNum, mInicioNum] = hInicio.split(':').map(Number);
        const [hFimNum, mFimNum] = hFim.split(':').map(Number);
        
        const inicioMinutos = hInicioNum * 60 + mInicioNum;
        const fimMinutos = hFimNum * 60 + mFimNum;
        const duracaoMinutos = fimMinutos - inicioMinutos;
        
        const [novoHInicio] = horarioSlot.split(':').map(Number);
        const novoInicioMinutos = novoHInicio * 60;
        const novoFimMinutos = novoInicioMinutos + duracaoMinutos;
        
        const novoHFim = Math.floor(novoFimMinutos / 60) % 24; // Wrap around 24h
        const novoMFim = novoFimMinutos % 60;
        const novoFim = `${String(novoHFim).padStart(2, '0')}:${String(novoMFim).padStart(2, '0')}`;
        
        novoHorario = `${horarioSlot} - ${novoFim}`;
      } else {
        // Se não tinha horário, cria de 1h
        const [hInicio] = horarioSlot.split(':').map(Number);
        const hFim = (hInicio + 1) % 24;
        novoHorario = `${horarioSlot} - ${String(hFim).padStart(2, '0')}:00`;
      }
      
      try {
        const response = await api.put(`/programacao/${item.id}`, {
          diaSemana: diaSlot,
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

  const handleDuplicate = async (item) => {
    try {
      setSaving(true);
      const novoPrograma = {
        diaSemana: item.diaSemana || '',
        horario: item.horario || '',
        programa: item.programa,
        apresentador: item.apresentador || '',
        descricao: item.descricao || '',
      };
      await api.post('/programacao', novoPrograma);
      setStatus({ type: 'success', message: 'Programa duplicado com sucesso.' });
      loadProgramacao();
    } catch (error) {
      console.error('Erro ao duplicar programa:', error);
      setStatus({ type: 'error', message: 'Erro ao duplicar programa.' });
    } finally {
      setSaving(false);
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

  // Função para encontrar programas que estão ativos em um horário específico de um dia
  const getProgramasNoHorario = (dia, horario) => {
    return programasAgendados.filter(p => {
      if (p.diaSemana !== dia || !p.horario) return false;
      
      // Extrai horário de início e fim do programa
      const [hInicioStr, hFimStr] = p.horario.split(' - ');
      if (!hInicioStr || !hFimStr) return false;
      
      const [hInicio, mInicio] = hInicioStr.split(':').map(Number);
      const [hFim, mFim] = hFimStr.split(':').map(Number);
      const [hSlot, mSlot] = horario.split(':').map(Number);
      
      // Converte tudo para minutos
      const inicioMinutos = hInicio * 60 + mInicio;
      const fimMinutos = hFim * 60 + mFim;
      const slotMinutos = hSlot * 60 + mSlot;
      
      // Verifica se o slot está dentro do intervalo do programa
      // O programa ocupa o slot se o slot está entre o início (inclusive) e o fim (exclusive)
      return slotMinutos >= inicioMinutos && slotMinutos < fimMinutos;
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

  const activeItem = activeId ? programacao.find(p => {
    const id = typeof activeId === 'string' ? parseInt(activeId) : activeId;
    return p.id === id;
  }) : null;

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
            {/* Seletor de Dia */}
            <div className="mb-6 bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selecione o dia da semana:
              </label>
              <select
                value={selectedDia}
                onChange={(e) => setSelectedDia(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              >
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
            </div>

            {/* Lista de Programas Não Agendados */}
            {programasNaoAgendados.length > 0 && (
              <div className="mb-8 bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Programas Não Agendados</h2>
                <p className="text-gray-400 text-sm mb-4">Passe o mouse sobre um programa e arraste pelo ícone ☰ para agendar na grade</p>
                <SortableContext items={programasNaoAgendados.map(p => `nao-agendado-${p.id}`)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {programasNaoAgendados.map((item) => (
                      <SortableItem
                        key={`nao-agendado-${item.id}`}
                        id={item.id.toString()}
                        item={item}
                        prefix="nao-agendado"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )}

            {/* Grade Horária do Dia Selecionado - Layout 6x4 (6 colunas × 4 linhas) */}
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">Grade Horária 24h (6×4) - {selectedDia}</h2>
              <div className="grid grid-cols-6 gap-2">
                {horarios.map((horario) => {
                  const programasNoHorario = getProgramasNoHorario(selectedDia, horario);
                  return (
                    <DroppableSlot
                      key={`${selectedDia}-${horario}`}
                      id={`slot-${selectedDia}-${horario}`}
                      horario={horario}
                      dia={selectedDia}
                      programas={programasNoHorario}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                    />
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Vista de Lista */
          <div className="space-y-6">
            {diasSemana.map((dia) => {
              const itemsDoDia = programacao.filter(p => p.diaSemana === dia && p.horario);
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
