import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Building2, Mail, Phone, Calendar, MapPin, Briefcase, ChevronLeft, Globe, ShieldAlert, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function EmpresaProfileAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let empresa = await prisma.profile.findFirst({
    where: { id: id, tipo: 'COMPANY' },
    include: {
      companyProfile: true
    }
  });

  if (!empresa) {
    return notFound();
  }

  // Auto-heal se não tiver companyProfile
  if (!empresa.companyProfile) {
    await prisma.company.create({
      data: {
        profileId: empresa.id,
        cnpj: `PENDENTE-${empresa.id}`,
        tradeName: empresa.nome,
        companyName: empresa.nome
      }
    });
    
    // Recarrega
    empresa = await prisma.profile.findFirst({
      where: { id: id, tipo: 'COMPANY' },
      include: {
        companyProfile: true
      }
    });
  }

  if (!empresa || !empresa.companyProfile) {
    return notFound();
  }

  const e = empresa;
  const p: any = e.companyProfile;

  // Fetch Jobs published by this company
  const vagas = await prisma.job.findMany({
    where: { companyId: p.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/empresas" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00D9FF', textDecoration: 'none', fontWeight: 600 }}>
          <ChevronLeft size={18} /> Voltar para Empresas B2B
        </Link>
      </div>

      <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header Banner */}
        <div style={{ height: '120px', background: 'linear-gradient(90deg, #11284A 0%, #061A32 100%)', position: 'relative' }}>
        </div>
        
        <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
          {/* Avatar / Logo */}
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '16px', background: '#031225', border: '4px solid #031225',
            marginTop: '-50px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00D9FF', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            {p.logoUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image src={p.logoUrl} alt={p.tradeName} fill style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <Building2 size={48} />
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold break-words">{p.companyName}</h1>
                <div className="flex flex-wrap gap-2">
                  {e.status === 'ACTIVE' && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14} /> Ativa</span>}
                  {e.status === 'BLOCKED' && <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><ShieldAlert size={14} /> Bloqueada</span>}
                </div>
              </div>
              <h2 className="m-0 text-lg sm:text-xl text-[#00D9FF] font-medium break-words">{p.tradeName}</h2>
            </div>
            <div className="flex gap-3 items-center">
              {/* Action buttons could go here (e.g. Block/Edit) */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Contato & Info Básica */}
            <div className="bg-[#061A32] p-6 rounded-xl border border-[#11284A]">
              <h3 className="m-0 mb-4 text-lg text-white border-b border-[#11284A] pb-2">Contato e Localização</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start sm:items-center gap-3 text-[#8B9BB4] break-all">
                  <Mail size={18} color="#00D9FF" className="flex-shrink-0 mt-1 sm:mt-0" /> {p.contactEmail || e.email}
                </div>
                {(p.contactPhone || e.telefone) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B9BB4' }}>
                    <Phone size={18} color="#00D9FF" /> {p.contactPhone || e.telefone}
                  </div>
                )}
                {p.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B9BB4' }}>
                    <Globe size={18} color="#00D9FF" /> <a href={p.website} target="_blank" rel="noreferrer" style={{ color: '#8B9BB4', textDecoration: 'underline' }}>{p.website}</a>
                  </div>
                )}
                {p.city && p.state && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B9BB4' }}>
                    <MapPin size={18} color="#00D9FF" /> {p.city} - {p.state}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B9BB4' }}>
                  <Calendar size={18} color="#00D9FF" /> Cliente desde {e.created_at.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Sobre a Empresa */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>Sobre a Empresa</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#8B9BB4', display: 'block' }}>CNPJ</span>
                  <span style={{ color: '#EAF2FF' }}>{p.cnpj.startsWith('PENDENTE') ? 'Não informado' : p.cnpj}</span>
                </div>
                {p.industry && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#8B9BB4', display: 'block' }}>Setor</span>
                    <span style={{ color: '#EAF2FF' }}>{p.industry}</span>
                  </div>
                )}
                {p.companySize && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#8B9BB4', display: 'block' }}>Porte</span>
                    <span style={{ color: '#EAF2FF' }}>{p.companySize}</span>
                  </div>
                )}
                {p.foundationYear && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#8B9BB4', display: 'block' }}>Fundação</span>
                    <span style={{ color: '#EAF2FF' }}>{p.foundationYear}</span>
                  </div>
                )}
              </div>

              {p.description && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid #11284A' }}>
                  <span style={{ fontSize: '0.8rem', color: '#8B9BB4', display: 'block', marginBottom: '8px' }}>Descrição</span>
                  <p style={{ color: '#EAF2FF', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>
                    {p.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '24px' }}>
            {/* Vagas Publicadas */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="#00D9FF" /> Vagas Publicadas ({vagas.length})
              </h3>
              
              {vagas.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {vagas.map((vaga) => (
                    <div key={vaga.id} style={{ background: '#031225', padding: '16px', borderRadius: '8px', border: '1px solid #11284A' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{vaga.title}</h4>
                        <span style={{ 
                          fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px',
                          background: vaga.status === 'PUBLISHED' ? '#10b98120' : '#8B9BB420',
                          color: vaga.status === 'PUBLISHED' ? '#10b981' : '#8B9BB4'
                        }}>
                          {vaga.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#8B9BB4', marginBottom: '12px' }}>
                        <span>{vaga.modality}</span>
                        <span>•</span>
                        <span>{vaga.employmentType}</span>
                      </div>
                      <Link href={`/admin/vagas/${vaga.id}`} style={{ color: '#00D9FF', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Ver vaga &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Briefcase size={32} color="#11284A" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#8B9BB4', fontSize: '0.9rem', margin: 0 }}>Nenhuma vaga publicada até o momento.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
