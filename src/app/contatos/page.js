'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatusAlert from '@/components/StatusAlert';
import LoadingButton from '@/components/LoadingButton';

export default function ContatosPage() {
  const router = useRouter();
  const [contatos, setContatos] = useState({
    emails: [''],
    telefones: [''],
    website: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    checkAuth();
    loadContatos();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const loadContatos = async () => {
    try {
      const response = await api.get('/config/contatos');
      if (response.data.success) {
        const data = response.data.data || {};
        
        // Converter formato antigo (email único) para novo formato (array)
        const emails = data.emails || (data.email ? [data.email] : ['']);
        const telefones = data.telefones || (data.telefone ? [data.telefone] : ['']);
        
        setContatos({
          emails: emails.length > 0 ? emails : [''],
          telefones: telefones.length > 0 ? telefones : [''],
          website: data.website || '',
          instagram: data.instagram || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      // Usar valores padrão se der erro
      setContatos({
        emails: ['contato@radiotribofm.com.br'],
        telefones: [''],
        website: 'www.radiotribofm.com.br',
        instagram: '@radiotribofm1055',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que pelo menos um e-mail e um telefone estão preenchidos
    const emailsValidos = contatos.emails.filter(email => email.trim() !== '');
    const telefonesValidos = contatos.telefones.filter(tel => tel.trim() !== '');
    
    if (emailsValidos.length === 0) {
      setStatus({ type: 'error', message: 'Adicione pelo menos um e-mail.' });
      return;
    }
    
    if (telefonesValidos.length === 0) {
      setStatus({ type: 'error', message: 'Adicione pelo menos um telefone.' });
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        emails: emailsValidos,
        telefones: telefonesValidos,
        website: contatos.website,
        instagram: contatos.instagram,
      };
      
      await api.put('/config/contatos', dataToSend);
      setStatus({ type: 'success', message: 'Contatos atualizados com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      setStatus({ type: 'error', message: 'Erro ao atualizar contatos.' });
    } finally {
      setSaving(false);
    }
  };

  const addEmail = () => {
    setContatos({
      ...contatos,
      emails: [...contatos.emails, ''],
    });
  };

  const removeEmail = (index) => {
    if (contatos.emails.length > 1) {
      const newEmails = contatos.emails.filter((_, i) => i !== index);
      setContatos({
        ...contatos,
        emails: newEmails,
      });
    }
  };

  const updateEmail = (index, value) => {
    const newEmails = [...contatos.emails];
    newEmails[index] = value;
    setContatos({
      ...contatos,
      emails: newEmails,
    });
  };

  const addTelefone = () => {
    setContatos({
      ...contatos,
      telefones: [...contatos.telefones, ''],
    });
  };

  const removeTelefone = (index) => {
    if (contatos.telefones.length > 1) {
      const newTelefones = contatos.telefones.filter((_, i) => i !== index);
      setContatos({
        ...contatos,
        telefones: newTelefones,
      });
    }
  };

  const updateTelefone = (index, value) => {
    const newTelefones = [...contatos.telefones];
    newTelefones[index] = value;
    setContatos({
      ...contatos,
      telefones: newTelefones,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <div className="text-gray-400 mt-4">Carregando contatos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <StatusAlert
        status={status}
        onClose={() => setStatus({ type: null, message: '' })}
      />
      
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Contatos
        </h1>
        <p className="text-gray-400 mt-2">Gerencie as informações de contato exibidas no site e app</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg rounded-xl p-8 border-2 border-red-500/30 shadow-xl">
        <div className="space-y-6">
          {/* E-mails */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                📧 E-mails
              </label>
              <button
                type="button"
                onClick={addEmail}
                className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 text-green-300 rounded-lg transition text-sm"
              >
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {contatos.emails.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    placeholder="contato@radiotribofm.com.br"
                  />
                  {contatos.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="px-3 py-3 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition"
                      title="Remover e-mail"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Telefones */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                📱 Telefones
              </label>
              <button
                type="button"
                onClick={addTelefone}
                className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 text-green-300 rounded-lg transition text-sm"
              >
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {contatos.telefones.map((telefone, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => updateTelefone(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                    placeholder="(00) 00000-0000"
                  />
                  {contatos.telefones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTelefone(index)}
                      className="px-3 py-3 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition"
                      title="Remover telefone"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🌐 Website
            </label>
            <input
              type="text"
              value={contatos.website}
              onChange={(e) => setContatos({ ...contatos, website: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              placeholder="www.radiotribofm.com.br"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📱 Instagram
            </label>
            <input
              type="text"
              value={contatos.instagram}
              onChange={(e) => setContatos({ ...contatos, instagram: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              placeholder="@radiotribofm1055"
            />
          </div>

          <div className="pt-4 border-t border-gray-700">
            <LoadingButton
              type="submit"
              loading={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              Salvar Alterações
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
}
