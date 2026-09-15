import { prisma } from './src/lib/prisma'

async function main() {
  try {
    // Tenta criar o bucket se ele não existir
    console.log('Criando bucket public_assets...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
      VALUES ('public_assets', 'public_assets', true, null, null)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Criando políticas de segurança (RLS) para o bucket...');
    
    // Política para SELECT (leitura pública)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_assets_select') THEN
          CREATE POLICY "public_assets_select" ON storage.objects FOR SELECT USING (bucket_id = 'public_assets');
        END IF;
      END
      $$;
    `);

    // Política para INSERT (upload de arquivos) - liberado para qualquer pessoa autenticada
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_assets_insert') THEN
          CREATE POLICY "public_assets_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public_assets');
        END IF;
      END
      $$;
    `);

    // Política para UPDATE (atualizar arquivos)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_assets_update') THEN
          CREATE POLICY "public_assets_update" ON storage.objects FOR UPDATE USING (bucket_id = 'public_assets');
        END IF;
      END
      $$;
    `);

    console.log('Bucket e políticas criados com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar bucket:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
