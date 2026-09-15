'use client';

import React, { useState } from 'react';
import { markAsPaid, cancelTransaction } from '../actions';
import { CheckCircle2, XCircle, Clock, FileText, Settings, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TransactionList({ transactions, title }: { transactions: any[], title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAsPaid = async (id: string, currentStatus: string) => {
    if (currentStatus !== 'PENDING') return;
    const confirm = window.confirm('Marcar este lançamento como pago/recebido na data de hoje?');
    if (!confirm) return;

    setLoading(true);
    try {
      await markAsPaid(id, new Date().toISOString(), 'Transferência/Boleto/Pix');
      router.refresh();
    } catch (err) {
      alert('Erro ao marcar como pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string, currentStatus: string) => {
    if (currentStatus === 'CANCELLED') return;
    const reason = window.prompt('Motivo do cancelamento (Obrigatório):');
    if (!reason) return;

    setLoading(true);
    try {
      await cancelTransaction(id, reason);
      router.refresh();
    } catch (err) {
      alert('Erro ao cancelar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: Date) => {
    if (status === 'PAID') {
      return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={12}/> Pago/Recebido</span>;
    }
    if (status === 'CANCELLED') {
      return <span style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={12}/> Cancelado</span>;
    }
    if (new Date(dueDate) < new Date() && status === 'PENDING') {
      return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> Vencido</span>;
    }
    return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> Pendente</span>;
  };

  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>{title}</h2>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Descrição</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Categoria</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Vencimento</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Valor (R$)</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUpRight size={16} color="#10b981" />
                  {t.description}
                </td>
                <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {t.category?.name || '-'}
                </td>
                <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                  + R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex' }}>{getStatusBadge(t.status, t.dueDate)}</div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {t.status === 'PENDING' && (
                      <button 
                        onClick={() => handleMarkAsPaid(t.id, t.status)}
                        disabled={loading}
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                        title="Marcar como Pago/Recebido"
                      >
                        <Banknote size={16} />
                      </button>
                    )}
                    {t.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleCancel(t.id, t.status)}
                        disabled={loading}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                        title="Cancelar Lançamento"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  Nenhum dado financeiro registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

