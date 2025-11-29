import { GoogleGenAI } from "@google/genai";
import { PromptBlock } from "../types";

// Helper to get API key safely
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

// Interface for what we expect Gemini to return when generating a block
interface GeneratedBlockResponse {
  title: string;
  category: string;
  description: string;
  defaultPrompt: string;
  inputRequirements: string[];
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = getApiKey();
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("Gemini API Key not found. AI features will run in mock mode.");
    }
  }

  /**
   * Generates a new PromptBlock definition based on user intent.
   */
  async generateSmartBlock(intent: string): Promise<Partial<PromptBlock> | null> {
    if (!this.ai) {
      // Mock response if no API key
      return new Promise(resolve => setTimeout(() => resolve({
        title: "AI Generated Analysis",
        category: "Analysis",
        description: `Automated analysis based on: ${intent}`,
        defaultPrompt: `Analyze the following data focusing on ${intent}. Provide key insights and recommendations.`,
        iconName: "Sparkles",
        inputRequirements: ["Data Context"]
      }), 1500));
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a consulting workflow block definition for the following user request: "${intent}".
        Return ONLY a JSON object with keys: title, category (one of: Discovery, Analysis, Recommendations, Implementation, Evaluation), description (short), defaultPrompt (detailed), inputRequirements (array of strings representing data needed).`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) return null;

      const data = JSON.parse(text) as GeneratedBlockResponse;
      
      const validCategories = ['Discovery', 'Analysis', 'Recommendations', 'Implementation', 'Evaluation'];
      const category = validCategories.includes(data.category) ? data.category : 'Analysis';

      return {
        title: data.title,
        category: category as any,
        description: data.description,
        defaultPrompt: data.defaultPrompt,
        iconName: "Sparkles",
        inputRequirements: data.inputRequirements || []
      };

    } catch (error) {
      console.error("Gemini Block Generation Failed:", error);
      return null;
    }
  }

  /**
   * Executes a step, returning both the Reasoning Trace and the Final Output.
   */
  async executeStepWithReasoning(prompt: string, contextData: string = ""): Promise<{ reasoning: string, output: string }> {
    if (!this.ai) {
      return new Promise(resolve => setTimeout(() => resolve({
        reasoning: "Identifying key variables in input data... Calculating confidence intervals... Cross-referencing with industry benchmarks...",
        output: `[Mock AI Output]\nAnalysis complete based on prompt: "${prompt}".\n\nKey Findings:\n1. Trend A is accelerating.\n2. Cost basis is stable.\n3. Risk factors are moderate.`
      }), 2500));
    }

    try {
      const fullPrompt = `
      You are an expert strategy consultant (McKinsey/Bain/BCG style).
      
      Your task is to execute the following step in a workflow:
      "${prompt}"

      Context Data:
      ${contextData}

      Structure your response EXACTLY as follows using these separators:
      
      ===REASONING===
      (Explain your thought process here. What frameworks are you using? What patterns are you seeing? Be transparent.)
      
      ===OUTPUT===
      (The final deliverable. High quality, structured, professional.)
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      const text = response.text || "";
      
      // Parse the special separators
      const reasoningMatch = text.match(/===REASONING===([\s\S]*?)===OUTPUT===/);
      const outputMatch = text.match(/===OUTPUT===([\s\S]*)/);

      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "Reasoning process executed.";
      const output = outputMatch ? outputMatch[1].trim() : text;

      return { reasoning, output };

    } catch (error) {
      console.error("Gemini Execution Failed:", error);
      return { 
        reasoning: "Error during reasoning phase.",
        output: "Error: Could not execute reasoning step. Please try again."
      };
    }
  }
}

export const geminiService = new GeminiService();