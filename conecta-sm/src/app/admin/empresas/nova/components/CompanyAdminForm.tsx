'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Camera } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { PhoneInput } from '@/components/ui/Input/MaskedInputs';
import { createCompanyAdmin } from '../actions';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import Image from 'next/image';

export function CompanyAdminForm() {
  const router = useRouter();
  
  // Basic Info
  const [avatarUrl, setAvatarUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [about, setAbout] = useState('');

  const { execute: handleSubmitAction, isLoading: loading, error } = useAsyncAction(
    async () => {
      const result = await createCompanyAdmin({
        companyName, tradeName, email, telefone, cnpj, city, state, website, industry, companySize, about, avatarUrl,
      });
      if (!result.success) throw new Error(result.error || 'Erro ao criar empresa');
      return result;
    },
    {
      onSuccess: () => {
        router.push('/admin/empresas');
        router.refresh();
      }
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleSubmitAction(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" style={{ color: '#EAF2FF' }}>
      {error && <div style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid #dc2626', padding: '16px', borderRadius: '8px', color: '#fca5a5' }}>{error}</div>}
      
      <div style={{ background: '#031225', border: '1px solid #11284A', padding: '24px', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>Dados da Empresa</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#061A32', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image src={avatarUrl} alt="Logo" fill style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <span style={{ fontSize: '2rem', color: '#00D9FF' }}>{companyName.charAt(0).toUpperCase() || 'E'}</span>
            )}
          </div>
          <div>
            <label htmlFor="avatar-upload" style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} /> Enviar Logo
              </span>
            </label>
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                alert("A foto deve ter no máximo 5MB.");
                return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 250;
                  const scaleSize = MAX_WIDTH / img.width;
                  canvas.width = MAX_WIDTH;
                  canvas.height = img.height * scaleSize;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                  setAvatarUrl(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = event.target?.result as string;
              };
              reader.readAsDataURL(file);
            }} />
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#8B9BB4' }}>Tamanho recomendado: 250x250, JPG/PNG até 5MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Razão Social *</label>
            <Input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Empresa XYZ LTDA" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Nome Fantasia</label>
            <Input value={tradeName} onChange={e => setTradeName(e.target.value)} placeholder="XYZ" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Email Corporativo *</label>
            <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Telefone *</label>
            <PhoneInput required value={telefone} onValueChange={(unmasked) => setTelefone(unmasked)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>CNPJ</label>
            <Input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Website</label>
            <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.empresa.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Setor/Indústria</label>
            <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Tecnologia, Saúde, Varejo..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Tamanho da Empresa</label>
            <select value={companySize} onChange={e => setCompanySize(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
              <option value="" style={{ color: 'black' }}>Selecione...</option>
              <option value="1-10" style={{ color: 'black' }}>1-10 funcionários</option>
              <option value="11-50" style={{ color: 'black' }}>11-50 funcionários</option>
              <option value="51-200" style={{ color: 'black' }}>51-200 funcionários</option>
              <option value="201-500" style={{ color: 'black' }}>201-500 funcionários</option>
              <option value="500+" style={{ color: 'black' }}>Mais de 500 funcionários</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Cidade</label>
            <Input value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Estado (UF)</label>
            <Input value={state} onChange={e => setState(e.target.value)} placeholder="SP" maxLength={2} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Sobre a Empresa</label>
            <textarea 
              value={about} onChange={e => setAbout(e.target.value)} 
              style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '12px' }}
              placeholder="Descreva a empresa..."
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
        <Link href="/admin/empresas">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" variant="primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} />
          {loading ? 'Salvando...' : 'Salvar Empresa'}
        </Button>
      </div>
    </form>
  );
}
