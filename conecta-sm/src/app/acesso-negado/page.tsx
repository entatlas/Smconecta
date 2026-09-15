import React from 'react';
import Link from 'next/link';

export default function AcessoNegado() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#e53e3e' }}>Acesso Negado</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#4a5568' }}>
        Você não tem permissão para acessar esta área com o seu perfil atual.
      </p>
      <Link 
        href="/" 
        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3182ce', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 'bold' }}
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
