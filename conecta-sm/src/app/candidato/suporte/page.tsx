'use client';

import React, { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { sendSupportEmail } from './actions';

export default function CandidatoSuportePage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string, base64: string, type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let hasError = false;
    const newAttachments: Array<{ name: string, base64: string, type: string }> = [];

    let processed = 0;
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        hasError = true;
        setError('Cada arquivo deve ter no máximo 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        newAttachments.push({
          name: file.name,
          type: file.type,
          base64: base64String
        });
        processed++;
        
        if (processed === files.length && !hasError) {
          setAttachments(prev => [...prev, ...newAttachments]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await sendSupportEmail(subject, message, attachments);
      if (res.success) {
        setSuccess(true);
        setSubject('');
        setMessage('');
        setAttachments([]);
      } else {
        setError(res.error || 'Erro ao enviar e-mail.');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Suporte Atlas</h1>
        <p className="text-slate-600 text-lg">
          Envie sua dúvida, relato de bug ou solicitação diretamente para a equipe técnica da Atlas.
        </p>
      </div>

      <div className="bg-[#061A32] rounded-2xl shadow-lg border border-slate-700 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
          <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center">
            <Mail className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Novo Chamado</h2>
            <p className="text-slate-400 text-sm">Preencha os campos abaixo</p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-900/20 text-emerald-100 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3 border border-emerald-800/50">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <div>
              <h3 className="font-bold text-lg">Mensagem enviada com sucesso!</h3>
              <p className="text-emerald-600">A equipe da Atlas responderá em breve.</p>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg font-medium transition-colors"
            >
              Enviar nova mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Assunto
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Dúvida sobre o painel"
                className="w-full px-4 py-2.5 rounded-xl bg-[#031225] border border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Mensagem
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Descreva detalhadamente..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#031225] border border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Anexar Foto / Arquivo (Opcional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition-all"
              />
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-slate-300">Anexos prontos:</p>
                  <ul className="space-y-1">
                    {attachments.map((att, idx) => (
                      <li key={idx} className="text-sm text-blue-400 flex items-center justify-between bg-slate-800/50 px-3 py-2 rounded-lg">
                        <span className="truncate mr-2">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800/50 text-red-200 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar E-mail
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
