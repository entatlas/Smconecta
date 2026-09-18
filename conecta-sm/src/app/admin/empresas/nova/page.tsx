import React from 'react';
import { CompanyAdminForm } from './components/CompanyAdminForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Adicionar Empresa | Admin Conecta SM',
};

export default function NovaEmpresaPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', color: '#EAF2FF' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/empresas" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', textDecoration: 'none', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Voltar para Empresas
        </Link>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Adicionar Nova Empresa</h1>
        <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Preencha os dados abaixo para cadastrar manualmente uma empresa no sistema.</p>
      </div>

      <CompanyAdminForm />
    </div>
  );
}
