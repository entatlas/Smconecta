'use client';

import React from 'react';
import { Mail, Phone } from 'lucide-react';
import styles from '../page.module.css';

export default function Contato() {
  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '40vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Fale com a <span className={styles.highlight}>SM</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Estamos prontos para entender seu momento e apresentar a melhor solução.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.featureSplit} style={{ alignItems: 'flex-start' }}>
            
            <div className={styles.featureContent}>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Informações de Contato</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <a href="https://wa.me/5511995721209" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #00E5FF 0%, #0077FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px -5px rgba(0,229,255,0.4)' }}>
                    <Phone size={28} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>WhatsApp</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      Fale diretamente com nossa equipe para um atendimento mais rápido e ágil.
                    </p>
                    <p style={{ color: '#00E5FF', marginTop: '1rem', fontWeight: 600 }}>(11) 99572-1209</p>
                  </div>
                </a>

                <a href="mailto:contato@sergiomano.com.br" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px -5px rgba(139,92,246,0.4)' }}>
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>E-mail</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      Para propostas comerciais, envio de materiais e parcerias estratégicas.
                    </p>
                    <p style={{ color: '#a78bfa', marginTop: '1rem', fontWeight: 600 }}>contato@sergiomano.com.br</p>
                  </div>
                </a>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Envie uma mensagem via WhatsApp</h3>
              <form 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const nome = formData.get('nome');
                  const empresa = formData.get('empresa');
                  const assunto = formData.get('assunto');
                  const mensagem = formData.get('mensagem');
                  
                  if (!nome || !mensagem) {
                    alert('Por favor, preencha o nome e a mensagem.');
                    return;
                  }
                  
                  let texto = `Olá! Meu nome é *${nome}*.\n`;
                  if (empresa) {
                    texto += `Empresa: *${empresa}*\n`;
                  }
                  texto += `\nEstou entrando em contato através do site Conecta SM.\n`;
                  texto += `*Assunto:* ${assunto || 'Contato geral'}\n\n`;
                  texto += `*Mensagem:*\n"${mensagem}"`;
                  
                  const url = `https://wa.me/5511995721209?text=${encodeURIComponent(texto)}`;
                  window.open(url, '_blank');
                }}
              >
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome Completo *</label>
                  <input name="nome" type="text" required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} placeholder="Digite seu nome" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome da Empresa (Opcional)</label>
                  <input name="empresa" type="text" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} placeholder="Sua empresa" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Assunto *</label>
                  <select name="assunto" required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
                    <option value="" style={{ background: '#0f172a', color: '#fff' }}>Selecione um assunto</option>
                    <option value="Sou empresa e quero contratar" style={{ background: '#0f172a', color: '#fff' }}>Sou empresa e quero contratar</option>
                    <option value="Dúvida sobre vagas/cursos" style={{ background: '#0f172a', color: '#fff' }}>Dúvida sobre vagas/cursos</option>
                    <option value="Parcerias" style={{ background: '#0f172a', color: '#fff' }}>Parcerias</option>
                    <option value="Outros" style={{ background: '#0f172a', color: '#fff' }}>Outros</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mensagem</label>
                  <textarea name="mensagem" required rows={4} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} placeholder="Escreva sua mensagem..."></textarea>
                </div>
                <button type="submit" className={styles.btnPrimary} style={{ width: '100%', border: 'none', cursor: 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Phone size={18} />
                  Enviar via WhatsApp
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
