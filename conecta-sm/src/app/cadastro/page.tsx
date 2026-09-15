'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/Input/Input';
import { PhoneInput } from '@/components/ui/Input/MaskedInputs';
import { Button } from '@/components/ui/button';
import styles from './Cadastro.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import { forceConfirmEmail, sendWelcomeEmail, checkPhoneExists } from './actions';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipo, setTipo] = useState('CANDIDATE'); // CANDIDATE ou COMPANY
  
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!acceptTerms) {
      setError('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra minúscula.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('A senha deve conter pelo menos um número.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('A senha deve conter pelo menos um caractere especial (ex: @, #, $, %).');
      return;
    }

    setLoading(true);

    // Verificar se o telefone já existe no banco antes de criar no Supabase
    const phoneExists = await checkPhoneExists(telefone);
    if (phoneExists) {
      setError('Este telefone já está vinculado a uma conta. Por favor, faça login ou recupere sua senha.');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // 1. Criar usuário no Supabase Auth passando metadados para a Trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
            tipo,
            birthDate: tipo === 'CANDIDATE' ? birthDate : undefined,
            marketing_opt_in: acceptMarketing
          }
        }
      });

      if (authError || !authData.user) {
        let errorMsg = authError?.message || 'Erro ao criar conta.';
        if (errorMsg === 'User already registered') {
          errorMsg = 'Este e-mail já está cadastrado.';
        } else if (errorMsg.includes('Password should be')) {
          errorMsg = 'A senha não atende aos requisitos mínimos.';
        } else if (errorMsg.includes('Email link is invalid')) {
          errorMsg = 'O link de e-mail é inválido ou expirou.';
        } else if (errorMsg.includes('Database error saving new user')) {
          errorMsg = 'Erro interno no banco de dados. Tente novamente.';
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Hack para forçar a confirmação de email no banco de dados
      await forceConfirmEmail(authData.user.id);
      
      // Enviar e-mail de boas vindas via Brevo em background
      sendWelcomeEmail(email, nome, tipo);

      // Fazer login manual agora que o email está confirmado
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!loginError && loginData.session) {
        // Redirecionamos direto para dentro da plataforma.
        router.push('/redirect-dashboard');
        router.refresh();
      } else {
        // Se der erro no auto-login, cai na tela de sucesso normal
        setSuccess(true);
      }
      
    } catch (err) {
      setError('Ocorreu um erro ao tentar criar a conta.');
      setLoading(false);
    }
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
      <Card className={styles.cadastroCard}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={80} style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,217,255,0.2))' }} priority />
          </div>
          <h1 className={styles.title} style={{ marginTop: '8px' }}>Crie sua conta</h1>
          <p className={styles.subtitle}>Junte-se ao ecossistema Conecta SM</p>
        </div>

        {success ? (
          <div className={styles.successState}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-success-dark)' }}>Conta criada com sucesso! 🎉</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Enviamos um link de confirmação para <strong>{email}</strong>.</p>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Por favor, verifique sua caixa de entrada (ou spam) e clique no link para ativar sua conta antes de fazer o login.</p>
            
            <Button onClick={() => router.push('/login')} className={styles.submitButton} style={{ marginTop: '2rem' }}>
              Ir para o Login
            </Button>
          </div>
        ) : (
          <>
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
                Criar conta com o Google
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
                Criar conta com o LinkedIn
              </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ padding: '0 10px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>ou preencha seus dados</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

            <form className={styles.form} onSubmit={handleRegister}>
            
            <Input 
              label="Nome completo / Razão Social" 
              placeholder="Digite seu nome" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required 
            />
            
            <Input 
              label="E-mail" 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="telefone" style={{ fontSize: '0.9rem', color: '#8B9BB4' }}>Telefone</label>
              <PhoneInput 
                id="telefone"
                placeholder="(11) 99999-9999" 
                value={telefone}
                onValueChange={(unmasked) => setTelefone(unmasked)}
                required
              />
            </div>

            {tipo === 'CANDIDATE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="birthDate" style={{ fontSize: '0.9rem', color: '#8B9BB4' }}>Data de Nascimento</label>
                <Input 
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            )}
            
            <div className={styles.row}>
              <Input 
                label="Senha" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <Input 
                label="Confirmar Senha" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            <div className={styles.passwordRules}>
              <div className={`${styles.passwordRule} ${password.length >= 8 ? styles.ruleValid : ''}`}>
                {password.length >= 8 ? <CheckCircle2 className={styles.ruleIcon} /> : <Circle className={styles.ruleIcon} />}
                Mínimo de 8 caracteres
              </div>
              <div className={`${styles.passwordRule} ${/[A-Z]/.test(password) ? styles.ruleValid : ''}`}>
                {/[A-Z]/.test(password) ? <CheckCircle2 className={styles.ruleIcon} /> : <Circle className={styles.ruleIcon} />}
                Pelo menos uma letra maiúscula
              </div>
              <div className={`${styles.passwordRule} ${/[a-z]/.test(password) ? styles.ruleValid : ''}`}>
                {/[a-z]/.test(password) ? <CheckCircle2 className={styles.ruleIcon} /> : <Circle className={styles.ruleIcon} />}
                Pelo menos uma letra minúscula
              </div>
              <div className={`${styles.passwordRule} ${/[0-9]/.test(password) ? styles.ruleValid : ''}`}>
                {/[0-9]/.test(password) ? <CheckCircle2 className={styles.ruleIcon} /> : <Circle className={styles.ruleIcon} />}
                Pelo menos um número
              </div>
              <div className={`${styles.passwordRule} ${/[^A-Za-z0-9]/.test(password) ? styles.ruleValid : ''}`}>
                {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 className={styles.ruleIcon} /> : <Circle className={styles.ruleIcon} />}
                Pelo menos um caractere especial (@, #, $, etc)
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#00D9FF' }}
                />
                <span style={{ lineHeight: '1.4' }}>
                  Li e concordo com os <Link href="/termos" style={{ color: '#00D9FF', textDecoration: 'underline' }} target="_blank">Termos de Uso</Link> e a <Link href="/privacidade" style={{ color: '#00D9FF', textDecoration: 'underline' }} target="_blank">Política de Privacidade</Link>, incluindo o uso de cookies necessários para o funcionamento da plataforma. *
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#00D9FF' }}
                />
                <span style={{ lineHeight: '1.4' }}>
                  Quero receber e-mails com novidades, dicas de carreira e recomendações de vagas ou talentos da SM.
                </span>
              </label>
            </div>
            
            {error && <div className={styles.errorMessage} style={{ marginTop: '-10px', marginBottom: '10px' }}>{error}</div>}

            <Button type="submit" className={styles.submitButton} size="lg" isLoading={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
            
            <div className={styles.loginLink}>
              Já tem uma conta? <Link href="/login" className={styles.link}>Entrar</Link>
            </div>
          </form>
          </>
        )}
      </Card>
    </div>
  );
}
