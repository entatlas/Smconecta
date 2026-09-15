'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { toast } from 'sonner';
import { Upload, FileVideo, FileAudio, FileText, Briefcase, Camera } from 'lucide-react';
import { submitInspiringStory } from './actions';
import { createClient } from '@/utils/supabase/client';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function EnviarHistoriaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // Step logic
  const [step, setStep] = useState(1);

  // Form State
  const [type, setType] = useState<'VIDEO' | 'AUDIO' | 'TEXT' | 'SUCCESS_CASE'>('VIDEO');
  const [name, setName] = useState('');
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');
  const [company, setCompany] = useState('');
  const [courseName, setCourseName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [ufs, setUfs] = useState<{sigla: string, nome: string}[]>([]);
  const [cities, setCities] = useState<{nome: string}[]>([]);

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setUfs(data));
  }, []);

  useEffect(() => {
    if (uf) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(res => res.json())
        .then(data => setCities(data));
    } else {
      setCities([]);
    }
  }, [uf]);

  // Máscara de Telefone (Whatsapp)
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setWhatsapp(val);
  };
  
  // Content State
  const [content, setContent] = useState(''); // Text or description
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // Success Case State
  const [caseBefore, setCaseBefore] = useState('');
  const [caseTraining, setCaseTraining] = useState('');
  const [caseExperience, setCaseExperience] = useState('');
  const [caseResult, setCaseResult] = useState('');
  const [caseCurrent, setCaseCurrent] = useState('');

  // Consent
  const [consent, setConsent] = useState(false);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'VIDEO' && file.size > MAX_VIDEO_SIZE) {
        toast.error('O vídeo não pode exceder 50MB.');
        return;
      }
      if (type === 'AUDIO' && file.size > MAX_AUDIO_SIZE) {
        toast.error('O áudio não pode exceder 10MB.');
        return;
      }
      setMediaFile(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('A imagem de capa não pode exceder 5MB.');
        return;
      }
      setCoverFile(file);
    }
  };

  const uploadToStorage = async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `pending/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro no upload', uploadError);
      return null;
    }
    
    // As stories pendentes são guardadas no public mas o admin aprova.
    // Pra simplificar retornamos a public URL direto.
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error('Você precisa aceitar os termos de consentimento.');
      return;
    }
    
    if (!name || !city) {
      toast.error('Preencha pelo menos seu nome e cidade.');
      return;
    }

    setLoading(true);
    let coverUrl = null;
    let mediaUrl = null;

    try {
      if (coverFile) {
        toast.info('Fazendo upload da foto...');
        coverUrl = await uploadToStorage(coverFile, 'public_assets');
      }

      if (mediaFile && (type === 'VIDEO' || type === 'AUDIO')) {
        toast.info(`Fazendo upload do ${type === 'VIDEO' ? 'vídeo' : 'áudio'}... isso pode demorar alguns segundos.`);
        mediaUrl = await uploadToStorage(mediaFile, 'public_assets'); // ideally a separate bucket 'stories_media'
      }

      toast.info('Salvando história...');
      const result = await submitInspiringStory({
        type, name, whatsapp, courseName, profession, company, city: `${city} - ${uf}`,
        content, coverUrl, mediaUrl,
        caseBefore, caseTraining, caseExperience, caseResult, caseCurrent
      });

      if (result.success) {
        toast.success('História enviada com sucesso! Ela passará por análise antes de ser publicada.');
        setStep(3); // Success Screen
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Conte sua História
        </h1>
        <p className="text-slate-400 mb-8">
          Inspire outras pessoas compartilhando sua trajetória e os resultados que você alcançou com a SM.
        </p>

        {step === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Qual formato você prefere?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { id: 'VIDEO', label: 'Vídeo Depoimento', icon: FileVideo, desc: 'Grave um vídeo curto (até 50MB)' },
                { id: 'AUDIO', label: 'Áudio / Podcast', icon: FileAudio, desc: 'Envie um áudio contando sua história (até 10MB)' },
                { id: 'TEXT', label: 'Depoimento Escrito', icon: FileText, desc: 'Escreva um texto relatando sua experiência' },
                { id: 'SUCCESS_CASE', label: 'Caso de Sucesso', icon: Briefcase, desc: 'Preencha passo a passo sua trajetória' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`flex flex-col items-start p-4 border rounded-xl transition-all ${
                    type === t.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <t.icon className={`mb-3 ${type === t.id ? 'text-blue-400' : 'text-slate-400'}`} size={28} />
                  <span className={`font-medium ${type === t.id ? 'text-blue-100' : 'text-slate-300'}`}>{t.label}</span>
                  <span className="text-xs text-slate-500 mt-1 text-left">{t.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Preencha seus dados</h2>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-400 hover:underline">Voltar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Seu Nome Completo *" value={name} onChange={e => setName(e.target.value)} required />
              <Input label="WhatsApp / Telefone" value={whatsapp} onChange={handleWhatsappChange} placeholder="(00) 00000-0000" />
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Estado *</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100" 
                  value={uf} 
                  onChange={e => setUf(e.target.value)} 
                  required
                >
                  <option value="">Selecione um Estado</option>
                  {ufs.map(u => <option key={u.sigla} value={u.sigla}>{u.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Cidade *</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  required
                  disabled={!uf || cities.length === 0}
                >
                  <option value="">Selecione uma Cidade</option>
                  {cities.map(c => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>

              <Input label="Qual curso você fez na SM?" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Ex: Formação Liderança" />
              <Input label="Sua Profissão / Cargo Atual" value={profession} onChange={e => setProfession(e.target.value)} />
              <Input label="Empresa" value={company} onChange={e => setCompany(e.target.value)} />
            </div>

            <div className="border-t border-slate-800 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Sua História ({type})</h3>
              
              {/* Cover Image for all types */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Foto de Capa / Perfil (Opcional, máx 5MB)</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors">
                    <Camera size={24} className="text-slate-400" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                  <span className="text-sm text-slate-500">{coverFile ? coverFile.name : 'Nenhuma imagem selecionada'}</span>
                </div>
              </div>

              {type === 'VIDEO' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Arquivo de Vídeo (Máx 50MB) *</label>
                    <input type="file" accept="video/*" required onChange={handleMediaUpload} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" />
                  </div>
                  <Input label="Pequena descrição (Opcional)" value={content} onChange={e => setContent(e.target.value)} />
                </div>
              )}

              {type === 'AUDIO' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Arquivo de Áudio (Máx 10MB) *</label>
                    <input type="file" accept="audio/*" required onChange={handleMediaUpload} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" />
                  </div>
                </div>
              )}

              {type === 'TEXT' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Seu Depoimento *</label>
                  <textarea 
                    required 
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="Escreva como foi sua experiência..."
                  />
                </div>
              )}

              {type === 'SUCCESS_CASE' && (
                <div className="space-y-4">
                  <Input label="Antes (Como era sua situação?)" value={caseBefore} onChange={e => setCaseBefore(e.target.value)} required />
                  <Input label="A Formação (O que você aprendeu?)" value={caseTraining} onChange={e => setCaseTraining(e.target.value)} required />
                  <Input label="A Experiência (Como foi aplicar?)" value={caseExperience} onChange={e => setCaseExperience(e.target.value)} required />
                  <Input label="O Resultado (O que você conquistou?)" value={caseResult} onChange={e => setCaseResult(e.target.value)} required />
                  <Input label="Situação Atual (Onde você está agora?)" value={caseCurrent} onChange={e => setCaseCurrent(e.target.value)} required />
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-6 mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-slate-400 leading-relaxed">
                  Confirmo que os dados fornecidos são reais e autorizo a Sérgio Mano Soluções a utilizar meu nome, imagem, depoimento, áudio e vídeo (caso enviados) no portal "Histórias que Inspiram" e em materiais institucionais, ciente de que o conteúdo será analisado antes da publicação.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading || !consent}>
                {loading ? 'Enviando...' : 'Enviar minha História'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Upload size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-4">História Recebida!</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Muito obrigado por compartilhar sua trajetória com a gente. Nossa equipe vai analisar com carinho e logo ela poderá aparecer na área de "Histórias que Inspiram".
            </p>
            <Button onClick={() => router.push('/historias')}>Ver histórias publicadas</Button>
          </div>
        )}
      </div>
    </div>
  );
}
