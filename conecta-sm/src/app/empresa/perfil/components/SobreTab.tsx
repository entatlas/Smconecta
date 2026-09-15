import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  data: any;
  handleChange: (field: string, value: any) => void;
}

export default function SobreTab({ data, handleChange }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Sobre a Empresa</CardTitle>
          <CardDescription className="text-gray-400">Apresente sua empresa para o mundo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Descrição Completa</Label>
            <Textarea 
              rows={6} 
              value={data.description || ''} 
              onChange={e => handleChange('description', e.target.value)} 
              placeholder="Conte quem vocês são, o que fazem e a história da empresa..." 
              className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Missão</Label>
              <Textarea 
                rows={3} 
                value={data.mission || ''} 
                onChange={e => handleChange('mission', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Visão</Label>
              <Textarea 
                rows={3} 
                value={data.vision || ''} 
                onChange={e => handleChange('vision', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Valores (separados por vírgula)</Label>
            <Input 
              value={data.values || ''} 
              onChange={e => handleChange('values', e.target.value)} 
              placeholder="Inovação, Respeito, Ética..." 
              className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Cultura & Benefícios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Cultura e Ambiente de Trabalho</Label>
            <Textarea 
              rows={4} 
              value={data.culture || ''} 
              onChange={e => handleChange('culture', e.target.value)} 
              placeholder="Como é o dia a dia? Qual o perfil da equipe?" 
              className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Modelo de Trabalho Predominante</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-800 bg-[#0f1219] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={data.workModel || ''} 
                onChange={e => handleChange('workModel', e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Benefícios Oferecidos</Label>
              <Input 
                value={data.benefits || ''} 
                onChange={e => handleChange('benefits', e.target.value)} 
                placeholder="VR, VA, Plano de Saúde, Home Office..." 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
