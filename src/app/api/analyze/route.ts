import { NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/gemini";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/analysis";

export async function POST(request: Request) {
  try {
    const { prompt, mode, userId } = await request.json();

    if (!prompt || !mode) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const analysis = await analyzePrompt(prompt, mode);

    // Save to database if user is logged in
    if (userId) {
      await connectDB();
      await Analysis.create({
        userId,
        prompt,
        mode,
        ...analysis,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 