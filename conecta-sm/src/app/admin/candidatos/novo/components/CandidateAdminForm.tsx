'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Camera } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { PhoneInput, DateInput } from '@/components/ui/Input/MaskedInputs';
import { COMMON_ROLES } from '@/lib/constants/cargos';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { createCandidateAdmin } from '../actions';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import Image from 'next/image';

export function CandidateAdminForm() {
  const router = useRouter();
  
  // Basic Info
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [desiredRole, setDesiredRole] = useState('');
  const [professionalArea, setProfessionalArea] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  
  // Arrays
  const [education, setEducation] = useState([{ institution: '', course: '', level: '', status: '', startDate: '', endDate: '' }]);
  const [experiences, setExperiences] = useState([{ company: '', role: '', startDate: '', endDate: '', isCurrent: false, activities: '' }]);
  const [skills, setSkills] = useState([{ name: '', level: 'Básico' }]);
  const [languages, setLanguages] = useState([{ language: '', understanding: 'Básico', speaking: 'Básico', reading: 'Básico', writing: 'Básico' }]);
  const [courses, setCourses] = useState([{ name: '', institution: '', workload: '', endDate: '' }]);

  const { execute: handleSubmitAction, isLoading: loading, error } = useAsyncAction(
    async () => {
      const result = await createCandidateAdmin({
        nome, email, telefone, birthDate, city, state, desiredRole, professionalArea, headline, about, avatarUrl,
        education: education.filter(e => e.institution && e.course),
        experiences: experiences.filter(e => e.company && e.role),
        skills: skills.filter(e => e.name),
        languages: languages.filter(e => e.language),
        courses: courses.filter(e => e.name && e.institution)
      });
      if (!result.success) throw new Error(result.error || 'Erro ao criar candidato');
      return result;
    },
    {
      onSuccess: () => {
        router.push('/admin/candidatos');
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>Dados Pessoais & Perfil</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#061A32', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image src={avatarUrl} alt="Avatar" fill style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <span style={{ fontSize: '2rem', color: '#00D9FF' }}>{nome.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div>
            <label htmlFor="avatar-upload" style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} /> Enviar Foto
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
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Nome Completo *</label>
            <Input required value={nome} onChange={e => setNome(e.target.value)} placeholder="João Silva" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Email *</label>
            <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Telefone *</label>
            <PhoneInput required value={telefone} onValueChange={(unmasked) => setTelefone(unmasked)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Data de Nascimento *</label>
            <DateInput required value={birthDate} onValueChange={(unmasked) => setBirthDate(unmasked)} />
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
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Cargo Desejado</label>
            <AutocompleteInput 
              label=""
              value={desiredRole} 
              onChange={setDesiredRole} 
              options={COMMON_ROLES}
              placeholder="Ex: Engenheiro de Software"
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Área de Interesse</label>
            <AutocompleteInput 
              label=""
              value={professionalArea} 
              onChange={setProfessionalArea} 
              placeholder="Ex: Tecnologia, Vendas..." 
              options={[
                "Tecnologia da Informação",
                "Vendas e Comercial",
                "Administração",
                "Atendimento ao Cliente",
                "Marketing",
                "Recursos Humanos",
                "Financeiro",
                "Operações / Logística",
                "Saúde",
                "Educação",
                "Engenharia",
                "Design e Criatividade"
              ]}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Título Profissional (Headline)</label>
            <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Desenvolvedor Full Stack Sênior" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: '#8B9BB4' }}>Sobre</label>
            <textarea 
              value={about} onChange={e => setAbout(e.target.value)} 
              style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '12px' }}
              placeholder="Resumo profissional..."
            />
          </div>
        </div>
      </div>

      {/* Formação */}
      <div style={{ background: '#031225', border: '1px solid #11284A', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Formação Acadêmica</h2>
          <Button type="button" onClick={() => setEducation([...education, { institution: '', course: '', level: '', status: '', startDate: '', endDate: '' }])} variant="outline" size="sm" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>
        
        {education.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
            {idx > 0 && <button type="button" onClick={() => setEducation(education.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ paddingRight: idx > 0 ? '32px' : '0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Instituição</label>
                <Input value={item.institution} onChange={e => { const newArr = [...education]; newArr[idx].institution = e.target.value; setEducation(newArr); }} placeholder="USP" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Curso</label>
                <Input value={item.course} onChange={e => { const newArr = [...education]; newArr[idx].course = e.target.value; setEducation(newArr); }} placeholder="Engenharia de Computação" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Nível</label>
                <select value={item.level} onChange={e => { const newArr = [...education]; newArr[idx].level = e.target.value; setEducation(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="" style={{ color: 'black' }}>Selecione...</option>
                  <option value="Superior Completo" style={{ color: 'black' }}>Superior Completo</option>
                  <option value="Superior Incompleto" style={{ color: 'black' }}>Superior Incompleto</option>
                  <option value="Pós-graduação" style={{ color: 'black' }}>Pós-graduação</option>
                  <option value="Ensino Médio" style={{ color: 'black' }}>Ensino Médio</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Status</label>
                <select value={item.status} onChange={e => { const newArr = [...education]; newArr[idx].status = e.target.value; setEducation(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="" style={{ color: 'black' }}>Selecione...</option>
                  <option value="Concluído" style={{ color: 'black' }}>Concluído</option>
                  <option value="Cursando" style={{ color: 'black' }}>Cursando</option>
                  <option value="Trancado" style={{ color: 'black' }}>Trancado</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Data de Início</label>
                <Input type="month" value={item.startDate} onChange={e => { const newArr = [...education]; newArr[idx].startDate = e.target.value; setEducation(newArr); }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Data de Conclusão</label>
                <Input type="month" value={item.endDate} onChange={e => { const newArr = [...education]; newArr[idx].endDate = e.target.value; setEducation(newArr); }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Experiência */}
      <div style={{ background: '#031225', border: '1px solid #11284A', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Experiência Profissional</h2>
          <Button type="button" onClick={() => setExperiences([...experiences, { company: '', role: '', startDate: '', endDate: '', isCurrent: false, activities: '' }])} variant="outline" size="sm" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>
        
        {experiences.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
            {idx > 0 && <button type="button" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ paddingRight: idx > 0 ? '32px' : '0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Empresa</label>
                <Input value={item.company} onChange={e => { const newArr = [...experiences]; newArr[idx].company = e.target.value; setExperiences(newArr); }} placeholder="Tech Corp" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Cargo</label>
                <Input value={item.role} onChange={e => { const newArr = [...experiences]; newArr[idx].role = e.target.value; setExperiences(newArr); }} placeholder="Engenheiro Front-end" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Data de Início</label>
                <Input type="month" value={item.startDate} onChange={e => { const newArr = [...experiences]; newArr[idx].startDate = e.target.value; setExperiences(newArr); }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Data de Saída</label>
                <Input type="month" value={item.endDate} disabled={item.isCurrent} onChange={e => { const newArr = [...experiences]; newArr[idx].endDate = e.target.value; setExperiences(newArr); }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#8B9BB4', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.isCurrent} onChange={e => { const newArr = [...experiences]; newArr[idx].isCurrent = e.target.checked; if(e.target.checked) newArr[idx].endDate = ''; setExperiences(newArr); }} />
                  Trabalho atualmente neste cargo
                </label>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Atividades</label>
                <textarea 
                  value={item.activities} onChange={e => { const newArr = [...experiences]; newArr[idx].activities = e.target.value; setExperiences(newArr); }}
                  style={{ width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '12px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cursos */}
      <div style={{ background: '#031225', border: '1px solid #11284A', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Cursos Extracurriculares</h2>
          <Button type="button" onClick={() => setCourses([...courses, { name: '', institution: '', workload: '', endDate: '' }])} variant="outline" size="sm" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>
        
        {courses.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
            {idx > 0 && <button type="button" onClick={() => setCourses(courses.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ paddingRight: idx > 0 ? '32px' : '0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Nome do Curso</label>
                <Input value={item.name} onChange={e => { const newArr = [...courses]; newArr[idx].name = e.target.value; setCourses(newArr); }} placeholder="Lógica de Programação" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Instituição</label>
                <Input value={item.institution} onChange={e => { const newArr = [...courses]; newArr[idx].institution = e.target.value; setCourses(newArr); }} placeholder="Alura" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Carga Horária (h)</label>
                <Input type="number" value={item.workload} onChange={e => { const newArr = [...courses]; newArr[idx].workload = e.target.value; setCourses(newArr); }} placeholder="40" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Data de Conclusão</label>
                <Input type="month" value={item.endDate} onChange={e => { const newArr = [...courses]; newArr[idx].endDate = e.target.value; setCourses(newArr); }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Idiomas */}
      <div style={{ background: '#031225', border: '1px solid #11284A', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Idiomas</h2>
          <Button type="button" onClick={() => setLanguages([...languages, { language: '', understanding: 'Básico', speaking: 'Básico', reading: 'Básico', writing: 'Básico' }])} variant="outline" size="sm" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>
        
        {languages.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
            {idx > 0 && <button type="button" onClick={() => setLanguages(languages.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4" style={{ paddingRight: idx > 0 ? '32px' : '0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Idioma</label>
                <Input value={item.language} onChange={e => { const newArr = [...languages]; newArr[idx].language = e.target.value; setLanguages(newArr); }} placeholder="Inglês" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Compreensão</label>
                <select value={item.understanding} onChange={e => { const newArr = [...languages]; newArr[idx].understanding = e.target.value; setLanguages(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="Básico" style={{ color: 'black' }}>Básico</option>
                  <option value="Intermediário" style={{ color: 'black' }}>Intermediário</option>
                  <option value="Avançado" style={{ color: 'black' }}>Avançado</option>
                  <option value="Fluente" style={{ color: 'black' }}>Fluente</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Fala</label>
                <select value={item.speaking} onChange={e => { const newArr = [...languages]; newArr[idx].speaking = e.target.value; setLanguages(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="Básico" style={{ color: 'black' }}>Básico</option>
                  <option value="Intermediário" style={{ color: 'black' }}>Intermediário</option>
                  <option value="Avançado" style={{ color: 'black' }}>Avançado</option>
                  <option value="Fluente" style={{ color: 'black' }}>Fluente</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Leitura</label>
                <select value={item.reading} onChange={e => { const newArr = [...languages]; newArr[idx].reading = e.target.value; setLanguages(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="Básico" style={{ color: 'black' }}>Básico</option>
                  <option value="Intermediário" style={{ color: 'black' }}>Intermediário</option>
                  <option value="Avançado" style={{ color: 'black' }}>Avançado</option>
                  <option value="Fluente" style={{ color: 'black' }}>Fluente</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Escrita</label>
                <select value={item.writing} onChange={e => { const newArr = [...languages]; newArr[idx].writing = e.target.value; setLanguages(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="Básico" style={{ color: 'black' }}>Básico</option>
                  <option value="Intermediário" style={{ color: 'black' }}>Intermediário</option>
                  <option value="Avançado" style={{ color: 'black' }}>Avançado</option>
                  <option value="Fluente" style={{ color: 'black' }}>Fluente</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Habilidades */}
      <div style={{ background: '#031225', border: '1px solid #11284A', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #11284A', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Habilidades (Skills)</h2>
          <Button type="button" onClick={() => setSkills([...skills, { name: '', level: 'Básico' }])} variant="outline" size="sm" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>
        
        {skills.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
            {idx > 0 && <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ paddingRight: idx > 0 ? '32px' : '0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Habilidade</label>
                <Input value={item.name} onChange={e => { const newArr = [...skills]; newArr[idx].name = e.target.value; setSkills(newArr); }} placeholder="React.js, Gestão de Projetos, etc..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: '#8B9BB4' }}>Nível</label>
                <select value={item.level} onChange={e => { const newArr = [...skills]; newArr[idx].level = e.target.value; setSkills(newArr); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #11284A', borderRadius: '8px', color: 'white', padding: '10px' }}>
                  <option value="Básico" style={{ color: 'black' }}>Básico</option>
                  <option value="Intermediário" style={{ color: 'black' }}>Intermediário</option>
                  <option value="Avançado" style={{ color: 'black' }}>Avançado</option>
                  <option value="Especialista" style={{ color: 'black' }}>Especialista</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
        <Link href="/admin/candidatos">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" variant="primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} />
          {loading ? 'Salvando...' : 'Salvar Candidato'}
        </Button>
      </div>
    </form>
  );
}
