'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function PrecosPage() {
  const router = useRouter();
  const [precos, setPrecos] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    checkAuth();
    loadPrecos();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadPrecos = async () => {
    try {
      const response = await api.get('/precos');
      if (response.data.success) {
        setPrecos(response.data.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ano) => {
    setEditingYear(ano);
    setFormData(precos[ano] || {});
  };

  const handleSave = async (ano) => {
    try {
      await api.put(`/precos/${ano}`, formData);
      setEditingYear(null);
      loadPrecos();
      alert('Preços atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preços:', error);
      alert('Erro ao atualizar preços');
    }
  };

  const handleCancel = () => {
    setEditingYear(null);
    setFormData({});
  };

  const anos = [2023, 2024, 2025];
  const tiposPreco = [
    { key: 'banner_popup', label: 'Banner Pop-up', icon: '📢' },
    { key: 'banner_lateral', label: 'Banner Lateral', icon: '📌' },
    { key: 'banner_rodape', label: 'Banner Rodapé', icon: '⬇️' },
    { key: 'spot_30s', label: 'Spot 30 segundos', icon: '🎵' },
    { key: 'spot_60s', label: 'Spot 60 segundos', icon: '🎶' },
    { key: 'programa_patrocinado', label: 'Programa Patrocinado', icon: '⭐' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando preços...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Tabela de Preços
        </h1>
        <p className="text-gray-400 mt-2">Gerencie os preços de publicidade por ano</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {anos.map((ano) => (
          <div
            key={ano}
            className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-6 border-2 border-yellow-500/30 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">{ano}</h2>
              {editingYear === ano ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave(ano)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm"
                  >
                    ✓ Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit(ano)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            <div className="space-y-4">
              {tiposPreco.map((tipo) => (
                <div key={tipo.key} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{tipo.icon}</span>
                    <span className="text-gray-300 text-sm">{tipo.label}</span>
                  </div>
                  {editingYear === ano ? (
                    <input
                      type="number"
                      value={formData[tipo.key] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [tipo.key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-24 px-2 py-1 bg-black/50 border border-gray-700 rounded text-white text-sm text-right"
                      placeholder="0.00"
                      step="0.01"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      R$ {precos[ano]?.[tipo.key]?.toFixed(2) || '0.00'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


