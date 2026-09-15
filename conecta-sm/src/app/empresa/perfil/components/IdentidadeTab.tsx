import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CNPJInput } from '@/components/ui/Input/MaskedInputs';

interface Props {
  data: any;
  handleChange: (field: string, value: any) => void;
}

export default function IdentidadeTab({ data, handleChange }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Identificação Empresarial</CardTitle>
          <CardDescription className="text-gray-400">Informações oficiais e de registro da empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Razão Social</Label>
              <Input 
                value={data.companyName || ''} 
                onChange={e => handleChange('companyName', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">CNPJ</Label>
              <CNPJInput 
                value={data.cnpj || ''} 
                onValueChange={(unmasked) => handleChange('cnpj', unmasked)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Nome Fantasia (Nome Público)</Label>
            <Input 
              value={data.tradeName || ''} 
              onChange={e => handleChange('tradeName', e.target.value)} 
              placeholder="Como os candidatos conhecem sua empresa" 
              className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Classificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Segmento Principal</Label>
              <Input 
                value={data.industry || ''} 
                onChange={e => handleChange('industry', e.target.value)} 
                placeholder="Ex: Tecnologia, Saúde, Comércio" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Subsegmento (Opcional)</Label>
              <Input 
                value={data.subIndustry || ''} 
                onChange={e => handleChange('subIndustry', e.target.value)} 
                placeholder="Ex: Software, Varejo" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Porte da Empresa</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-800 bg-[#0f1219] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={data.companySize || ''} 
                onChange={e => handleChange('companySize', e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Micro">Microempresa</option>
                <option value="Pequena">Pequena</option>
                <option value="Media">Média</option>
                <option value="Grande">Grande</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Ano de Fundação</Label>
              <Input 
                type="number" 
                value={data.foundationYear || ''} 
                onChange={e => handleChange('foundationYear', e.target.value)} 
                placeholder="Ex: 2010" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
