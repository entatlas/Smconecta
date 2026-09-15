import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  data: any;
  handleChange: (field: string, value: any) => void;
}

export default function RecrutamentoTab({ data, handleChange }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Informações para Candidatos</CardTitle>
          <CardDescription className="text-gray-400">Orientações visíveis publicamente nas suas vagas e perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">E-mail ou Contato do RH (Público)</Label>
            <Input 
              type="email" 
              value={data.hrContact || ''} 
              onChange={e => handleChange('hrContact', e.target.value)} 
              placeholder="rh@empresa.com.br" 
              className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
            />
            <p className="text-xs text-gray-500">Este e-mail será visível para candidatos tirarem dúvidas.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Como funciona nosso processo seletivo?</Label>
            <Textarea 
              rows={6} 
              value={data.hiringProcess || ''} 
              onChange={e => handleChange('hiringProcess', e.target.value)} 
              placeholder="Ex: 1. Triagem curricular&#10;2. Entrevista com RH&#10;3. Teste técnico&#10;4. Entrevista com Gestor" 
              className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
