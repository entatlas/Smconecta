import { prisma } from '@/lib/prisma';
import React from 'react';
import { DollarSign, ArrowDownRight, ArrowUpRight, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { FinanceDashboardClient } from './FinanceDashboardClient';
import { TransactionList } from './components/TransactionList';


export default async function FinanceiroDashboard() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Fetch all transactions for the current month
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      issueDate: {
        gte: startOfMonth,
        lte: endOfMonth
      },
      status: { not: 'CANCELLED' } // Ignore cancelled transactions in totals
    }
  });

  // Calculate metrics
  // Calculate metrics
  let totalIncomeRealized = 0;
  let totalIncomePending = 0;

  transactions.forEach(t => {
    if (t.type === 'INCOME') {
      if (t.status === 'PAID') totalIncomeRealized += t.amount;
      else totalIncomePending += t.amount;
    }
  });

  const saldoRealizado = totalIncomeRealized;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Dashboard Financeiro</h1>
          <p style={{ color: '#94a3b8' }}>Visão geral do mês atual ({startOfMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})</p>
        </div>
        
        {/* We use a client component to handle the Modal state */}
        <FinanceDashboardClient />
      </div>


      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Receitas Realizadas</p>
              <h3 style={{ fontSize: '2rem', color: '#10b981', margin: 0 }}>
                R$ {saldoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <DollarSign size={24} color="#00E5FF" />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#00E5FF" /> A Receber (Pendente)
          </h4>
          <h2 style={{ fontSize: '1.8rem', color: '#3b82f6', margin: 0 }}>
            R$ {totalIncomePending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

      </div>

      <div style={{ marginTop: '3rem' }}>
        <TransactionList transactions={transactions} title="Histórico de Lançamentos (Mês Atual)" />
      </div>

    </div>
  );
}
