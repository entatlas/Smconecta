require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const systemInstruction = 'Você é um assistente.';
  const contents = [{ role: 'user', parts: [{ text: 'Oi' }] }];

  console.log('Sending request to Google...');
  const start = Date.now();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contents,
      config: { systemInstruction }
    });
    console.log('Got response in', Date.now() - start, 'ms');
    console.log(response.text);
  } catch(e) {
    console.error('Error in GenAI:', e);
  }

  await prisma.$disconnect();
}

run();
