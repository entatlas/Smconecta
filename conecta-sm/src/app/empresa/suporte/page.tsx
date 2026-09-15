'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LifeBuoy, CheckCircle2, AlertCircle, Loader2, UploadCloud, Paperclip, Send, Clock, CheckCheck, PlusCircle, Search, Eye, FileDown, X } from 'lucide-react';
import { createSupportTicket, getSupportTickets } from './actions';
import { createClient } from '@/utils/supabase/client';

export default function SuportePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Formulário
  const [categoria, setCategoria] = useState('');
  const [assunto, setAssunto] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [descricao, setDescricao] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [protocol, setProtocol] = useState('');

  // Filtros tabela
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // Modal
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    const res = await getSupportTickets();
    if (res.success && res.data) {
      setTickets(res.data);
      // Calcular stats
      let pending = 0;
      let answered = 0;
      res.data.forEach(t => {
        if (t.status === 'Aberto' || t.status === 'Em andamento') pending++;
        if (t.status === 'Respondido' || t.status === 'Fechado') answered++;
      });
      setStats({ total: res.data.length, pending, answered });
    }
    setLoadingTickets(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setArquivos(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]) => {
    const supabase = createClient();
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `company_support/${fileName}`;

      // Usando bucket resumes para evitar falhas caso o bucket support não exista (ideal é criar o support depois).
      const { data, error } = await supabase.storage
        .from('resumes') 
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        throw new Error('Falha no upload de um ou mais arquivos.');
      }

      const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria || !assunto.trim() || !descricao.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoadingSubmit(true);
    setError('');
    setSuccess(false);

    try {
      let uploadedUrls: string[] = [];
      if (arquivos.length > 0) {
        uploadedUrls = await uploadFiles(arquivos);
      }

      const result = await createSupportTicket(categoria, assunto, prioridade, descricao, uploadedUrls);
      
      if (result.success) {
        setSuccess(true);
        setProtocol(result.protocol || '');
        // Limpar form
        setCategoria('');
        setAssunto('');
        setPrioridade('Média');
        setDescricao('');
        setArquivos([]);
        
        // Recarregar histórico
        fetchTickets();
      } else {
        setError(result.error || 'Erro desconhecido.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado ao enviar sua mensagem.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Filtragem
  const filteredTickets = tickets.filter(t => {
    const matchesBusca = t.subject.toLowerCase().includes(busca.toLowerCase()) || t.protocol.toLowerCase().includes(busca.toLowerCase());
    const matchesStatus = filtroStatus === 'Todos' || t.status === filtroStatus;
    return matchesBusca && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <LifeBuoy size={32} className="text-blue-600" />
        <h1 className="text-3xl font-extrabold text-slate-900">Central de Suporte</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg">
            <Send size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enviados</h4>
            <h2 className="text-3xl font-extrabold text-slate-900">{stats.total}</h2>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <Clock size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pendentes</h4>
            <h2 className="text-3xl font-extrabold text-slate-900">{stats.pending}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
            <CheckCheck size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Respondidos</h4>
            <h2 className="text-3xl font-extrabold text-slate-900">{stats.answered}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full">
            <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <PlusCircle className="text-blue-600" size={20} /> Abrir Chamado
            </h4>
            <p className="text-sm text-slate-500 mb-6">Precisa de ajuda? Preencha os dados abaixo.</p>

            {error && (
              <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 mb-6 bg-emerald-50 text-emerald-700 rounded-xl flex items-start gap-3 border border-emerald-100 shadow-[0_4px_15px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={24} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Chamado criado com sucesso!</p>
                  <p className="text-sm mt-1">Protocolo: <strong>{protocol}</strong></p>
                  <p className="text-sm mt-1 opacity-90">Nossa equipe responderá em breve.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria} required>
                  <SelectTrigger className="bg-slate-50 border-2 border-slate-200 rounded-xl h-12 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cadastro">Cadastro de Vagas</SelectItem>
                    <SelectItem value="Candidatos">Busca de Candidatos</SelectItem>
                    <SelectItem value="Financeiro">Financeiro / Planos</SelectItem>
                    <SelectItem value="Erro">Erro no Sistema</SelectItem>
                    <SelectItem value="Sugestão">Sugestão de Melhoria</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assunto *</Label>
                <Input
                  placeholder="Resumo do problema"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  required
                  disabled={loadingSubmit}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Prioridade *</Label>
                <Select value={prioridade} onValueChange={setPrioridade} required>
                  <SelectTrigger className="bg-slate-50 border-2 border-slate-200 rounded-xl h-12 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Descrição *</Label>
                <Textarea
                  placeholder="O que aconteceu? Qual resultado era esperado? Existe alguma mensagem de erro?"
                  rows={5}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  disabled={loadingSubmit}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl focus-visible:ring-blue-500 resize-none"
                  maxLength={1000}
                />
                <div className="text-right text-xs text-slate-500 font-medium">{descricao.length}/1000</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Anexar Arquivos (Opcional)</Label>
                <div className="relative overflow-hidden w-full group">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    disabled={loadingSubmit}
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex items-center justify-center gap-2 w-full p-3 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-semibold group-hover:bg-slate-200 group-hover:border-slate-400 transition-colors">
                    <UploadCloud size={20} /> Selecionar Fotos/PDFs
                  </div>
                </div>
                
                {arquivos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {arquivos.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-100 p-2 rounded-lg text-sm">
                        <span className="truncate flex-1 font-medium text-slate-700 mr-2"><Paperclip size={14} className="inline mr-1" />{file.name}</span>
                        <button type="button" onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700 p-1">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loadingSubmit} 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                {loadingSubmit ? (
                  <><Loader2 size={20} className="mr-2 animate-spin" /> Enviando...</>
                ) : (
                  <><Send size={20} className="mr-2" /> Enviar Chamado</>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Histórico */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                <Clock className="text-blue-600" size={22} /> Histórico
              </h4>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Buscar assunto..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9 bg-slate-50 border-2 border-slate-200 rounded-xl"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[150px] bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Respondido">Respondido</SelectItem>
                    <SelectItem value="Fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loadingTickets ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-medium bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  Nenhum chamado encontrado.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Protocolo / Data</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Assunto</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(t => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-700">{t.protocol}</div>
                          <div className="text-xs text-slate-500 font-medium mt-1">
                            {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{t.subject}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500">{t.category}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              t.priority === 'Urgente' || t.priority === 'Alta' ? 'bg-red-100 text-red-600' :
                              t.priority === 'Média' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {t.priority}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                            t.status === 'Aberto' ? 'bg-blue-100 text-blue-700' :
                            t.status === 'Em andamento' ? 'bg-amber-100 text-amber-700' :
                            t.status === 'Respondido' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedTicket(t)}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye size={18} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="text-blue-600" size={24} /> {selectedTicket.protocol}
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</p>
                  <span className={`px-3 py-1 mt-1 rounded-full text-xs font-bold inline-block ${
                    selectedTicket.status === 'Aberto' ? 'bg-blue-100 text-blue-700' :
                    selectedTicket.status === 'Em andamento' ? 'bg-amber-100 text-amber-700' :
                    selectedTicket.status === 'Respondido' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Abertura</p>
                  <p className="font-semibold text-slate-800 mt-1">{new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
                <h4 className="font-extrabold text-slate-900 text-lg mb-3">{selectedTicket.subject}</h4>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Paperclip size={16} /> Anexos enviados:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.attachments.map((url: string, i: number) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <FileDown size={16} /> Anexo {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket.reply ? (
                <div className="mt-8 border-l-4 border-emerald-500 pl-5 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCheck size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">Resposta da Equipe Técnica (Atlas)</p>
                      <p className="text-xs text-slate-500 font-medium">Respondido em: {new Date(selectedTicket.repliedAt || selectedTicket.updatedAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl rounded-tl-none border border-emerald-100 whitespace-pre-wrap font-medium">
                    {selectedTicket.reply}
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <Clock size={32} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600 font-medium">Aguardando resposta da equipe de suporte.</p>
                </div>
              )}
            </div>
            
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setSelectedTicket(null)} variant="outline" className="rounded-xl border-slate-300 font-bold">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
