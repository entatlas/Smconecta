'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message || 'Erro ao redefinir a senha.');
      } else {
        setSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900/40 text-blue-400 rounded-xl">
          <Lock size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Redefinir Minha Senha</h3>
          <p className="text-sm text-slate-400">Altere a senha de acesso da sua conta.</p>
        </div>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nova Senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Mínimo de 6 caracteres"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Repita a nova senha"
            required
          />
        </div>

        {error && <div className="text-red-400 text-sm font-medium bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}
        
        {success && (
          <div className="text-emerald-400 text-sm font-medium bg-emerald-900/20 p-3 rounded-lg border border-emerald-900/50 flex items-center gap-2">
            <CheckCircle size={16} /> Senha alterada com sucesso!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Atualizar Senha'}
        </button>
      </form>
    </div>
  );
}
