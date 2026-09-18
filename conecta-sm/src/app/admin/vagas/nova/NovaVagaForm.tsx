'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createVaga } from '../actions'

interface Company {
  id: string
  companyName: string
}

export function NovaVagaForm({ companies }: { companies: Company[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const result = await createVaga(data)
      if (result.success) {
        router.push('/admin/vagas')
        router.refresh()
      } else {
        setError('Ocorreu um erro ao criar a vaga.')
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#031225', padding: '32px', borderRadius: '16px', border: '1px solid #11284A' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link href="/admin/vagas" style={{ color: '#8B9BB4', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <ArrowLeft size={20} /> Voltar
        </Link>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#EAF2FF' }}>Cadastrar Nova Vaga</h2>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Título da Vaga *</label>
            <input required name="title" placeholder="Ex: Desenvolvedor Front-end" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Empresa *</label>
            <select required name="companyId" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }}>
              <option value="">Selecione uma empresa</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Área de Atuação *</label>
            <input required name="area" placeholder="Ex: Tecnologia" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Modalidade *</label>
            <select required name="modality" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }}>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Contratação *</label>
            <select required name="employmentType" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }}>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="Estágio">Estágio</option>
              <option value="Trainee">Trainee</option>
              <option value="Temporário">Temporário</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Horário / Jornada (opcional)</label>
            <input name="schedule" placeholder="Ex: Seg a Sex, 09h às 18h" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Número de Vagas</label>
            <input type="number" name="openings" defaultValue="1" min="1" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Estado (UF)</label>
            <input name="state" placeholder="Ex: SP" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Cidade</label>
            <input name="city" placeholder="Ex: São Paulo" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
        </div>

        {/* Row 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Salário Mínimo (R$)</label>
            <input type="number" step="0.01" name="salaryMin" placeholder="Ex: 3000.00" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Salário Máximo (R$)</label>
            <input type="number" step="0.01" name="salaryMax" placeholder="Ex: 5000.00" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Status Inicial</label>
            <select name="status" style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff' }}>
              <option value="PUBLISHED">Publicada</option>
              <option value="DRAFT">Rascunho</option>
              <option value="PAUSED">Pausada</option>
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#8B9BB4', fontSize: '0.875rem' }}>Descrição e Requisitos *</label>
          <textarea required name="description" rows={6} placeholder="Descreva as responsabilidades, requisitos e benefícios da vaga..." style={{ padding: '12px', borderRadius: '8px', background: '#0A1B35', border: '1px solid #11284A', color: '#fff', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 32px' }}>
            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Vaga</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
