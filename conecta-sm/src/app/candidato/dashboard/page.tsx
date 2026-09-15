'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Briefcase, FileText, GraduationCap, ArrowRight, Search, CheckCircle, Play, Sparkles, Lock } from 'lucide-react'
import { getCandidateDashboard } from '../actions'
import { Button } from '@/components/ui/button'
import { AIAssistantWidget } from '@/components/chat/AIAssistantWidget'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SENT: { label: 'Enviada', color: 'text-slate-400', bg: 'bg-slate-400/10' },
  IN_REVIEW: { label: 'Em Análise', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  REVIEWING: { label: 'Em Análise', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  SHORTLISTED: { label: 'Pré-selecionado', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  INTERVIEW: { label: 'Entrevista', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  APPROVED: { label: 'Aprovado', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  HIRED: { label: 'Contratado', color: 'text-green-600', bg: 'bg-green-600/10' },
  REJECTED: { label: 'Finalizada', color: 'text-red-500', bg: 'bg-red-500/10' },
  WITHDRAWN: { label: 'Retirada', color: 'text-slate-500', bg: 'bg-slate-500/10' },
}

export default function CandidatoDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCandidateDashboard()
      .then(res => { setData(res); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-800/50 backdrop-blur-sm rounded-2xl animate-pulse border border-slate-700/50" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Candidaturas', value: data?.applicationsCount ?? 0, icon: FileText, gradient: 'from-blue-500 to-indigo-500', href: '/candidato/candidaturas' },
    { label: 'Vagas Salvas', value: data?.savedJobsCount ?? 0, icon: Briefcase, gradient: 'from-cyan-400 to-blue-500', href: '/candidato/vagas-salvas' },
    { label: 'Cursos em andamento', value: data?.ongoingCourses ?? 0, icon: GraduationCap, gradient: 'from-emerald-400 to-green-600', href: '/candidato/cursos' },
    { label: 'Certificados', value: data?.certificatesCount ?? 0, icon: CheckCircle, gradient: 'from-amber-400 to-orange-500', href: '/candidato/certificados' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-[#020817] p-4 md:p-8 text-slate-200">
      {data?.subscriptionStatus === 'ACTIVE' && <AIAssistantWidget />}
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            Olá{data?.userName ? `, ${data.userName.split(' ')[0]}` : ''}! <span className="animate-bounce origin-bottom">👋</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Acompanhe suas oportunidades e seu desenvolvimento profissional.
          </p>
        </motion.div>

        {/* Métricas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card, idx) => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href}>
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-colors group h-full shadow-lg"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} bg-opacity-10 shadow-inner`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="text-4xl font-black text-white mb-1 tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                    {card.label}
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Continue de onde parou */}
          <motion.div variants={itemVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none" />
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Continue de onde parou
            </h2>
            
            <div className="flex flex-col gap-4">
              {[
                { href: '/candidato/vagas', label: 'Encontrar Vagas', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-400/10', hover: 'hover:border-cyan-500/50' },
                { href: '/candidato/cursos', label: 'Continuar curso', icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-400/10', hover: 'hover:border-emerald-500/50' },
                { href: '/candidato/candidaturas', label: 'Ver candidaturas', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10', hover: 'hover:border-blue-500/50' },
              ].map(action => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border border-slate-800/50 bg-slate-800/30 backdrop-blur-sm transition-all ${action.hover} group`}
                    >
                      <div className={`p-3 rounded-xl ${action.bg}`}>
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-white transition-colors" />
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          {/* Últimas Candidaturas */}
          <motion.div variants={itemVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Últimas Candidaturas
              </h2>
              <Link href="/candidato/candidaturas" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative z-10">
              {data?.recentApplications?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="mb-4">Nenhuma candidatura ainda.</p>
                  <Link href="/candidato/vagas" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0 shadow">
                    Encontrar vagas
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {data?.recentApplications?.map((app: any) => {
                    const statusInfo = STATUS_LABELS[app.status] || { label: app.status, color: 'text-slate-400', bg: 'bg-slate-400/10' }
                    return (
                      <li key={app.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/30 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                        <div>
                          <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-[250px]">{app.jobTitle}</p>
                          <p className="text-sm text-slate-400 mt-1">{app.company}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </div>

        {/* RECURSOS EXCLUSIVOS */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-white">
              Recursos Exclusivos
            </h2>
            {data?.subscriptionStatus === 'ACTIVE' && (
              <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 text-emerald-400 border border-emerald-500/30 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                PREMIUM ATIVADO
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Revisão de Currículo',
                desc: 'Receba feedback especializado para destacar seu currículo.',
                action: 'Solicitar Revisão',
                gradient: 'from-purple-600/20 to-fuchsia-600/20',
                borderHover: 'hover:border-purple-500/50',
              },
              {
                title: 'Simulação de Entrevista',
                desc: 'Pratique com nossos especialistas e perca o nervosismo.',
                action: 'Agendar Simulação',
                gradient: 'from-blue-600/20 to-cyan-600/20',
                borderHover: 'hover:border-cyan-500/50',
              },
              {
                title: 'Trilhas Exclusivas',
                desc: 'Conteúdos e materiais restritos para assinantes.',
                action: 'Acessar Conteúdos',
                gradient: 'from-emerald-600/20 to-teal-600/20',
                borderHover: 'hover:border-emerald-500/50',
              }
            ].map((resource, i) => (
              <div 
                key={i} 
                className={`relative overflow-hidden rounded-3xl p-6 bg-slate-900/60 backdrop-blur-xl border ${data?.subscriptionStatus === 'ACTIVE' ? 'border-slate-700/50 ' + resource.borderHover : 'border-slate-800'} transition-all group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${resource.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {data?.subscriptionStatus !== 'ACTIVE' && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center shadow-2xl">
                      <Lock className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-white text-sm font-bold mb-3">Recurso Premium</p>
                      <Link href="/planos" className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Conhecer Premium
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                  <p className="text-sm text-slate-400 mb-6">{resource.desc}</p>
                  <Button 
                    disabled={data?.subscriptionStatus !== 'ACTIVE'} 
                    variant="outline" 
                    className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 hover:text-white"
                  >
                    {resource.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

