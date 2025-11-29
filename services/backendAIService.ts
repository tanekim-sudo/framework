import { api } from './api';
import { PromptBlock } from '../types';

/**
 * Backend AI Service - Uses Claude via Backend API
 * This service routes AI generation through the backend, which uses Claude/Anthropic
 */
export class BackendAIService {
  /**
   * Generates a new PromptBlock definition based on user intent.
   * Uses backend Claude model for generation.
   */
  async generateSmartBlock(intent: string): Promise<Partial<PromptBlock> | null> {
    try {
      const response = await api.generateBlock(intent);
      
      if (!response || !response.success) {
        console.warn("Backend block generation failed, using fallback");
        return this.getFallbackBlock(intent);
      }

      const data = response.data || response;
      const validCategories = ['Discovery', 'Analysis', 'Recommendations', 'Implementation', 'Evaluation'];
      const category = validCategories.includes(data.category) ? data.category : 'Analysis';

      return {
        title: data.title || `AI Generated: ${intent}`,
        category: category as any,
        description: data.description || `Automated analysis based on: ${intent}`,
        defaultPrompt: data.defaultPrompt || `Analyze the following data focusing on ${intent}. Provide key insights and recommendations.`,
        iconName: "Sparkles",
        inputRequirements: data.inputRequirements || ["Data Context"]
      };
    } catch (error) {
      console.error("Backend Block Generation Failed:", error);
      return this.getFallbackBlock(intent);
    }
  }

  /**
   * Executes a step, returning both the Reasoning Trace and the Final Output.
   * Uses backend Claude model for execution.
   */
  async executeStepWithReasoning(prompt: string, contextData: string = ""): Promise<{ reasoning: string, output: string }> {
    try {
      const response = await api.executeAI(prompt, contextData);
      
      if (!response || !response.success) {
        console.warn("Backend AI execution failed, using fallback");
        return this.getFallbackExecution(prompt);
      }

      // Backend should return { reasoning, output } or parse it from the response
      const data = response.data || response;
      
      // Handle different response formats
      if (data.reasoning && data.output) {
        return {
          reasoning: data.reasoning,
          output: data.output
        };
      }

      // If backend returns text with separators, parse it
      const text = data.text || data.output || data;
      if (typeof text === 'string') {
        const reasoningMatch = text.match(/===REASONING===([\s\S]*?)===OUTPUT===/);
        const outputMatch = text.match(/===OUTPUT===([\s\S]*)/);

        if (reasoningMatch && outputMatch) {
          return {
            reasoning: reasoningMatch[1].trim(),
            output: outputMatch[1].trim()
          };
        }

        // If no separators, try to split on common patterns
        const parts = text.split(/\n\n+/);
        if (parts.length >= 2) {
          return {
            reasoning: parts.slice(0, -1).join('\n\n'),
            output: parts[parts.length - 1]
          };
        }

        // Fallback: use entire text as output
        return {
          reasoning: "Reasoning process executed using Claude.",
          output: text
        };
      }

      return this.getFallbackExecution(prompt);
    } catch (error) {
      console.error("Backend AI Execution Failed:", error);
      return {
        reasoning: "Error during reasoning phase.",
        output: "Error: Could not execute reasoning step. Please check your backend configuration and ensure Claude API key is set."
      };
    }
  }

  /**
   * Fallback block generation when backend is unavailable
   */
  private getFallbackBlock(intent: string): Partial<PromptBlock> {
    return {
      title: "AI Generated Analysis",
      category: "Analysis",
      description: `Automated analysis based on: ${intent}`,
      defaultPrompt: `Analyze the following data focusing on ${intent}. Provide key insights and recommendations.`,
      iconName: "Sparkles",
      inputRequirements: ["Data Context"]
    };
  }

  /**
   * Fallback execution when backend is unavailable
   */
  private getFallbackExecution(prompt: string): { reasoning: string, output: string } {
    return {
      reasoning: "Backend AI service unavailable. Please ensure your backend is running and Claude API key is configured.",
      output: `[Backend AI Unavailable]\n\nPrompt: "${prompt}"\n\nPlease configure your backend with Claude API key to enable AI generation.`
    };
  }
}

export const backendAIService = new BackendAIService();
