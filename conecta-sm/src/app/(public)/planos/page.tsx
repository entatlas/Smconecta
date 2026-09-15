'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Star, Briefcase, FileText, Award, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PlanosPage() {
  const [activeTab, setActiveTab] = useState('candidatos');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center border-b border-slate-800">
        <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1">
          Modelo Comercial
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Planos e Serviços <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Conecta SM</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-400">
          Escolha o melhor plano para o seu momento profissional. Invista no seu futuro ou impulsione o recrutamento da sua empresa.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <Tabs defaultValue="candidatos" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-900 border border-slate-800 p-1">
              <TabsTrigger value="candidatos" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Para Candidatos</TabsTrigger>
              <TabsTrigger value="empresas" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Para Empresas</TabsTrigger>
            </TabsList>
          </div>

          {/* CANDIDATOS TAB */}
          <TabsContent value="candidatos" className="space-y-16 mt-0">
            {/* PLANOS */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* PLANO GRATUITO */}
              <Card className="bg-slate-900 border-slate-800 flex flex-col relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Gratuito</CardTitle>
                  <CardDescription className="text-slate-400">Tudo que você precisa para começar.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-white">R$ 0</span>
                    <span className="text-slate-400">/mês</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-slate-300">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Currículo na plataforma
                    </li>
                    <li className="flex items-center text-slate-300">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Gerenciamento de certificados
                    </li>
                    <li className="flex items-center text-slate-300">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Inclusão no Banco de Talentos
                    </li>
                    <li className="flex items-center text-slate-300">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Visualização de vagas
                    </li>
                    <li className="flex items-center text-slate-300">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Candidatura a vagas
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 w-full border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors bg-background">
                    Começar gratuitamente
                  </Link>
                </CardFooter>
              </Card>

              {/* PLANO PREMIUM */}
              <Card className="bg-gradient-to-b from-slate-900 to-slate-900 border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  RECOMENDADO
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-400 flex items-center">
                    Premium <Star className="h-5 w-5 ml-2 fill-emerald-400" />
                  </CardTitle>
                  <CardDescription className="text-slate-400">Acelere sua carreira ao máximo.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-white">Consulte</span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Tudo do gratuito, mais:</div>
                  <ul className="space-y-3">
                    <li className="flex items-start text-slate-200">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> 
                      <span><strong>Destaque do perfil</strong> (apareça primeiro para os recrutadores)</span>
                    </li>
                    <li className="flex items-center text-slate-200">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Alertas antecipados de vagas
                    </li>
                    <li className="flex items-center text-slate-200">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Conteúdos exclusivos
                    </li>
                    <li className="flex items-center text-slate-200">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Simulações de entrevista
                    </li>
                    <li className="flex items-center text-slate-200">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Revisão de currículo
                    </li>
                    <li className="flex items-center text-slate-200">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" /> Área de Desenvolvimento Profissional
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/register?plan=premium" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 transition-colors">
                    Conhecer Premium
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* SERVIÇOS AVULSOS */}
            <div className="mt-20">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">Serviços Avulsos</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Precisa de um apoio pontual? Nossos especialistas estão prontos para ajudar você a conquistar sua próxima oportunidade, independentemente do seu plano.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Revisão de Currículo', icon: FileText, desc: 'Análise completa e reestruturação do seu CV focada em conversão.' },
                  { title: 'Preparação para Entrevistas', icon: Calendar, desc: 'Treinamento 1-a-1 focado em oratória, linguagem corporal e respostas.' },
                  { title: 'Consultoria de Carreira', icon: Briefcase, desc: 'Sessão estratégica para mapear seus próximos passos profissionais.' },
                  { title: 'Orientação Especializada', icon: Award, desc: 'Mentoria personalizada para transição de área ou primeiro emprego.' },
                ].map((serv, i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                        <serv.icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <CardTitle className="text-lg text-slate-200">{serv.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-slate-400">{serv.desc}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full justify-between text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                        Consulte condições <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* EMPRESAS TAB */}
          <TabsContent value="empresas" className="mt-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto mt-8 relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <Briefcase className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Soluções Corporativas</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                Atraia, selecione e contrate os melhores talentos com a tecnologia e o banco de currículos do Conecta SM.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 text-left mb-10">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">Planos Corporativos</h3>
                  <p className="text-slate-400 text-sm">Assinaturas sob medida para o volume de vagas da sua empresa. Acesso ilimitado à busca de candidatos e ferramentas de triagem.</p>
                </div>
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">Recrutamento Personalizado</h3>
                  <p className="text-slate-400 text-sm">Deixe o processo seletivo com nossos especialistas. Desde a divulgação até as entrevistas finais, entregamos os talentos prontos.</p>
                </div>
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">Taxas de Recrutamento</h3>
                  <p className="text-slate-400 text-sm">Estruturas flexíveis de cobrança baseadas em sucesso. Você só investe quando encontra o candidato ideal.</p>
                </div>
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">Vagas Patrocinadas</h3>
                  <p className="text-slate-400 text-sm">Destaque absoluto para vagas urgentes. Apareça no topo das buscas e nos e-mails direcionados aos candidatos.</p>
                </div>
              </div>

              <Link href="/auth/register?type=company" className="inline-flex items-center justify-center font-medium transition-colors bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-900/30">
                Sou uma empresa
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
