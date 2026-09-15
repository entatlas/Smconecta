import { prisma } from '@/lib/prisma';
import { askAI } from './index';

/**
 * Retorna o percentual de compatibilidade entre um candidato e uma vaga
 * Utiliza o LLM para cruzar de forma inteligente (ex: Angular -> Typescript match) 
 * mas sem usar dados sensíveis (apenas Skills, XP e Formação).
 */
export async function calculateCandidateJobMatch(candidateId: string, jobId: string): Promise<{ score: number, reasoning: string }> {
  
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { skills: true, experiences: true, education: true }
  });

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { skills: true }
  });

  if (!candidate || !job) {
    throw new Error("Dados insuficientes para cálculo.");
  }

  // Prepara o payload "Clean" (Sem nome, sem localização exata, sem dados protegidos)
  const candidateProfileStr = `
Competências: ${candidate.skills.map(s => s.name).join(', ')}
Experiências: ${candidate.experiences.map(e => `${e.role} (${e.isCurrent ? 'Atual' : 'Concluído'})`).join(', ')}
Formação: ${candidate.education.map(e => `${e.course} - ${e.level}`).join(', ')}
Objetivo: ${candidate.desiredRole}
  `.trim();

  const jobProfileStr = `
Título: ${job.title}
Requisitos: ${job.description}
Competências Obrigatórias: ${job.skills.filter(s => s.required).map(s => s.skillId).join(', ')}
Nível: ${job.experienceLevel}
  `.trim();

  const prompt = `Analise a compatibilidade técnica profissional entre a vaga e o candidato.
Responda EXATAMENTE neste formato JSON:
{
  "score": <número inteiro de 0 a 100>,
  "reasoning": "<texto curto explicando os fatores positivos e negativos do match>"
}

DADOS DA VAGA:
${jobProfileStr}

DADOS DO CANDIDATO:
${candidateProfileStr}
`;

  try {
    const rawAiResponse = await askAI(prompt, undefined, 'Match_Vaga_Candidato');
    
    // Tentamos parsear. Como LLMs as vezes injetam markdown, vamos limpar.
    const cleanResponse = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanResponse);

    return {
      score: data.score || 0,
      reasoning: data.reasoning || "Sem justificativa disponível."
    };
  } catch (error) {
    console.error("Match calculation failed", error);
    return {
      score: 50,
      reasoning: "Não foi possível estimar a compatibilidade via IA no momento. Estimativa base."
    };
  }
}
