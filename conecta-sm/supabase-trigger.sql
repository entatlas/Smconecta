-- Cria uma função que será executada sempre que um usuário for criado no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, nome, email, telefone, tipo)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.email,
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'tipo'
  );

  -- Se for CANDIDATE, insere na tabela candidates também
  IF new.raw_user_meta_data->>'tipo' = 'CANDIDATE' THEN
    INSERT INTO public.candidates (profile_id, birth_date)
    VALUES (
      (SELECT id FROM public.profiles WHERE auth_user_id = new.id),
      CASE WHEN new.raw_user_meta_data->>'birthDate' IS NOT NULL THEN (new.raw_user_meta_data->>'birthDate')::date ELSE NULL END
    );
  END IF;

  -- Se for COMPANY, insere na tabela companies também
  IF new.raw_user_meta_data->>'tipo' = 'COMPANY' THEN
    INSERT INTO public.companies (profile_id, cnpj, trade_name, company_name)
    VALUES (
      (SELECT id FROM public.profiles WHERE auth_user_id = new.id),
      'PENDENTE-' || new.id, -- Necessário pois cnpj é unique
      new.raw_user_meta_data->>'nome',
      new.raw_user_meta_data->>'nome'
    );
  END IF;

  RETURN new;
END;
$$;

-- Cria o gatilho (trigger) no auth.users do Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
