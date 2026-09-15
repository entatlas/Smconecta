'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/button';
import styles from '../login/Login.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Mail, CheckCircle, Clock } from 'lucide-react';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Timer logic
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (countdown > 0) return; // Prevent spamming if timer is active

    setError('');
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-senha`;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        // Supabase rate limit error often comes here
        if (error.status === 429) {
          setError('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
        } else {
          setError('Não foi possível enviar o e-mail de recuperação. Verifique o endereço e tente novamente.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Calculate next cooldown: 1st time = 60s, 2nd time = 180s (3min), next = 300s (5min)
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      
      if (nextAttempt === 1) {
        setCountdown(60);
      } else if (nextAttempt === 2) {
        setCountdown(180);
      } else {
        setCountdown(300);
      }
      
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={80} style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,217,255,0.2))' }} priority />
          </div>
          <h1 className={styles.title} style={{ marginTop: '8px' }}>Recuperar Senha</h1>
          <p className={styles.subtitle}>Enviaremos um link seguro para você criar uma nova senha.</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>E-mail Enviado!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Se existir uma conta associada a <strong>{email}</strong>, você receberá um link de recuperação. Lembre-se de verificar sua caixa de Spam.
            </p>
            
            {error && <div className={styles.errorMessage} style={{ marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                variant="outline" 
                onClick={() => handleResetPassword()} 
                disabled={countdown > 0 || loading}
                isLoading={loading}
              >
                {countdown > 0 ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> Aguarde {formatTime(countdown)} para reenviar
                  </span>
                ) : (
                  'Reenviar e-mail'
                )}
              </Button>
              
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button variant="default" style={{ width: '100%' }}>Voltar para o Login</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleResetPassword}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <Input 
              label="E-mail de cadastro" 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            <Button type="submit" variant="default" className="w-full h-11 bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-slate-900 font-bold mt-4" disabled={loading}>
              <Mail size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
            
            <div className={styles.signupLink} style={{ marginTop: '1rem' }}>
              Lembrou sua senha? <Link href="/login" className={styles.link}>Faça login</Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
