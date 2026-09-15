'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createProfileFromOAuth } from './actions';
import { Building2, Users, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input/Input';

export default function CompletarPerfilPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<'CANDIDATE' | 'COMPANY' | null>(null);
  const [birthDate, setBirthDate] = useState('');
  
  const router = useRouter();

  const handleSelectType = (selectedType: 'CANDIDATE' | 'COMPANY') => {
    setTipo(selectedType);
    if (selectedType === 'CANDIDATE') {
      setStep(2); // Vai para o passo de preencher data de nascimento
    } else {
      handleFinalize(selectedType); // Empresa finaliza direto
    }
  };

  const handleFinalize = async (selectedType: 'CANDIDATE' | 'COMPANY', bDate?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await createProfileFromOAuth(selectedType, bDate);
      if (res.success) {
        // Redireciona para o handler global que cuida dos redirecionamentos corretos por tipo
        router.push('/redirect-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar perfil.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)', padding: '20px' }}>
      <Card style={{ maxWidth: '500px', width: '100%', padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Image src="/sm_logo.png" alt="SM Logo" width={150} height={80} style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,217,255,0.2))' }} priority />
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Quase lá!</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          Para finalizar seu acesso com o Google, precisamos saber como você vai usar a plataforma.
        </p>

        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSelectType('CANDIDATE')}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '1.5rem', gap: '1rem', color: 'var(--color-text-primary)' }}
            >
              <Users size={24} color="#00D9FF" />
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Sou Candidato</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>Quero encontrar vagas e me candidatar.</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSelectType('COMPANY')}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '1.5rem', gap: '1rem', color: 'var(--color-text-primary)' }}
            >
              <Building2 size={24} color="#00D9FF" />
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Sou Empresa</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>Quero anunciar vagas e encontrar talentos.</span>
              </div>
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); handleFinalize('CANDIDATE', birthDate); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Data de Nascimento *</label>
              <Input 
                type="date" 
                required 
                value={birthDate} 
                onChange={e => setBirthDate(e.target.value)}
                style={{ width: '100%', color: 'white' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading} style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Voltar
              </Button>
              <Button type="submit" disabled={loading || !birthDate} style={{ flex: 2, background: '#00D9FF', color: '#000' }}>
                {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
