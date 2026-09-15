'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { toast } from 'sonner';
import { getStoryById, updateStory } from '../../actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditarHistoriaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState<any>(null);

  useEffect(() => {
    fetchStory();
  }, [params.id]);

  const fetchStory = async () => {
    const data = await getStoryById(params.id);
    if (!data) {
      toast.error('História não encontrada');
      router.push('/admin/historias');
      return;
    }
    setStory(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const res = await updateStory(story.id, story);
    if (res.success) {
      toast.success('História atualizada com sucesso!');
      router.push('/admin/historias');
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-slate-400">Carregando...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/admin/historias" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">Editar História</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome" value={story.name || ''} onChange={e => setStory({...story, name: e.target.value})} required />
          <Input label="Cidade" value={story.city || ''} onChange={e => setStory({...story, city: e.target.value})} />
          <Input label="Curso SM" value={story.courseName || ''} onChange={e => setStory({...story, courseName: e.target.value})} />
          <Input label="Profissão" value={story.profession || ''} onChange={e => setStory({...story, profession: e.target.value})} />
          <Input label="Empresa" value={story.company || ''} onChange={e => setStory({...story, company: e.target.value})} />
        </div>

        {story.type !== 'SUCCESS_CASE' && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Conteúdo / Depoimento / Descrição</label>
            <textarea 
              value={story.content || ''} 
              onChange={e => setStory({...story, content: e.target.value})}
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100"
            />
          </div>
        )}

        {story.type === 'SUCCESS_CASE' && (
          <div className="space-y-4">
            <Input label="Antes" value={story.caseBefore || ''} onChange={e => setStory({...story, caseBefore: e.target.value})} />
            <Input label="A Formação" value={story.caseTraining || ''} onChange={e => setStory({...story, caseTraining: e.target.value})} />
            <Input label="A Experiência" value={story.caseExperience || ''} onChange={e => setStory({...story, caseExperience: e.target.value})} />
            <Input label="O Resultado" value={story.caseResult || ''} onChange={e => setStory({...story, caseResult: e.target.value})} />
            <Input label="Situação Atual" value={story.caseCurrent || ''} onChange={e => setStory({...story, caseCurrent: e.target.value})} />
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
