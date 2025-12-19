
import { GoogleGenAI, Type } from "@google/genai";
import { TokenConfig, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeTokenomics(config: TokenConfig): Promise<AIAnalysis> {
  const prompt = `
    Analyze the following cryptocurrency token proposal and provide a professional evaluation.
    Network: ${config.network}
    Name: ${config.name}
    Symbol: ${config.symbol}
    Total Supply: ${config.totalSupply}
    Decimals: ${config.decimals}
    Description: ${config.description}

    Provide a JSON response with market viability, suggested improvements, and potential risks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viabilityScore: { type: Type.NUMBER, description: "A score from 0-100" },
            marketAnalysis: { type: Type.STRING },
            suggestedImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["viabilityScore", "marketAnalysis", "suggestedImprovements", "riskWarnings"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      viabilityScore: 50,
      marketAnalysis: "Unable to perform deep analysis at this moment. The configuration seems standard.",
      suggestedImprovements: ["Ensure liquidity is locked after minting", "Verify community interest before launch"],
      riskWarnings: ["Standard market volatility risks apply"]
    };
  }
}

export async function generateTokenMetadata(config: TokenConfig): Promise<string> {
  const prompt = `Write a compelling 100-word marketing description for a new crypto token named ${config.name} ($${config.symbol}) on the ${config.network} network based on this draft: "${config.description}". Highlight its utility and community value.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    return config.description;
  }
}
