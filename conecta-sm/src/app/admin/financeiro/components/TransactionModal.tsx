'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { getFinancialSupportData, createTransaction } from '../actions';
import { useRouter } from 'next/navigation';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'INCOME';
}

export function TransactionModal({ isOpen, onClose, defaultType = 'INCOME' }: TransactionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ categories: [], costCenters: [], companies: [] });
  
  const [formData, setFormData] = useState({
    type: defaultType,
    description: '',
    amount: '',
    categoryId: '',
    costCenterId: '',
    companyId: '',
    dueDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'PENDING',
    paymentMethod: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, type: defaultType }));
      getFinancialSupportData().then(setData);
    }
  }, [isOpen, defaultType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTransaction(formData);
      router.refresh();
      onClose();
      // Reset form
      setFormData({
        type: defaultType,
        description: '',
        amount: '',
        categoryId: '',
        costCenterId: '',
        companyId: '',
        dueDate: '',
        issueDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'PENDING',
        paymentMethod: ''
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = data.categories.filter((c: any) => c.type === formData.type);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nova Receita"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Tipo de Lançamento</label>
            <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} required>
              <option value="INCOME">Receita (Entrada)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Valor (R$)</label>
            <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Descrição</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Ex: Aluguel, Pgto Cliente X..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Data de Vencimento</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Categoria</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} required>
              <option value="">Selecione...</option>
              {filteredCategories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Status Atual</label>
            <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} required>
              <option value="PENDING">Pendente (A receber)</option>
              <option value="PAID">Realizado (Recebido)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Centro de Custo (Opcional)</label>
            <select name="costCenterId" value={formData.costCenterId} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
              <option value="">Nenhum</option>
              {data.costCenters.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Observações (Opcional)</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: '#10b981', border: 'none', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </div>

      </form>
    </Modal>
  );
}
