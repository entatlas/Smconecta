import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, FileAudio, FileText, Briefcase, Calendar, MapPin, Building, GraduationCap, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card/Card';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const story = await prisma.inspiringStory.findUnique({ where: { id: params.id } });
  if (!story || story.status !== 'PUBLISHED') return { title: 'História não encontrada' };
  return {
    title: `${story.name} | Histórias que Inspiram`,
    description: `Conheça a história de ${story.name}, ${story.profession} na ${story.company}.`
  };
}

export default async function HistoriaDetalhesPage({ params }: { params: { id: string } }) {
  const story = await prisma.inspiringStory.findUnique({ where: { id: params.id } });

  if (!story || story.status !== 'PUBLISHED') {
    notFound();
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Play size={24} className="text-blue-400" />;
      case 'AUDIO': return <FileAudio size={24} className="text-purple-400" />;
      case 'TEXT': return <FileText size={24} className="text-emerald-400" />;
      case 'SUCCESS_CASE': return <Briefcase size={24} className="text-orange-400" />;
      default: return <FileText size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/historias" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Voltar para histórias
        </Link>

        {/* Hero Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-12">
          {story.coverUrl && (
            <div className="w-full h-64 md:h-96 relative bg-slate-800">
              <Image src={story.coverUrl} alt={story.name} fill style={{ objectFit: 'cover' }} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>
          )}
          
          <div className={`p-8 md:p-12 ${!story.coverUrl ? 'pt-12' : 'pt-0 -mt-24 relative z-10'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-200 rounded-full">
                {getTypeIcon(story.type)}
                <span className="font-medium text-sm">
                  {story.type === 'VIDEO' ? 'Vídeo Depoimento' : story.type === 'AUDIO' ? 'Áudio / Podcast' : story.type === 'TEXT' ? 'Depoimento Escrito' : 'Caso de Sucesso'}
                </span>
              </div>
              
              <button className="p-3 bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-300 rounded-full hover:bg-slate-700 hover:text-white transition-colors group">
                <Share2 size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{story.name}</h1>
            
            <div className="flex flex-wrap gap-6 text-slate-300">
              {story.profession && (
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-400" />
                  <span>{story.profession}</span>
                </div>
              )}
              {story.company && (
                <div className="flex items-center gap-2">
                  <Building size={18} className="text-purple-400" />
                  <span>{story.company}</span>
                </div>
              )}
              {story.city && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-400" />
                  <span>{story.city}</span>
                </div>
              )}
              {story.courseName && (
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-orange-400" />
                  <span>{story.courseName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-500" />
                <span>{new Date(story.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
          
          {story.type === 'VIDEO' && story.mediaUrl && (
            <div className="mb-12 rounded-xl overflow-hidden bg-black aspect-video border border-slate-800">
              <video src={story.mediaUrl} controls className="w-full h-full" poster={story.coverUrl || undefined}>
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          )}

          {story.type === 'AUDIO' && story.mediaUrl && (
            <div className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FileAudio size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Ouça a história completa</h3>
                  <p className="text-sm text-slate-400">Podcast / Áudio Depoimento</p>
                </div>
              </div>
              <audio src={story.mediaUrl} controls className="w-full">
                Seu navegador não suporta a tag de áudio.
              </audio>
            </div>
          )}

          {/* Text Content */}
          {story.content && (
            <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-300">
              {story.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Success Case Steps */}
          {story.type === 'SUCCESS_CASE' && (
            <div className="space-y-8 mt-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              
              {story.caseBefore && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 group-[.is-active]:text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    1
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-lg">O Ponto de Partida</h3>
                    </div>
                    <p className="text-slate-400">{story.caseBefore}</p>
                  </div>
                </div>
              )}

              {story.caseTraining && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 group-[.is-active]:text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    2
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-lg">A Formação na SM</h3>
                    </div>
                    <p className="text-slate-400">{story.caseTraining}</p>
                  </div>
                </div>
              )}

              {story.caseExperience && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 group-[.is-active]:text-purple-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    3
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-lg">A Experiência Prática</h3>
                    </div>
                    <p className="text-slate-400">{story.caseExperience}</p>
                  </div>
                </div>
              )}

              {story.caseResult && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 group-[.is-active]:text-orange-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    4
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-lg">Os Resultados</h3>
                    </div>
                    <p className="text-slate-400">{story.caseResult}</p>
                  </div>
                </div>
              )}

              {story.caseCurrent && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    5
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-emerald-400 text-lg">Onde Está Agora</h3>
                    </div>
                    <p className="text-slate-300">{story.caseCurrent}</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
