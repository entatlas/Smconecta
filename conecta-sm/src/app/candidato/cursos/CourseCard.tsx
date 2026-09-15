'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CourseCard({ course }: { course: any }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card 
        onClick={() => setOpen(true)}
        className="bg-slate-900 border-slate-800 flex flex-col overflow-hidden hover:border-blue-500/50 transition-colors group cursor-pointer text-left relative"
      >
        <div className="h-48 bg-slate-800 relative overflow-hidden">
        {course.coverUrl ? (
          <Image 
            src={course.coverUrl} 
            alt={course.title} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
            <ImageIcon size={64} opacity={0.5} />
          </div>
        )}
        {course.price === 0 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded shadow-lg">
            GRATUITO
          </div>
        )}
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-xl mb-1 text-white line-clamp-2">{course.title}</h3>
        
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold">
          <span className={`px-2 py-1 rounded bg-slate-800 ${course.modality === 'Online' ? 'text-blue-400' : 'text-amber-400'}`}>
            {course.modality}
          </span>
          {course.eventTimeStart && (
            <span className="text-slate-400 bg-slate-800/50 px-2 py-1 rounded flex items-center gap-1">
              🕒 {course.eventTimeStart}
            </span>
          )}
          {course.modality !== 'Online' && course.address && (
            <span className="text-slate-400 truncate max-w-[200px]" title={course.address}>
              📍 <span className="font-medium text-slate-500">Onde:</span> {course.address}
            </span>
          )}
        </div>

            <p className="text-slate-400 text-sm line-clamp-3 mb-2 flex-1">{course.description}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-blue-400 text-sm font-semibold group-hover:text-blue-300 transition-colors">
                Ver detalhes
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (course.registrationLink) {
                    window.open(course.registrationLink, '_blank');
                  } else {
                    setOpen(true);
                  }
                }}
                className={`py-2 px-4 rounded-lg text-sm font-bold shadow-lg transition-all ${
                  course.registrationLink 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {course.registrationLink ? (course.price > 0 ? 'Comprar' : 'Acessar') : 'Em Breve'}
              </button>
            </div>
          </CardContent>
        </Card>

      <DialogContent className="bg-[#050B14] border border-blue-900/30 text-white max-w-2xl p-0 overflow-hidden shadow-[0_0_50px_rgba(8,120,255,0.15)] sm:rounded-2xl max-h-[90vh] flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* Banner Topo */}
            <div className="relative h-48 sm:h-60 w-full bg-slate-900 shrink-0">
              {course.coverUrl ? (
                <Image 
                  src={course.coverUrl} 
                  alt={course.title} 
                  fill
                  className="object-cover opacity-90 mix-blend-lighten" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ImageIcon size={48} opacity={0.3} />
                </div>
              )}
              {course.price === 0 && (
                <div className="absolute top-5 left-5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] tracking-widest uppercase z-10">
                  Gratuito
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent pointer-events-none" />
            </div>

            <div className="px-5 sm:px-8 pb-8 pt-0 relative z-10 -mt-8 sm:-mt-12">
              {/* Cabeçalho de Detalhes */}
              <div className="mb-6">
                <DialogTitle className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 mb-4 tracking-tight leading-tight">
                  {course.title}
                </DialogTitle>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${course.modality === 'Online' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'} backdrop-blur-md shadow-sm`}>
                    {course.modality}
                  </span>
                </div>
              </div>

              {/* Informações Extras (Agenda) */}
              {(course.eventTimeStart || course.startDate || (course.modality !== 'Online' && course.address)) && (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 sm:p-5 mb-4 backdrop-blur-sm">
                  <h4 className="text-slate-300 text-[10px] sm:text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                    Agenda
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Item de Horário */}
                    {(course.eventTimeStart || course.startDate) && (
                      <div className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-3 bg-slate-950/30 p-3 rounded-lg border border-slate-800/50 min-h-[60px]">
                        <div className="bg-slate-800 p-2 rounded-full text-amber-400 shrink-0">
                          🕒
                        </div>
                        <span className="leading-relaxed line-clamp-2">
                          {course.startDate && (
                            <span className="block text-slate-300 font-bold mb-0.5">
                              {new Date(course.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </span>
                          )}
                          {course.eventTimeStart && (
                            <span>{course.eventTimeStart}</span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Item de Localização */}
                    {course.modality !== 'Online' && course.address && (
                      <div className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-3 bg-slate-950/30 p-3 rounded-lg border border-slate-800/50 min-h-[60px]">
                        <div className="bg-slate-800 p-2 rounded-full text-rose-400 shrink-0">
                          📍
                        </div>
                        <span className="leading-relaxed line-clamp-2" title={course.address}>{course.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descrição */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 sm:p-5 mb-8 backdrop-blur-sm">
                <h4 className="text-slate-300 text-[10px] sm:text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Sobre o Curso
                </h4>
                <div className="text-slate-400 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {course.description}
                </div>
              </div>

              {/* Footer / CTA */}
              <div className="bg-gradient-to-br from-slate-800/80 to-[#0A1428] rounded-2xl p-5 sm:p-6 border border-slate-700/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 w-full sm:w-auto text-center sm:text-left">
                  <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 block">
                    Investimento
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline justify-center sm:justify-start gap-1">
                    {course.price > 0 ? (
                      <>
                        <span className="text-base sm:text-lg text-emerald-400">{course.currency === 'BRL' ? 'R$' : course.currency === 'USD' ? 'US$' : '€'}</span>
                        <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </>
                    ) : (
                      <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">Gratuito</span>
                    )}
                  </div>
                </div>
                
                <a 
                  href={course.registrationLink || '#'} 
                  target={course.registrationLink ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto relative z-10"
                >
                  <button 
                    className="w-full sm:w-auto sm:min-w-[220px] py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-black uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform hover:-translate-y-1"
                    disabled={!course.registrationLink}
                  >
                    {course.registrationLink ? 'Garantir Vaga' : 'Em Breve'}
                    {course.registrationLink && <ExternalLink size={16} className="ml-1 sm:h-[18px] sm:w-[18px]" />}
                  </button>
                </a>
              </div>
            </div>
          </div>
          </DialogContent>
    </Dialog>
  )
}
