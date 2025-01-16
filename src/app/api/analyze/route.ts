import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/analysis";
import { analyzePrompt } from "@/lib/gemini";

export const maxDuration = 60; // Set max duration to 60 seconds (Vercel hobby plan limit)
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session user:", {
      id: session?.user?.id,
      email: session?.user?.email,
    });

    const { prompt, mode } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await analyzePrompt(prompt, mode);
    console.log("Analysis result:", result);

    // Return immediately if no user session
    if (!session?.user?.id) {
      return NextResponse.json({
        scores: result.scores,
        response: result.response,
        promptResult: result.promptResult,
        suggestions: result.suggestions
      });
    }

    // Save analysis in background
    try {
      await connectDB();
      const analysisData = {
        author: session.user.id,
        prompt,
        mode,
        scores: result.scores,
        response: result.response || result.promptResult || "No response generated",
        suggestions: result.suggestions || [],
      };

      const analysis = await Analysis.create(analysisData);
      
      return NextResponse.json({
        ...result,
        _id: analysis._id,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Still return the analysis result even if saving fails
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt" },
      { status: 500 }
    );
  }
} 