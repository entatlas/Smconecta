'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/button';
import styles from '../login/Login.module.css';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetSenhaPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // O Supabase irá automaticamente capturar o hash da URL (access_token)
  // e estabelecer a sessão se o link for válido.

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError('Erro ao redefinir a senha. O link pode ter expirado.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={80} style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,217,255,0.2))' }} priority />
          </div>
          <h1 className={styles.title} style={{ marginTop: '8px' }}>Nova Senha</h1>
          <p className={styles.subtitle}>Digite sua nova senha para acessar sua conta.</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Senha Redefinida!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Sua senha foi atualizada com sucesso. Você já pode fazer login com a nova senha.
            </p>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button style={{ width: '100%' }}>Ir para o Login</Button>
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleUpdatePassword}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <Input 
              label="Nova Senha" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />

            <Input 
              label="Confirmar Nova Senha" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            
            <Button type="submit" className={styles.submitButton} size="lg" isLoading={loading}>
              <Lock size={18} style={{ marginRight: '8px' }} />
              Salvar nova senha
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
