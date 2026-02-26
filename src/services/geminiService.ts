
import { GoogleGenAI, Type } from "@google/genai";

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const isQuotaError = (error as { message?: string, status?: number })?.message?.includes('429') || (error as { message?: string, status?: number })?.status === 429;
      
      if (isQuotaError && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateQuestDetails(title: string, difficulty: string): Promise<{ description: string, systemMessage: string }> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. System functionality restricted.");
    return { 
      description: `O destino exige que você complete este desafio de Rank ${difficulty}.`,
      systemMessage: "O Sistema está observando cada passo seu."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Solo Leveling System. Gere dados para a missão: "${title}" (Rank ${difficulty}).
      Retorne JSON com:
      - description: (máx 120 caracteres, tom épico)
      - systemMessage: (comentário curto e sarcástico do sistema sobre a dificuldade, máx 10 palavras).
      Português BR.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            systemMessage: { type: Type.STRING }
          },
          required: ["description", "systemMessage"]
        }
      },
    }));
    
    return JSON.parse(response.text || '{}');
  } catch (error: unknown) {
    console.error("Gemini Error:", error);
    return { 
      description: `O destino exige que você complete este desafio de Rank ${difficulty}.`,
      systemMessage: "O Sistema está observando cada passo seu."
    };
  }
}

export async function generateSystemCommentary(level: number, rank: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "O topo ainda está longe.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sistema Solo Leveling: Reação curta ao Nível ${level} (Rank ${rank}). Máximo 8 palavras.`,
    }));
    return response.text?.trim() || "O topo ainda está longe.";
  } catch (error: unknown) {
    console.error("Gemini Commentary Error:", error);
    return "Seu progresso foi registrado.";
  }
}
