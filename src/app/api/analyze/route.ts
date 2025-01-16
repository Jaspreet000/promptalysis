import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/analysis";
import { analyzePrompt } from "@/lib/gemini";

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

    if (session?.user?.id) {
      await connectDB();

      const analysisData = {
        author: session.user.id,
        prompt,
        mode,
        scores: result.scores,
        response: result.promptResult || result.response || "No response generated",
        suggestions: result.suggestions || [],
      };

      console.log("Creating analysis with data:", analysisData);

      const analysis = await Analysis.create(analysisData);
      return NextResponse.json(analysis);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt" },
      { status: 500 }
    );
  }
} 