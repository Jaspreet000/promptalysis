import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { analyzePrompt } from "@/lib/gemini";
import Analysis from "@/models/analysis";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user:", {
      id: session.user.id,
      email: session.user.email,
    });

    await connectDB();

    const { prompt, mode } = await request.json();

    if (!prompt || !mode) {
      return NextResponse.json(
        { error: "Prompt and mode are required" },
        { status: 400 }
      );
    }

    const result = await analyzePrompt(prompt, mode);
    console.log("Analysis result:", {
      scores: result.scores,
      suggestions: result.suggestions?.length,
    });

    // Validate scores
    if (!result.scores || typeof result.scores !== 'object') {
      throw new Error('Invalid scores received from analysis');
    }

    type ScoreKey = 'style' | 'grammar' | 'creativity' | 'clarity' | 'relevance';
    const requiredScores: ScoreKey[] = ['style', 'grammar', 'creativity', 'clarity', 'relevance'];
    for (const score of requiredScores) {
      if (typeof result.scores[score] !== 'number') {
        result.scores[score] = 0;
      }
    }

    // Create analysis record
    const analysisData = {
      author: new mongoose.Types.ObjectId(session.user.id),
      prompt,
      mode,
      scores: result.scores,
      response: result.response || '',
      suggestions: result.suggestions || [],
    };

    console.log("Creating analysis with data:", {
      ...analysisData,
      author: analysisData.author.toString(),
    });

    const analysis = await Analysis.create(analysisData);

    if (!analysis) {
      throw new Error('Failed to create analysis record');
    }

    console.log("Created analysis:", {
      id: analysis._id?.toString(),
      author: analysis.author?.toString(),
      mode: analysis.mode,
      scores: analysis.scores,
    });

    // Return the analysis result and ID in the format expected by the frontend
    return NextResponse.json({
      _id: analysis._id.toString(),
      scores: result.scores,
      response: result.response,
      suggestions: result.suggestions,
      promptResult: result.promptResult, // Direct answer to the prompt
      aiResponse: result.response, // The analysis
    });

  } catch (error) {
    console.error("Analysis error:", error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze prompt";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 