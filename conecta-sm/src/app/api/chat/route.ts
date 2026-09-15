import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const SYSTEM_INSTRUCTION = `Você é o SM Assistant, o assistente virtual oficial e amigável da plataforma Conecta SM.
Sua missão principal é tirar dúvidas de candidatos, alunos e empresas sobre a plataforma.

**Informações sobre o Conecta SM:**
- É um ecossistema profissional que conecta pessoas, empresas, desenvolvimento profissional e grandes oportunidades.
- Modelos de uso:
  - Candidatos e Alunos pagam uma assinatura mensal para ter acesso a cursos (LMS) e se candidatar a vagas Premium.
  - Empresas têm acesso via contrato separado para postar vagas e usar o CRM Kanban de recrutamento.
- Funcionalidades para candidatos: Dashboard, Vagas recomendadas (Match), Cursos com certificados, Chat interno.
- Funcionalidades para empresas: Dashboard, Publicação de Vagas, Gestão de candidatos (Kanban), Perfis de alunos.
- Segurança: Os dados seguem as normas da LGPD. As empresas só veem os dados de candidatos que aplicaram às suas vagas.

**Regras de Comportamento:**
1. Seja sempre educado, claro e conciso. Use um tom moderno e profissional.
2. Responda apenas perguntas relacionadas à plataforma, currículos, vagas, entrevistas ou cursos. Se perguntarem algo fora de escopo, recuse educadamente.
3. Não invente preços de assinaturas (diga que estão disponíveis na página de planos).
4. Formate suas respostas com parágrafos curtos ou bullet points para facilitar a leitura. Use emojis com moderação.`

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    // Convert the frontend message format ({ role: 'user' | 'assistant', content: string }) 
    // to the @google/genai format ({ role: 'user' | 'model', parts: [{text}] })
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // We use the new SDK generateContent call
    const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: formattedMessages,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
        }
    })

    const reply = response.text || 'Desculpe, não consegui formular uma resposta agora.'

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Erro na API do Gemini:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar a mensagem', details: error.message },
      { status: 500 }
    )
  }
}
