import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Building2, MapPin, Briefcase, Heart, Globe, Users, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Esta página deve ser estática ou revalidada para SEO
export const revalidate = 60 // revalida a cada 1 minuto

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const company = await prisma.company.findUnique({
    where: { id: p.id, status: 'ACTIVE' },
    select: { tradeName: true, companyName: true, description: true }
  })
  
  if (!company) return { title: 'Empresa não encontrada' }

  return {
    title: `${company.tradeName || company.companyName} | Vagas e Oportunidades`,
    description: company.description ? company.description.substring(0, 160) : `Confira as vagas abertas e saiba mais sobre ${company.tradeName || company.companyName}.`,
  }
}

export default async function EmpresaPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const company = await prisma.company.findUnique({
    where: { id: p.id, status: 'ACTIVE' },
    select: {
      id: true,
      tradeName: true,
      companyName: true,
      industry: true,
      companySize: true,
      city: true,
      state: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
      mission: true,
      vision: true,
      values: true,
      culture: true,
      workModel: true,
      benefits: true,
      linkedin: true,
      instagram: true,
      website: true,
      hiringProcess: true,
      isVerified: true,
      jobs: {
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          city: true,
          state: true,
          modality: true,
          createdAt: true
        }
      }
    }
  })

  if (!company) notFound()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* HEADER / CAPA */}
      <div className="relative h-64 md:h-80 w-full bg-slate-800">
        {company.coverUrl ? (
          <Image src={company.coverUrl} alt={`Capa ${company.tradeName}`} fill style={{ objectFit: 'cover' }} className="opacity-80" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900"></div>
        )}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 md:-mt-32">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-end relative">
          
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md overflow-hidden shrink-0">
            {company.logoUrl ? (
               <Image src={company.logoUrl} alt={`Logo ${company.tradeName}`} fill style={{ objectFit: 'contain' }} priority />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                  <Building2 size={48} />
               </div>
            )}
          </div>

          <div className="flex-1 space-y-2 pb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {company.tradeName || company.companyName}
              {company.isVerified && <CheckCircle2 size={24} className="text-blue-500" title="Empresa Verificada" />}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
              {company.industry && <span className="flex items-center gap-1"><Briefcase size={16}/> {company.industry}</span>}
              {(company.city || company.state) && <span className="flex items-center gap-1"><MapPin size={16}/> {company.city}{company.state ? ` - ${company.state}` : ''}</span>}
              {company.companySize && <span className="flex items-center gap-1"><Users size={16}/> Porte {company.companySize}</span>}
            </div>
          </div>

          <div className="flex gap-2 pb-2 shrink-0">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2"><Globe size={16}/> Site</Button>
              </a>
            )}
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Ver Vagas</Button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* COLUNA ESQUERDA (Sobre, Missão, Cultura) */}
          <div className="lg:col-span-2 space-y-8">
            
            {company.description && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   Sobre a Empresa
                </h2>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  {company.description}
                </div>
              </section>
            )}

            {(company.mission || company.vision || company.values) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.mission && (
                  <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 space-y-2">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-300">Missão</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{company.mission}</p>
                    </CardContent>
                  </Card>
                )}
                {company.vision && (
                  <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900">
                    <CardContent className="p-6 space-y-2">
                      <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">Visão</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{company.vision}</p>
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {(company.culture || company.benefits) && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <Heart className="text-rose-500" /> Cultura e Benefícios
                </h2>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                  {company.culture && (
                    <div>
                      <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Nosso Ambiente</h3>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-sm">{company.culture}</p>
                    </div>
                  )}
                  {company.benefits && (
                    <div>
                      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Benefícios Oferecidos</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.benefits.split(',').map((b, i) => (
                          <span key={i} className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                            {b.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* COLUNA DIREITA (Vagas, Redes) */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vagas Abertas</h2>
              {company.jobs && company.jobs.length > 0 ? (
                <div className="space-y-3">
                  {company.jobs.map(job => (
                    <Link key={job.id} href={`/vagas/${job.id}`}>
                      <Card className="hover:border-blue-500 transition-colors cursor-pointer group shadow-sm">
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline line-clamp-1">{job.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {(job.city || job.state) && <span className="flex items-center gap-1"><MapPin size={12}/> {job.city}/{job.state}</span>}
                            {job.modality && <span className="flex items-center gap-1"><Briefcase size={12}/> {job.modality}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full text-sm">Ver todas as {company.jobs.length} vagas</Button>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 text-center">
                  <Briefcase className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-sm text-slate-500">Nenhuma vaga pública no momento.</p>
                </div>
              )}
            </section>
            
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-4">
               <h3 className="font-bold text-slate-900 dark:text-white">Redes Sociais</h3>
               <div className="flex flex-col gap-3">
                  {company.linkedin && (
                    <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium">
                      LinkedIn
                    </a>
                  )}
                  {company.instagram && (
                    <a href={`https://instagram.com/${company.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline flex items-center gap-2 text-sm font-medium">
                      Instagram
                    </a>
                  )}
               </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
