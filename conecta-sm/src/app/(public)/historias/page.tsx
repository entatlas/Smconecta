import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedStories } from './actions';
import { Play, FileAudio, FileText, Briefcase, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Histórias que Inspiram | Portal SM',
  description: 'Conheça histórias reais de transformação profissional.'
};

export default async function HistoriasInspiramPage() {
  const stories = await getPublishedStories();
  
  const featuredStory = stories.find(s => s.isFeatured);
  const otherStories = stories.filter(s => s.id !== featuredStory?.id);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Play size={16} />;
      case 'AUDIO': return <FileAudio size={16} />;
      case 'TEXT': return <FileText size={16} />;
      case 'SUCCESS_CASE': return <Briefcase size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'Vídeo';
      case 'AUDIO': return 'Áudio';
      case 'TEXT': return 'Texto';
      case 'SUCCESS_CASE': return 'Caso de Sucesso';
      default: return 'História';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Histórias que Inspiram
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Descubra trajetórias reais de profissionais que transformaram suas carreiras e alcançaram resultados extraordinários com a SM.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/historias/enviar" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Conte sua História
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        {stories.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
            <Briefcase className="mx-auto text-slate-600 mb-4" size={48} />
            <h2 className="text-2xl font-semibold mb-2">Ainda não temos histórias publicadas</h2>
            <p className="text-slate-400">Seja o primeiro a inspirar outras pessoas. Compartilhe sua trajetória conosco!</p>
          </div>
        ) : (
          <>
            {/* Featured Story */}
            {featuredStory && (
              <div className="mb-16">
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6">História em Destaque</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row group">
                  <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-800 relative">
                    {featuredStory.coverUrl ? (
                      <Image src={featuredStory.coverUrl} alt={featuredStory.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Briefcase size={64} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  </div>
                  <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-full mb-6 w-fit">
                      {getTypeIcon(featuredStory.type)}
                      {getTypeName(featuredStory.type)}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{featuredStory.name}</h3>
                    <p className="text-slate-400 text-lg mb-2">{featuredStory.profession} na {featuredStory.company}</p>
                    {featuredStory.courseName && <p className="text-blue-400 mb-6">{featuredStory.courseName}</p>}
                    
                    {featuredStory.content && (
                      <p className="text-slate-300 italic mb-8 border-l-2 border-slate-700 pl-4 line-clamp-3">
                        "{featuredStory.content}"
                      </p>
                    )}
                    
                    <Link href={`/historias/${featuredStory.id}`} className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors w-fit group-hover:gap-3">
                      Conhecer História <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of other stories */}
            {otherStories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Últimas Histórias</h2>
                  {/* Future: Add Filters Here */}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherStories.map(story => (
                    <Link href={`/historias/${story.id}`} key={story.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all hover:-translate-y-1 flex flex-col group">
                      <div className="h-48 bg-slate-800 relative">
                        {story.coverUrl ? (
                          <Image src={story.coverUrl} alt={story.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                             {getTypeIcon(story.type)}
                          </div>
                        )}
                        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-900/80 backdrop-blur text-slate-200 text-xs font-medium rounded-full">
                          {getTypeIcon(story.type)}
                          {getTypeName(story.type)}
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{story.name}</h3>
                        <p className="text-slate-400 text-sm mb-4 flex-1">{story.profession} na {story.company}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                          <span className="text-xs text-slate-500">{story.city}</span>
                          <span className="text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Ler mais <ArrowRight size={14} /></span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
