import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const triggerSql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  nome_usuario text;
  tipo_usuario text;
BEGIN
  nome_usuario := COALESCE(
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    'Usuário sem nome'
  );

  tipo_usuario := COALESCE(
    new.raw_user_meta_data->>'tipo',
    'CANDIDATE'
  );

  INSERT INTO public.profiles (id, auth_user_id, email, nome, tipo, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    new.id, 
    new.email, 
    nome_usuario, 
    tipo_usuario, 
    'ACTIVE',
    now(),
    now()
  );

  IF tipo_usuario = 'COMPANY' THEN
    INSERT INTO public.companies (id, profile_id, cnpj, trade_name, company_name)
    VALUES (
      gen_random_uuid(),
      (SELECT id FROM public.profiles WHERE auth_user_id = new.id),
      'PENDENTE-' || new.id,
      nome_usuario,
      nome_usuario
    );
  ELSE
    INSERT INTO public.candidates (id, profile_id, visibility)
    VALUES (
      gen_random_uuid(),
      (SELECT id FROM public.profiles WHERE auth_user_id = new.id),
      'PUBLIC'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    await prisma.$executeRawUnsafe(triggerSql);

    return NextResponse.json({ success: true, message: 'Trigger atualizada com sucesso para respeitar o tipo (COMPANY ou CANDIDATE)' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
