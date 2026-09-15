'use client';

import React, { useState, useEffect } from 'react';
import { getEmailTemplates, saveEmailTemplate, deleteEmailTemplate } from './actions';
import { Mail, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    const data = await getEmailTemplates();
    setTemplates(data);
    setLoading(false);
  }

  const openForm = (template?: any) => {
    if (template) {
      setEditingId(template.id);
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
    } else {
      setEditingId(null);
      setName('');
      setSubject('');
      setBody('<div style="font-family: sans-serif; padding: 20px;">\n  <h1>Olá {{candidateName}},</h1>\n  <p>Mensagem aqui.</p>\n</div>');
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name || !subject || !body) return alert("Preencha todos os campos.");
    const res = await saveEmailTemplate({ id: editingId || undefined, name, subject, body });
    if (res.success) {
      alert("Template salvo com sucesso!");
      closeForm();
      loadTemplates();
    } else {
      alert("Erro ao salvar: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este template? Ele pode parar o envio de e-mails dessa funcionalidade.")) {
      const res = await deleteEmailTemplate(id);
      if (res.success) {
        loadTemplates();
      } else {
        alert("Erro: " + res.error);
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#8B9BB4' }}>Carregando templates...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFF', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail /> Templates de E-mail
          </h1>
          <p style={{ color: '#8B9BB4', margin: 0 }}>Gerencie o texto e visual dos e-mails disparados pelo sistema.</p>
        </div>
        <button 
          onClick={() => openForm()}
          style={{ background: '#00D9FF', color: '#031225', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Novo Template
        </button>
      </div>

      {isFormOpen && (
        <div style={{ background: '#051A35', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(0, 217, 255, 0.3)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#FFF', margin: 0 }}>{editingId ? 'Editar Template' : 'Novo Template'}</h2>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: '#8B9BB4', cursor: 'pointer' }}><X /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#8B9BB4', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Nome do Evento (Sem espaços)</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex: JOB_MATCH, INTERVIEW_SCHEDULED" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#031225', color: '#FFF' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8B9BB4', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Assunto do E-mail</label>
              <input 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="Ex: Nova Vaga Compatível com seu Perfil!" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#031225', color: '#FFF' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: '#8B9BB4', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Corpo do E-mail (HTML)</span>
              <span>Variáveis: {'{{candidateName}}, {{jobTitle}}, {{companyName}}'}</span>
            </label>
            <textarea 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              rows={15}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#031225', color: '#FFF', fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={closeForm} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#8B9BB4', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSave} style={{ background: '#00D9FF', color: '#031225', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Salvar Template
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {templates.map(template => (
          <div key={template.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {template.name}
              </div>
              <h3 style={{ color: '#FFF', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{template.subject}</h3>
              <p style={{ color: '#8B9BB4', margin: 0, fontSize: '0.85rem' }}>Atualizado em {new Date(template.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => openForm(template)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#FFF', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(template.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <Mail size={32} color="#8B9BB4" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#8B9BB4', margin: 0 }}>Nenhum template de e-mail cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
