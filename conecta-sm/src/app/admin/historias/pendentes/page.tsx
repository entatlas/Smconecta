'use client';

import React, { useEffect, useState } from 'react';
import { getPendingStories, approveStory, rejectStory, publishStory } from '../actions';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { toast } from 'sonner';
import { Check, X, Eye, Play, FileText, Briefcase, FileAudio } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PendingStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const data = await getPendingStories();
    setStories(data);
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'publish') => {
    const confirmMessage = action === 'approve' ? 'Aprovar esta história?' 
                         : action === 'publish' ? 'Publicar esta história agora?'
                         : 'Reprovar esta história?';
                         
    if (!confirm(confirmMessage)) return;

    let res;
    if (action === 'approve') res = await approveStory(id);
    else if (action === 'publish') res = await publishStory(id);
    else res = await rejectStory(id);

    if (res.success) {
      toast.success('Ação realizada com sucesso.');
      fetchStories();
    } else {
      toast.error(res.error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Play size={20} className="text-blue-400" />;
      case 'AUDIO': return <FileAudio size={20} className="text-purple-400" />;
      case 'TEXT': return <FileText size={20} className="text-emerald-400" />;
      case 'SUCCESS_CASE': return <Briefcase size={20} className="text-orange-400" />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fila de Moderação</h1>
          <p className="text-slate-400">Histórias que Inspiram enviadas por usuários</p>
        </div>
        <Link href="/admin/historias">
          <Button variant="outline">Voltar para Histórias</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400">Carregando...</div>
      ) : stories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Check size={48} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Fila limpa!</h2>
          <p className="text-slate-400">Não há histórias pendentes de aprovação no momento.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {stories.map(story => (
            <Card key={story.id} className="p-6 bg-slate-900 border-slate-800">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Capa */}
                {story.coverUrl ? (
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-slate-800 relative">
                    <Image src={story.coverUrl} alt="Capa" fill className="object-cover" />
                    <div className="absolute top-2 right-2 bg-slate-900/80 p-1 rounded">
                      {getTypeIcon(story.type)}
                    </div>
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-32 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                     {getTypeIcon(story.type)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{story.name}</h3>
                      <p className="text-slate-400 text-sm">{story.profession} na {story.company} • {story.city}</p>
                      {story.courseName && <span className="inline-block px-2 py-1 bg-slate-800 text-xs rounded mt-2">{story.courseName}</span>}
                    </div>
                    <div className="text-xs text-slate-500">
                      Enviado em {new Date(story.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="mt-4">
                    {story.content && (
                      <p className="text-slate-300 text-sm italic border-l-2 border-slate-700 pl-3">
                        "{story.content.substring(0, 150)}{story.content.length > 150 ? '...' : ''}"
                      </p>
                    )}
                    
                    {story.mediaUrl && (
                      <a href={story.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:underline text-sm">
                        <Eye size={16} /> Ver Arquivo de Mídia Original
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={() => handleAction(story.id, 'approve')}>
                    Aprovar
                  </Button>
                  <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 w-full" onClick={() => handleAction(story.id, 'publish')}>
                    Aprovar e Publicar
                  </Button>
                  <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 w-full" onClick={() => handleAction(story.id, 'reject')}>
                    Reprovar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
