import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


const areas = [
  'Administração',
  'RH',
  'Tecnologia',
  'Logística',
  'Financeiro',
  'Comercial',
  'Marketing',
  'Atendimento',
  'Produção',
  'Contabilidade',
  'Vendas',
  'Suporte',
  'Operações',
  'Compras',
  'Jurídico',
  'Engenharia',
  'Saúde',
  'Educação',
  'Serviços Gerais',
  'Estágio',
  'Jovem Aprendiz',
  'Outros'
];

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

export async function GET() {
  try {
    const results = [];
    for (const name of areas) {
      const slug = slugify(name);
      const area = await prisma.professionalArea.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          description: `Área profissional de ${name}`,
          active: true
        }
      });
      results.push(area);
    }
    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
