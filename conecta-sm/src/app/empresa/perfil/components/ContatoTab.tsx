import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput, CEPInput } from '@/components/ui/Input/MaskedInputs';
import { toast } from 'sonner';

interface Props {
  data: any;
  handleChange: (field: string, value: any) => void;
}

export default function ContatoTab({ data, handleChange }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Presença Digital & Redes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Site Institucional</Label>
              <Input 
                type="url" 
                value={data.website || ''} 
                onChange={e => handleChange('website', e.target.value)} 
                placeholder="https://..." 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">LinkedIn</Label>
              <Input 
                type="url" 
                value={data.linkedin || ''} 
                onChange={e => handleChange('linkedin', e.target.value)} 
                placeholder="URL do LinkedIn da empresa" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Instagram</Label>
              <Input 
                value={data.instagram || ''} 
                onChange={e => handleChange('instagram', e.target.value)} 
                placeholder="@empresa" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Facebook</Label>
              <Input 
                type="url" 
                value={data.facebook || ''} 
                onChange={e => handleChange('facebook', e.target.value)} 
                placeholder="URL da página" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a202c] border-gray-800 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <CardHeader>
          <CardTitle className="text-gray-100">Localização & Contato Administrativo</CardTitle>
          <CardDescription className="text-gray-400">Estes dados não são exibidos no perfil público por padrão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email Administrativo</Label>
              <Input 
                type="email" 
                value={data.contactEmail || ''} 
                onChange={e => handleChange('contactEmail', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Telefone Corporativo</Label>
              <PhoneInput 
                value={data.contactPhone || ''} 
                onValueChange={(unmasked) => handleChange('contactPhone', unmasked)} 
                placeholder="(00) 00000-0000" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-gray-300">CEP</Label>
              <CEPInput 
                value={data.zipCode || ''} 
                onValueChange={(unmasked) => handleChange('zipCode', unmasked)} 
                onAddressFetch={(data) => {
                  handleChange('street', data.logradouro);
                  handleChange('neighborhood', data.bairro);
                  handleChange('city', data.localidade);
                  handleChange('state', data.uf);
                  toast.success('Endereço preenchido automaticamente!');
                }}
                placeholder="00000-000" 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-3">
              <Label className="text-gray-300">Rua / Avenida</Label>
              <Input 
                value={data.street || ''} 
                onChange={e => handleChange('street', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-gray-300">Número</Label>
              <Input 
                value={data.number || ''} 
                onChange={e => handleChange('number', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-gray-300">Comp.</Label>
              <Input 
                value={data.complement || ''} 
                onChange={e => handleChange('complement', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-2">
              <Label className="text-gray-300">Bairro</Label>
              <Input 
                value={data.neighborhood || ''} 
                onChange={e => handleChange('neighborhood', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-3">
              <Label className="text-gray-300">Cidade</Label>
              <Input 
                value={data.city || ''} 
                onChange={e => handleChange('city', e.target.value)} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-gray-300">Estado (UF)</Label>
              <Input 
                value={data.state || ''} 
                onChange={e => handleChange('state', e.target.value)} 
                maxLength={2} 
                className="bg-[#0f1219] border-gray-800 text-white placeholder-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
