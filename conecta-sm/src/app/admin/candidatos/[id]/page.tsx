import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { User, Mail, Phone, Calendar, MapPin, Briefcase, ChevronLeft, GraduationCap, Languages, Award, BookOpen, Star, FileText } from 'lucide-react';
import Link from 'next/link';
import { CandidateHistory } from './components/CandidateHistory';
import { IsSmStudentToggle } from './components/IsSmStudentToggle';
import { UserStatusToggle } from './components/UserStatusToggle';

export default async function CandidateProfileAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || id === 'undefined') {
    return notFound();
  }

  let candidate = await prisma.profile.findFirst({
    where: { id: id, tipo: 'CANDIDATE' },
    include: {
      candidateProfile: {
        include: {
          education: true,
          experiences: true,
          skills: true,
          languages: true,
          courses: true,
          certificates: true,
        }
      }
    }
  });

  if (!candidate) {
    return notFound();
  }

  // Auto-heal se não tiver candidateProfile
  if (!candidate.candidateProfile) {
    await prisma.candidate.create({
      data: {
        profileId: candidate.id
      }
    });
    
    // Recarrega o candidato
    candidate = await prisma.profile.findFirst({
      where: { id: id, tipo: 'CANDIDATE' },
      include: {
        candidateProfile: {
          include: {
            education: true,
            experiences: true,
            skills: true,
            languages: true,
            courses: true,
            certificates: true,
          }
        }
      }
    });
  }

  if (!candidate || !candidate.candidateProfile) {
    return notFound();
  }

  const c = candidate;
  const p: any = c.candidateProfile;

  const rawHistory = await prisma.professionalHistory.findMany({
    where: { candidateId: p.id },
    orderBy: { eventDate: 'desc' },
    include: {
      createdBy: {
        select: { nome: true, tipo: true }
      }
    }
  });

  const applicationEvent = rawHistory.find(h => h.title === 'Inscrição: Equipe Técnica Multidisciplinar SM');
  const history = rawHistory.filter(h => h.title !== 'Inscrição: Equipe Técnica Multidisciplinar SM');

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: '#EAF2FF' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/candidatos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00D9FF', textDecoration: 'none', fontWeight: 600 }}>
          <ChevronLeft size={18} /> Voltar para Banco de Talentos
        </Link>
      </div>

      <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header Banner */}
        <div style={{ height: '120px', background: 'linear-gradient(90deg, #11284A 0%, #061A32 100%)', position: 'relative', overflow: 'hidden' }}>
          <img src={p.cover_url || 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80'} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: '#031225', border: '4px solid #031225',
            marginTop: '-50px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00D9FF', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={c.nome || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={48} />
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold break-words">{c.nome}</h1>
                {p.isSmStudent && (
                  <span className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                    <GraduationCap size={14} /> Aluno SM
                  </span>
                )}
              </div>
              <h2 className="m-0 text-lg sm:text-xl text-[#00D9FF] font-medium break-words">{p?.headline || p?.desiredRole || 'Candidato em Busca de Oportunidades'}</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
              <IsSmStudentToggle candidateId={p.id} initialStatus={p.isSmStudent} profileId={id} />
              <UserStatusToggle profileId={id} initialStatus={c.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Contato & Info Básica */}
            <div className="bg-[#061A32] p-6 rounded-xl border border-[#11284A]">
              <h3 className="m-0 mb-4 text-lg text-white border-b border-[#11284A] pb-2">Contato e Localização</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start sm:items-center gap-3 text-[#8B9BB4] break-all">
                  <Mail size={18} color="#00D9FF" className="flex-shrink-0 mt-1 sm:mt-0" /> {c.email}
                </div>
                {c.telefone && (
                  <div className="flex items-center gap-3 text-[#8B9BB4]">
                    <Phone size={18} color="#00D9FF" className="flex-shrink-0" /> {c.telefone}
                  </div>
                )}
                {p?.city && p?.state && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B9BB4' }}>
                    <MapPin size={18} color="#00D9FF" /> {p.city} - {p.state}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B9BB4' }}>
                  <Calendar size={18} color="#00D9FF" /> Registrado em {c.created_at.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Resumo Profissional */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>Sobre o Candidato</h3>
              <p style={{ color: '#8B9BB4', lineHeight: 1.6, margin: 0 }}>
                {p?.about || 'Nenhum resumo profissional fornecido.'}
              </p>
            </div>
          </div>

          {applicationEvent && (
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A', marginTop: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#00D9FF" /> Inscrição: Equipe Técnica Multidisciplinar SM
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {applicationEvent.description?.split('\n').filter(Boolean).map((line, i) => {
                  const match = line.match(/\*\*(.*?)\*\*(.*)/);
                  if (match) {
                    return (
                      <div key={i} style={{ background: '#031225', padding: '16px', borderRadius: '8px', border: '1px solid #11284A', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#00D9FF', fontWeight: 600 }}>{match[1].replace(':', '')}</div>
                        <div style={{ color: '#EAF2FF', fontSize: '0.95rem' }}>{match[2].trim() || 'N/A'}</div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            {/* Experiências */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="#00D9FF" /> Experiência Profissional
              </h3>
              {p.experiences && p.experiences.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {p.experiences.map((exp: any) => (
                    <div key={exp.id}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontWeight: 600 }}>{exp.role}</h4>
                      <div style={{ color: '#00D9FF', fontSize: '0.9rem', marginBottom: '4px' }}>{exp.company}</div>
                      <div style={{ color: '#8B9BB4', fontSize: '0.8rem', marginBottom: '8px' }}>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''} 
                        {' - '} 
                        {exp.isCurrent ? 'O momento' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '')}
                      </div>
                      <p style={{ margin: 0, color: '#8B9BB4', fontSize: '0.9rem' }}>{exp.activities}</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#8B9BB4', fontSize: '0.9rem' }}>Nenhuma experiência cadastrada.</p>}
            </div>

            {/* Formação Acadêmica */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} color="#00D9FF" /> Formação Acadêmica
              </h3>
              {p.education && p.education.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {p.education.map((edu: any) => (
                    <div key={edu.id}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontWeight: 600 }}>{edu.course}</h4>
                      <div style={{ color: '#00D9FF', fontSize: '0.9rem', marginBottom: '4px' }}>{edu.institution} ({edu.level})</div>
                      <div style={{ color: '#8B9BB4', fontSize: '0.8rem', marginBottom: '8px' }}>
                        {edu.startDate ? new Date(edu.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''}
                        {' - '}
                        {edu.status === 'CURSANDO' ? 'O momento' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#8B9BB4', fontSize: '0.9rem' }}>Nenhuma formação cadastrada.</p>}
            </div>

            {/* Habilidades e Idiomas */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} color="#00D9FF" /> Habilidades
              </h3>
              {p.skills && p.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {p.skills.map((skill: any) => (
                    <span key={skill.id} style={{ background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem' }}>
                      {skill.name} {skill.level ? `(${skill.level})` : ''}
                    </span>
                  ))}
                </div>
              ) : <p style={{ color: '#8B9BB4', fontSize: '0.9rem', marginBottom: '24px' }}>Nenhuma habilidade cadastrada.</p>}

              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Languages size={18} color="#00D9FF" /> Idiomas
              </h3>
              {p.languages && p.languages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.languages.map((lang: any) => (
                    <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#8B9BB4', fontSize: '0.9rem' }}>
                      <strong style={{ color: '#fff' }}>{lang.language}</strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>{lang.understanding || lang.speaking || 'Básico'}</span>
                        {lang.certificateUrl && (
                          <a href={`/api/certificates/language/${lang.id}`} style={{ color: '#00D9FF', textDecoration: 'none', fontSize: '0.8rem', background: 'rgba(0, 217, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            Certificado
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#8B9BB4', fontSize: '0.9rem' }}>Nenhum idioma cadastrado.</p>}
            </div>

            {/* Cursos e Certificações */}
            <div style={{ background: '#061A32', padding: '24px', borderRadius: '12px', border: '1px solid #11284A' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #11284A', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#00D9FF" /> Cursos Extras
              </h3>
              {p.courses && p.courses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {p.courses.map((course: any) => (
                    <div key={course.id}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '0.95rem' }}>{course.name}</h4>
                      <div style={{ color: '#8B9BB4', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {course.institution} {course.workload ? `• ${course.workload}h` : ''}
                        {course.certificateUrl && (
                          <a href={`/api/certificates/course/${course.id}`} style={{ color: '#00D9FF', textDecoration: 'none', fontSize: '0.8rem', background: 'rgba(0, 217, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            Certificado Anexo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#8B9BB4', fontSize: '0.9rem', marginBottom: '24px' }}>Nenhum curso cadastrado.</p>}


            </div>
          </div>

          <CandidateHistory 
            candidateId={p.id} 
            historyEvents={history.map(h => ({
              ...h,
              eventDate: h.eventDate.toISOString() as any, // Cast as any because the client component expects a Date, we will update the client component too
            }))} 
            profileId={id} 
          />

        </div>
      </div>
    </div>
  );
}
