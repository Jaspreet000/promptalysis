import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export function getPromptTemplate(mode: string): string {
  switch (mode) {
    case "casual":
      return "Write a friendly and informal response about...";
    case "technical":
      return "Provide a detailed technical explanation of...";
    case "creative":
      return "Create an imaginative and engaging story about...";
    default:
      return "Enter your prompt here...";
  }
}

export function getModeExamples(mode: string): string[] {
  switch (mode) {
    case "casual":
      return [
        "Explain why the sky is blue in simple terms",
        "What makes ice cream so delicious?",
        "Why do cats purr?",
      ];
    case "technical":
      return [
        "Explain the principles of quantum computing",
        "How does blockchain technology work?",
        "Describe the process of photosynthesis in detail",
      ];
    case "creative":
      return [
        "Write a story about a time-traveling coffee cup",
        "Describe a world where colors have sounds",
        "Create a tale about a library that comes alive at night",
      ];
    default:
      return [];
  }
}

export async function analyzePrompt(prompt: string, mode: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, get the direct answer to the prompt
    const answerResult = await model.generateContent(prompt);
    const answer = answerResult.response.text();

    // Then, analyze the prompt with a more detailed structure
    const analysisPrompt = `
      Analyze the following prompt and provide a comprehensive evaluation:
      
      Prompt: "${prompt}"
      Mode: ${mode}

      Please provide a detailed analysis in the following format:

      DEEP ANALYSIS:
      1. Strengths:
      - List key strengths and positive aspects of the prompt (if any)
      - Highlight effective elements and techniques used (if present)
      - Note any particularly impactful or well-executed parts

      2. Areas for Improvement:
      - Identify aspects that could be enhanced
      - Point out any missed opportunities
      - Note any potential weaknesses

      3. Mode-Specific Analysis (${mode}):
      - Evaluate how well the prompt fits the chosen mode
      - Assess appropriateness for the target audience
      - Analyze effectiveness for the intended purpose

      4. Scoring Breakdown:
      For each category below, provide a score (0-100) with detailed justification.
      IMPORTANT: Be very strict with scoring. A simple or minimal prompt should receive low scores.
      For example, a one-word prompt like "hi" should score below 30 in most categories.

      Style (Score: X/100):
      Scoring criteria:
      - 0-20: Minimal effort, single words, or basic greetings
      - 21-40: Basic phrases with little style consideration
      - 41-60: Clear writing with some style elements
      - 61-80: Well-crafted with consistent tone and good expression
      - 81-100: Exceptional writing with masterful style

      Grammar (Score: X/100):
      Scoring criteria:
      - 0-20: Incomplete sentences or single words
      - 21-40: Basic complete sentences with potential errors
      - 41-60: Proper sentences with standard grammar
      - 61-80: Well-structured with varied sentence patterns
      - 81-100: Perfect grammar with sophisticated structure

      Creativity (Score: X/100):
      Scoring criteria:
      - 0-20: Common words/phrases, no creative elements
      - 21-40: Basic creative attempt
      - 41-60: Some original elements
      - 61-80: Unique and engaging approach
      - 81-100: Highly innovative and original

      Clarity (Score: X/100):
      Scoring criteria:
      - 0-20: Unclear or too brief to convey meaning
      - 21-40: Basic meaning conveyed but lacks detail
      - 41-60: Clear meaning with adequate detail
      - 61-80: Very clear with good detail and organization
      - 81-100: Exceptionally clear and well-organized

      Relevance (Score: X/100):
      Scoring criteria:
      - 0-20: Minimal relevance to mode or purpose
      - 21-40: Basic relevance but lacks focus
      - 41-60: Relevant with room for improvement
      - 61-80: Well-aligned with mode and purpose
      - 81-100: Perfectly aligned with exceptional focus

      SUGGESTIONS FOR IMPROVEMENT:
      Provide SPECIFIC, actionable suggestions. Each suggestion must start with a dash (-).
      Do NOT use placeholders. If no suggestions are provided, the section will be ignored.

      Content Enhancement:
      - [Provide actual content suggestion here]
      - [Provide another specific content suggestion]

      Structural Improvements:
      - [Provide actual structure suggestion here]
      - [Provide another specific structure suggestion]

      Style Refinements:
      - [Provide actual style suggestion here]
      - [Provide another specific style suggestion]

      Mode-Specific Recommendations:
      - [Provide actual ${mode} mode suggestion here]
      - [Provide another specific ${mode} suggestion]

      SCORES:
      {
        "style": [score],
        "grammar": [score],
        "creativity": [score],
        "clarity": [score],
        "relevance": [score]
      }
    `;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();

    // Extract scores from the analysis
    const scoresMatch = analysisText.match(/\{[\s\S]*\}/);
    let scores = {
      style: 0,
      grammar: 0,
      creativity: 0,
      clarity: 0,
      relevance: 0,
    };

    if (scoresMatch) {
      try {
        scores = JSON.parse(scoresMatch[0]);
      } catch (e) {
        console.error("Failed to parse scores:", e);
      }
    }

    // Extract suggestions from the analysis
    const suggestionSection = analysisText
      .split('SUGGESTIONS FOR IMPROVEMENT:')[1]
      ?.split('SCORES:')[0];

    const suggestions = suggestionSection
      ? suggestionSection
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().replace(/^-\s*/, ''))
          .map(suggestion => suggestion.replace(/^\[|\]$/g, ''))
          .filter(suggestion => 
            suggestion.length > 0 && 
            !suggestion.includes('Provide') && 
            !suggestion.includes('actual') &&
            !suggestion.includes('specific') &&
            !suggestion.includes('another')
          )
      : [];

    // Extract the deep analysis section
    const deepAnalysis = analysisText
      .split('DEEP ANALYSIS:')[1]
      ?.split('SUGGESTIONS FOR IMPROVEMENT:')[0]
      .trim()
      // Remove only asterisks while preserving other formatting
      .replace(/\*\*/g, '')
      // Ensure proper line breaks are maintained
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return {
      promptResult: answer,
      response: deepAnalysis,
      scores,
      suggestions,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
} 