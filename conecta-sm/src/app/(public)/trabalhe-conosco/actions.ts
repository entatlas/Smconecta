'use server';

import { createClient as createSupabaseClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function submitTrabalheConoscoSM(formData: FormData) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const data = Object.fromEntries(formData.entries());
    
    // Extrair campos de array (checkboxes) que vêm separados no FormData
    const getArray = (name: string) => formData.getAll(name).join(', ');

    const nome = data.q01_nome as string;
    const email = data.q05_email as string;
    const telefone = data.q04_whatsapp as string;
    const birthDate = data.q02_nascimento as string;
    const location = data.q03_cidade as string;
    
    if (!nome || !email || !telefone) {
      return { success: false, error: 'Campos obrigatórios (Nome, Email, WhatsApp) faltando.' };
    }

    // Construir o sumário completo
    const formSummary = `
**01 - Nome completo:** ${nome}
**02 - Data de nascimento:** ${birthDate}
**03 - Cidade e bairro onde reside:** ${location}
**04 - WhatsApp principal:** ${telefone}
**05 - E-mail:** ${email}
**06 - Áreas de conhecimento:** ${getArray('q06_areas')}
**07 - Escolaridade:** ${data.q07_escolaridade}
**08 - Cursos e certificações:** ${data.q08_cursos}
**09 - Já ministrou treinamentos?** ${data.q09_ministrou}
**10 - Experiência em treinamentos:** ${data.q10_experiencia_treinamentos || 'N/A'}
**11 - Modalidades de interesse:** ${getArray('q11_modalidades')}
**12 - Experiência prática comprovada:** ${data.q12_experiencia_pratica}
**13 - Empresas/Projetos onde atuou:** ${data.q13_empresas_atuou || 'N/A'}
**14 - Disponibilidade de horário:** ${data.q14_disponibilidade_horario}
**15 - Disponibilidade para (formatos):** ${getArray('q15_disponibilidade_formatos') || 'N/A'}
**16 - Possui (PJ/MEI, etc):** ${getArray('q16_possui')}
**17 - Pretensão de remuneração:** ${data.q17_remuneracao || 'N/A'}
**18 - Características que combinam:** ${getArray('q18_caracteristicas')}
**19 - Por que deseja fazer parte da Equipe SM?** ${data.q19_motivo}
**20 - Autoriza manter dados no banco?** ${data.q20_autoriza}
**21 - Facilidade para iniciar com pouco prazo?** ${data.q21_prazo}
**22 - Equipamentos para aulas online:** ${getArray('q22_equipamentos') || 'N/A'}
**23 - Já trabalhou com público:** ${getArray('q23_publico') || 'N/A'}
**24 - Habilidade diferenciada:** ${data.q24_habilidade || 'N/A'}
**25 - Mensagem final:** ${data.q25_mensagem || 'N/A'}
    `.trim();

    // Buscar perfil do usuário
    const profile = await prisma.profile.findFirst({
      where: { auth_user_id: user.id },
      include: { candidateProfile: true }
    });

    if (!profile) {
      return { success: false, error: 'Perfil não encontrado no sistema.' };
    }

    let candidateId = profile.candidateProfile?.id;

    // Se ele não tiver um candidateProfile, cria um!
    if (!candidateId) {
      const newCandidate = await prisma.candidate.create({
        data: {
          profileId: profile.id,
          professionalArea: 'Equipe Multidisciplinar',
          about: 'Candidato inscrito para Equipe Técnica Multidisciplinar SM.',
          visibility: 'PUBLIC'
        }
      });
      candidateId = newCandidate.id;
    } else {
      // Opcional: Atualiza a área se já for candidato mas de outra coisa
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          professionalArea: 'Equipe Multidisciplinar'
        }
      });
    }

    // Cria o registro no histórico de candidatura
    await prisma.professionalHistory.create({
      data: {
        candidateId: candidateId,
        eventType: 'JOB_APPLIED',
        title: 'Inscrição: Equipe Técnica Multidisciplinar SM',
        description: formSummary,
        createdById: profile.id
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error in submitTrabalheConoscoSM:', err);
    return { success: false, error: 'Erro interno do servidor.' };
  }
}
