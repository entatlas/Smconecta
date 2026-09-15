'use client';

import React, { useState } from 'react';
import { submitTrabalheConoscoSM } from '../actions';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { PhoneInput } from '@/components/ui/Input/MaskedInputs';
import styles from '../../page.module.css';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface UserProfileInfo {
  nome: string;
  email: string;
  telefone: string;
}

export function TrabalheConoscoForm({ userProfile }: { userProfile: UserProfileInfo | null }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!userProfile) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    // Add userProfile info to formData since the fields are disabled and might not be submitted by the browser
    formData.append('q01_nome', userProfile.nome);
    formData.append('q04_whatsapp', userProfile.telefone || '');
    formData.append('q05_email', userProfile.email);
    
    try {
      const res = await submitTrabalheConoscoSM(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Ocorreu um erro ao enviar.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.main}>
      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Quase lá!</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
              Para garantir a segurança dos seus dados e atrelar sua candidatura ao seu perfil, você precisa estar logado na plataforma. Não se preocupe, seus dados não serão perdidos se você fizer login em uma nova aba e depois voltar aqui!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setShowLoginModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                Voltar
              </button>
              <Link href="/login" target="_blank" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Fazer Login (Nova Aba)
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <section className={styles.hero} style={{ minHeight: '30vh', paddingTop: '100px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1 style={{ fontSize: '2.5rem' }}>Cadastro de <span className={styles.highlight}>Equipe Técnica</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto', maxWidth: '800px', fontSize: '1.1rem' }}>
              Equipe Técnica Multidisciplinar - SM Soluções & Treinamentos. Preencha o formulário abaixo com atenção para participar da nossa seleção.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: '2rem' }}>
        <div className={styles.container}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {success ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center' }}>
                <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>Cadastro Recebido com Sucesso!</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Agradecemos seu interesse em fazer parte da Equipe Técnica da SM Soluções. Nosso time de gestão analisará seu perfil detalhadamente.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <Image src="/FotoequipeSm.png" alt="Equipe SM Soluções" width={800} height={400} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} priority />
                </div>

                {error && (
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9rem' }}>
                    {error}
                  </div>
                )}

                <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>1. Dados Pessoais</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>01 - Nome completo *</label>
                    <input type="text" name="q01_nome" required className={userProfile ? "input-field disabled-field" : "input-field"} disabled={!!userProfile} defaultValue={userProfile?.nome || ''} placeholder="Seu nome" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>02 - Data de nascimento *</label>
                    <input type="date" name="q02_nascimento" required className="input-field" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>03 - Cidade e bairro onde reside *</label>
                    <input type="text" name="q03_cidade" required className="input-field" placeholder="Ex: São Paulo - Pinheiros" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>04 - WhatsApp principal *</label>
                    <PhoneInput name="q04_whatsapp" required className={userProfile?.telefone ? "input-field disabled-field" : "input-field"} disabled={!!userProfile?.telefone} value={userProfile?.telefone || ''} placeholder="(11) 99999-9999" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>05 - E-mail *</label>
                    <input type="email" name="q05_email" required className={userProfile ? "input-field disabled-field" : "input-field"} disabled={!!userProfile} defaultValue={userProfile?.email || ''} placeholder="joao@email.com" />
                  </div>
                </div>

                <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginTop: '1rem' }}>2. Conhecimentos e Formação</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>06 - Em quais áreas você possui conhecimento, experiência ou habilidade? * (Pode marcar várias)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    {['Administração', 'Recepção', 'Segurança', 'Limpeza', 'Saúde', 'RH e Liderança', 'Informática', 'Comunicação', 'Vendas', 'Atendimento', 'Palestras', 'Empreendedorismo', 'Logística', 'Educação Social', 'Jurídica', 'Financeira', 'Marketing Digital', 'Outro'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="q06_areas" value={opt} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>07 - Qual seu nível de escolaridade? *</label>
                    <select name="q07_escolaridade" required className="input-field">
                      <option value="">Selecione...</option>
                      <option value="Ensino Fundamental">Ensino Fundamental</option>
                      <option value="Ensino Médio">Ensino Médio</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Superior Incompleto">Superior Incompleto</option>
                      <option value="Superior Completo">Superior Completo</option>
                      <option value="Pós-graduação">Pós-graduação</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>08 - Quais cursos, formações ou certificações você possui? *</label>
                  <textarea name="q08_cursos" rows={3} required className="input-field"></textarea>
                </div>

                <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginTop: '1rem' }}>3. Experiência</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>09 - Você já ministrou treinamentos, aulas ou palestras? *</label>
                  <select name="q09_ministrou" required className="input-field">
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>10 - Caso tenha ministrado cursos, compartilhe um pouco da experiência:</label>
                  <textarea name="q10_experiencia_treinamentos" rows={3} className="input-field"></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>11 - Modalidades de interesse para atuar (Pode marcar várias) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    {['Instrutor(a)', 'Palestrante', 'Facilitador(a)', 'Mentor(a)', 'Consultor(a)', 'Voluntário(a)', 'Apoio operacional', 'Treinamentos empresariais'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="q11_modalidades" value={opt} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>12 - Experiência prática comprovada na área? *</label>
                    <select name="q12_experiencia_pratica" required className="input-field">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>13 - Cite empresas, projetos ou instituições onde já atuou:</label>
                  <textarea name="q13_empresas_atuou" rows={2} className="input-field"></textarea>
                </div>

                <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginTop: '1rem' }}>4. Disponibilidade e Perfil</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>14 - Qual sua disponibilidade? *</label>
                    <select name="q14_disponibilidade_horario" required className="input-field">
                      <option value="">Selecione...</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Finais de semana">Finais de semana</option>
                      <option value="Horário comercial">Horário comercial</option>
                      <option value="Flexível">Flexível</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>21 - Facilidade para iniciar com pouco prazo? *</label>
                    <select name="q21_prazo" required className="input-field">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>16 - Você possui: (Marque as opções aplicáveis) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    {['MEI', 'CNPJ', 'Nota Fiscal', 'Conta bancária PJ', 'Conta bancária PF', 'Certificados digitalizados', 'Currículo atualizado'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="q16_possui" value={opt} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>18 - Quais características mais combinam com você? (Até 5) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    {['Liderança', 'Comunicação', 'Organização', 'Disciplina', 'Empatia', 'Trabalho em equipe', 'Criatividade', 'Comprometimento', 'Postura profissional', 'Facilidade para ensinar', 'Flexibilidade', 'Espírito voluntário'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="q18_caracteristicas" value={opt} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>19 - Por que deseja fazer parte da Equipe Técnica SM? *</label>
                  <textarea name="q19_motivo" rows={3} required className="input-field"></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>24 - Você possui alguma habilidade diferenciada que considera importante informar?</label>
                  <textarea name="q24_habilidade" rows={2} className="input-field"></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>25 - Deseja deixar uma mensagem final para a equipe SM?</label>
                  <textarea name="q25_mensagem" rows={2} className="input-field"></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="q20_autoriza" value="Sim" required style={{ marginTop: '0.2rem' }} /> 
                    <span>20 - Você autoriza a SM Soluções & Treinamentos a manter seus dados em banco interno para futuras oportunidades? *</span>
                  </label>
                </div>

                <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Enviando Candidatura...</>
                  ) : (
                    <><Send size={20} /> Enviar Cadastro</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .input-field {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: #fff;
          width: 100%;
        }
        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
        }
        select.input-field option {
          background: #0f172a;
          color: #fff;
        }
        .disabled-field {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
