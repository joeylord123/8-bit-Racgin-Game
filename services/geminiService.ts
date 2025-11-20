import { GoogleGenAI } from "@google/genai";
import { RaceStats } from "../types";

const createClient = () => {
    // Ensure API key exists
    if (!process.env.API_KEY) {
        console.warn("API_KEY is missing. AI features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateRaceCommentary = async (stats: RaceStats): Promise<string> => {
  const ai = createClient();
  if (!ai) return "AI Module Offline: Check API Key configuration.";

  try {
    const prompt = `
      You are a retro racing game announcer from the 1980s (like in an arcade cabinet).
      The player just finished a race with the following stats:
      - Score: ${stats.score}
      - Distance Traveled: ${Math.floor(stats.distance)} meters
      - Top Speed reached: ${Math.floor(stats.topSpeed * 10)} km/h
      - Cause of Crash: ${stats.causeOfDeath}
      
      Write a short, punchy, 8-bit style game over message (max 2 sentences). 
      Be snarky if the score is low, or hyped if the score is high (>5000).
      Use arcade slang.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an 8-bit arcade racing announcer. Keep it brief, retro, and capitalized.",
        maxOutputTokens: 60,
      }
    });

    return response.text || "GAME OVER. INSERT COIN.";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "COMMUNICATION ERROR. RETRY.";
  }
};