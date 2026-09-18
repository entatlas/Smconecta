'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/button';
import styles from './Login.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { checkEmailExists } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('CANDIDATE'); // CANDIDATE ou COMPANY
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Verifica se o e-mail existe antes de tentar o login no Supabase
      const emailExists = await checkEmailExists(email);
      if (!emailExists) {
        setError('E-mail não cadastrado.');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Senha incorreta.');
        setLoading(false);
        return;
      }

      // O middleware cuidará do redirecionamento baseado no perfil,
      // mas podemos forçar um reload para a raiz que processa a regra.
      router.push('/redirect-dashboard');
      router.refresh();
      
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao tentar entrar. Verifique sua conexão.');
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Por favor, digite seu e-mail primeiro para usar o Link Mágico.');
      return;
    }

    setLoading(true);

    // Verifica se o e-mail existe antes de tentar o login no Supabase
    const emailExists = await checkEmailExists(email);
    if (!emailExists) {
      setError('E-mail não cadastrado. Verifique o endereço e tente novamente.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?tipo=${tipo}`,
      },
    });

    if (error) {
      if (error.status === 429) {
        setError('Muitas tentativas. Aguarde um pouco.');
      } else {
        setError('Erro ao enviar o link mágico.');
      }
      setLoading(false);
      return;
    }

    setSuccess('Link Mágico enviado! Verifique sua caixa de entrada.');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?tipo=${tipo}`,
      }
    });
  };

  const handleLinkedinLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?tipo=${tipo}`,
      }
    });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={80} style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,217,255,0.2))' }} priority />
          </div>
          <h1 className={styles.title} style={{ marginTop: '8px' }}>Conecta SM</h1>
          <p className={styles.subtitle}>Faça login para acessar o ecossistema</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Qual o seu perfil principal?</p>
          <div className={styles.typeSelector}>
            <button 
              type="button" 
              className={tipo === 'CANDIDATE' ? styles.typeBtnActive : styles.typeBtn}
              onClick={() => setTipo('CANDIDATE')}
            >
              Sou Candidato
            </button>
            <button 
              type="button" 
              className={tipo === 'COMPANY' ? styles.typeBtnActive : styles.typeBtn}
              onClick={() => setTipo('COMPANY')}
            >
              Sou Empresa
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleLogin} 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com o Google
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={handleLinkedinLogin} 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
            </svg>
            Continuar com o LinkedIn
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleMagicLinkLogin} 
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/>
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>
            </svg>
            Entrar com Link Mágico
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ padding: '0 10px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>ou entre com seu e-mail</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.9rem', marginBottom: '1rem' }}>{success}</div>}
          
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <div className={styles.forgotPassword}>
            <Link href="/recuperar-senha" className={styles.link}>Esqueci minha senha</Link>
          </div>

          <Button type="submit" className={styles.submitButton} size="lg" isLoading={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <div className={styles.signupLink}>
            Não tem uma conta? <Link href="/cadastro" className={styles.link}>Cadastre-se</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
