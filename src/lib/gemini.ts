import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface ModeConfig {
  criteria: string;
  weights: {
    style: number;
    grammar: number;
    creativity: number;
    clarity: number;
    relevance: number;
  };
  examples: string[];
  template: string;
}

const modeConfigurations: Record<string, ModeConfig> = {
  technical: {
    criteria: `
      Technical Mode Specific Criteria:
      - Technical accuracy and precision (30%)
      - Proper use of terminology (25%)
      - Implementation feasibility (25%)
      - Documentation standards (20%)`,
    weights: {
      style: 0.15,
      grammar: 0.20,
      creativity: 0.10,
      clarity: 0.30,
      relevance: 0.25
    },
    examples: [
      "Explain the architecture of a microservices-based e-commerce system",
      "How to implement JWT authentication in a Node.js API",
      "Design a database schema for a social media platform"
    ],
    template: `[System Requirements]
- Purpose:
- Technical Constraints:
- Expected Behavior:

[Implementation Details]
- Architecture:
- Components:
- Dependencies:

[Additional Considerations]
- Security:
- Scalability:
- Performance:`
  },
  creative: {
    criteria: `
      Creative Mode Specific Criteria:
      - Imaginative approach (30%)
      - Narrative elements (25%)
      - Emotional engagement (25%)
      - Artistic expression (20%)`,
    weights: {
      style: 0.25,
      grammar: 0.15,
      creativity: 0.30,
      clarity: 0.15,
      relevance: 0.15
    },
    examples: [
      "Create a story about a time traveler who can only go 24 hours into the future",
      "Design a unique magical system for a fantasy world",
      "Write a dialogue between the sun and the moon"
    ],
    template: `[Scene Setting]
- Environment:
- Atmosphere:
- Time/Period:

[Creative Elements]
- Main Theme:
- Unique Aspects:
- Emotional Core:

[Narrative Structure]
- Beginning:
- Development:
- Resolution:`
  },
  casual: {
    criteria: `
      Casual Mode Specific Criteria:
      - Conversational tone (30%)
      - Relatable examples (25%)
      - Engaging dialogue (25%)
      - Natural flow (20%)`,
    weights: {
      style: 0.20,
      grammar: 0.15,
      creativity: 0.20,
      clarity: 0.25,
      relevance: 0.20
    },
    examples: [
      "Explain how to make the perfect cup of coffee",
      "Share tips for maintaining a work-life balance",
      "Describe your ideal weekend routine"
    ],
    template: `[Main Topic]
- What we want to know:
- Why it matters:
- Who it's for:

[Key Points]
- Main ideas:
- Examples:
- Tips:

[Practical Application]
- Real-world usage:
- Common scenarios:
- Helpful hints:`
  }
};

export function getPromptTemplate(mode: string): string {
  return modeConfigurations[mode]?.template || '';
}

export function getModeExamples(mode: string): string[] {
  return modeConfigurations[mode]?.examples || [];
}

export async function analyzePrompt(prompt: string, mode: string) {
  const config = modeConfigurations[mode];
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const analysisPrompt = `
      You are an expert prompt engineer and AI analyst.
      
      Task 1: Answer this prompt: "${prompt}"
      Task 2: Analyze the prompt quality using these criteria:
      
      ${config.criteria}

      Base Criteria:
      Style (0-100): ${config.weights.style * 100}% weight
      Grammar (0-100): ${config.weights.grammar * 100}% weight
      Creativity (0-100): ${config.weights.creativity * 100}% weight
      Clarity (0-100): ${config.weights.clarity * 100}% weight
      Relevance (0-100): ${config.weights.relevance * 100}% weight

      Example prompts for ${mode} mode:
      ${config.examples.map(ex => `- ${ex}`).join('\n')}

      Return JSON without formatting:
      {
        "promptResult": "Answer formatted for ${mode} mode",
        "response": "Analysis with mode-specific insights",
        "scores": {
          "style": weighted_score,
          "grammar": weighted_score,
          "creativity": weighted_score,
          "clarity": weighted_score,
          "relevance": weighted_score
        },
        "suggestions": [
          "Mode-specific improvement",
          "Structure enhancement based on template",
          "Comparison with example prompts"
        ]
      }
    `;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    let text = response.text();
    
    try {
      // Clean the response text
      text = text
        // Remove any markdown code block markers
        .replace(/```json\s*|\s*```/g, '')
        // Remove any "JSON" text prefix
        .replace(/^JSON\s*/, '')
        // Clean up any potential line breaks within the JSON
        .split('\n')
        .map(line => line.trim())
        .join(' ')
        .trim();

      // Try to find the JSON object boundaries
      const startBrace = text.indexOf('{');
      const endBrace = text.lastIndexOf('}');
      
      if (startBrace === -1 || endBrace === -1) {
        throw new Error("Invalid JSON structure");
      }

      // Extract just the JSON part
      const jsonText = text.slice(startBrace, endBrace + 1);

      // Parse and validate the JSON
      const parsedData = JSON.parse(jsonText);

      // Validate required fields
      if (!parsedData.promptResult || 
          !parsedData.response || 
          !parsedData.scores || 
          !Array.isArray(parsedData.suggestions)) {
        throw new Error("Missing required fields in response");
      }

      // Validate score values
      const scores = parsedData.scores;
      for (const key of ['style', 'grammar', 'creativity', 'clarity', 'relevance']) {
        if (typeof scores[key] !== 'number' || scores[key] < 0 || scores[key] > 100) {
          throw new Error(`Invalid score value for ${key}`);
        }
      }

      return parsedData;
    } catch (parseError: unknown) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw Response:", text);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
} 