-- Correção da Trigger para Prisma (O Prisma não gera UUIDs e updated_at nativamente no banco por padrão, a não ser que seja dbgenerated)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, nome, email, telefone, tipo, updated_at)
  VALUES (
    gen_random_uuid(),
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário'),
    new.email,
    new.raw_user_meta_data->>'telefone',
    COALESCE(new.raw_user_meta_data->>'tipo', 'CANDIDATE'),
    now()
  );

  -- Se for CANDIDATE, insere na tabela candidates também
  IF new.raw_user_meta_data->>'tipo' = 'CANDIDATE' THEN
    INSERT INTO public.candidates (id, profile_id)
    VALUES (gen_random_uuid(), (SELECT id FROM public.profiles WHERE auth_user_id = new.id));
  END IF;

  -- Se for COMPANY, insere na tabela companies também
  IF new.raw_user_meta_data->>'tipo' = 'COMPANY' THEN
    INSERT INTO public.companies (id, profile_id, cnpj, trade_name, company_name)
    VALUES (
      gen_random_uuid(),
      (SELECT id FROM public.profiles WHERE auth_user_id = new.id),
      'PENDENTE-' || new.id, 
      COALESCE(new.raw_user_meta_data->>'nome', 'Empresa'),
      COALESCE(new.raw_user_meta_data->>'nome', 'Empresa')
    );
  END IF;

  RETURN new;
END;
$$;
