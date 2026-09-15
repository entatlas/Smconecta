const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function main() {
  console.log('Iniciando seed de Áreas Profissionais...');
  for (const name of areas) {
    const slug = slugify(name);
    try {
      await prisma.professionalArea.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          description: `Área profissional de ${name}`,
          active: true
        }
      });
      console.log(`✅ Área inserida/atualizada: ${name}`);
    } catch (error) {
      console.error(`❌ Erro ao inserir ${name}:`, error.message);
    }
  }
  console.log('Seed concluído!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
