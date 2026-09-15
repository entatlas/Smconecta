'use client'

import React, { useState } from 'react'
import { Settings, Shield, Eye, Trash2, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { deleteUserAccount } from './actions'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [successMsg, setSuccessMsg] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleChangePassword = async () => {
    try {
      const email = (await supabase.auth.getUser()).data.user?.email
      if (!email) {
        alert('Email não encontrado no perfil.')
        return
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-senha`,
      })

      if (error) {
        alert(`Erro do Supabase: ${error.message}`)
        return
      }
      
      setSuccessMsg('Email de redefinição enviado! Verifique sua caixa de entrada.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      alert(`Erro inesperado: ${err.message}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleDeleteAccount = async () => {
    if (confirm('Tem certeza absoluta que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão apagados permanentemente.')) {
      setIsDeleting(true)
      try {
        const result = await deleteUserAccount()
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Sua conta foi excluída com sucesso.')
          await supabase.auth.signOut()
          window.location.href = '/login?deleted=true'
        }
      } catch (err) {
        toast.error('Erro ao excluir a conta.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', color: '#EAF2FF' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Settings size={24} color="#00D9FF" /> Configurações
      </h1>
      <p style={{ color: '#9BAFC8', marginBottom: '2rem' }}>Gerencie sua conta e privacidade.</p>

      {/* Segurança */}
      <div style={{ background: '#061A32', borderRadius: '12px', border: '1px solid rgba(0, 140, 255, 0.1)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#0878FF" /> Segurança
          </h2>
        </div>

        {successMsg && (
          <div style={{ margin: '1rem 1.5rem 0', padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '0.9rem', fontWeight: 500, animation: 'fadeIn 0.3s ease-out' }}>
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', margin: 0, fontSize: '0.9rem' }}>Alterar Senha</p>
              <p style={{ color: '#9BAFC8', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>Enviaremos um email de redefinição</p>
            </div>
            <button onClick={handleChangePassword}
              style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#EAF2FF', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Redefinir Senha
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', margin: 0, fontSize: '0.9rem' }}>Encerrar Sessão</p>
              <p style={{ color: '#9BAFC8', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>Sair de todos os dispositivos</p>
            </div>
            <button onClick={handleLogout}
              style={{ padding: '0.5rem 1rem', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#ef4444', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Sair
            </button>
          </div>
        </div>
      </div>



      {/* Zona de Perigo */}
      <div style={{ background: '#061A32', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={18} /> Zona de Perigo
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', margin: 0, fontSize: '0.9rem' }}>Solicitar Exclusão da Conta</p>
              <p style={{ color: '#9BAFC8', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
                Seus dados serão apagados. Esta ação é irreversível.
              </p>
            </div>
            <button onClick={handleDeleteAccount} disabled={isDeleting}
              style={{ padding: '0.5rem 1rem', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', background: 'transparent', cursor: isDeleting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#ef4444', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', opacity: isDeleting ? 0.6 : 1 }}
              onMouseEnter={e => { if(!isDeleting) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}}
              onMouseLeave={e => { if(!isDeleting) e.currentTarget.style.background = 'transparent'}}>
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isDeleting ? 'Excluindo...' : 'Solicitar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
