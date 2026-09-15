'use client';

import React, { useEffect, useState } from 'react';
import { getStories, toggleHighlight, deleteStory } from './actions';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { toast } from 'sonner';
import { Star, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function HistoriasAdminPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const data = await getStories();
    setStories(data);
    setLoading(false);
  };

  const handleToggleHighlight = async (id: string, current: boolean) => {
    const res = await toggleHighlight(id, !current);
    if (res.success) {
      toast.success(current ? 'Removido dos destaques' : 'Adicionado aos destaques');
      fetchStories();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta história permanentemente?')) return;
    const res = await deleteStory(id);
    if (res.success) {
      toast.success('Excluído com sucesso.');
      fetchStories();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Histórias Publicadas</h1>
          <p className="text-slate-400">Gerencie as histórias ativas no portal público</p>
        </div>
        <Link href="/admin/historias/pendentes">
          <Button>Ver Fila de Moderação</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400">Carregando...</div>
      ) : stories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          Nenhuma história publicada no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <Card key={story.id} className="p-6 bg-slate-900 border-slate-800 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${story.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {story.status}
                  </span>
                  {story.isFeatured && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400" /> Destaque
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleHighlight(story.id, story.isFeatured)} className={`p-1.5 rounded transition-colors ${story.isFeatured ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-slate-500 hover:text-yellow-400 hover:bg-slate-800'}`} title="Destacar">
                    <Star size={18} className={story.isFeatured ? 'fill-yellow-400' : ''} />
                  </button>
                  <Link href={`/admin/historias/${story.id}/editar`} className="p-1.5 text-blue-400 rounded hover:bg-blue-400/10" title="Editar">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => handleDelete(story.id)} className="p-1.5 text-red-400 rounded hover:bg-red-400/10" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{story.name}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-1">{story.type} • {story.profession}</p>

              <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
                Adicionado em {new Date(story.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
