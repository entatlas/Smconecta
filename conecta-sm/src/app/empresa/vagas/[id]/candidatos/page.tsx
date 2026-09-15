'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Download, Mail, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VagaCandidatos({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Mock data representing Supabase fetch
  const candidatos = [
    { id: 1, name: 'Alyson Santos', role: 'Desenvolvedor Front-end', city: 'São Paulo, SP', match: '92%', status: 'IN_REVIEW', date: 'Há 2 dias' },
    { id: 2, name: 'João Silva', role: 'Engenheiro de Software', city: 'Campinas, SP', match: '75%', status: 'SENT', date: 'Há 5 dias' },
    { id: 3, name: 'Maria Souza', role: 'UI/UX Designer', city: 'Remoto', match: '40%', status: 'REJECTED', date: 'Há 1 semana' }
  ];

  return (
    <div style={{ padding: 'var(--spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Voltar para Vagas
      </button>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Candidatos da Vaga</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Desenvolvedor Front-end React</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline"><Download size={16} style={{ marginRight: '0.5rem' }} /> Exportar</Button>
        </div>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Candidato</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Localização</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Aderência</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Data</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {candidatos.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{c.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{c.city}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 600, color: parseInt(c.match) > 80 ? 'var(--color-success)' : parseInt(c.match) > 60 ? 'var(--color-warning)' : 'var(--color-error)' }}>
                    {c.match}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{c.date}</td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    defaultValue={c.status}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.85rem', backgroundColor: c.status === 'REJECTED' ? 'var(--color-error-light)' : c.status === 'IN_REVIEW' ? 'var(--color-warning-light)' : 'var(--color-bg-main)' }}
                  >
                    <option value="SENT">Nova</option>
                    <option value="IN_REVIEW">Em análise</option>
                    <option value="SHORTLISTED">Pré-selecionado</option>
                    <option value="INTERVIEW">Entrevista</option>
                    <option value="APPROVED">Aprovado</option>
                    <option value="REJECTED">Reprovado</option>
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" style={{ padding: '0.5rem' }} title="Ver Perfil Completo"><User size={16} /></Button>
                    <Button variant="outline" size="sm" style={{ padding: '0.5rem' }} title="Contato"><Mail size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
