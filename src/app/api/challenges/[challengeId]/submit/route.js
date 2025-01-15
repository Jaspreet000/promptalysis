import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Missing content", { status: 400 });
    }

    const challenge = await Challenge.findById(context.params.challengeId);

    if (!challenge) {
      return new NextResponse("Challenge not found", { status: 404 });
    }

    // Check if challenge deadline has passed
    if (new Date(challenge.deadline) < new Date()) {
      return new NextResponse("Challenge deadline has passed", { status: 400 });
    }

    // Check if user has already submitted
    const existingSubmission = challenge.submissions.find(
      (sub) => sub.author.toString() === session.user.id
    );

    if (existingSubmission) {
      return new NextResponse("You have already submitted to this challenge", {
        status: 400,
      });
    }

    challenge.submissions.push({
      author: session.user.id,
      content,
      score: 0,
      feedback: "",
      createdAt: new Date(),
    });

    await challenge.save();

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate("author", "name image")
      .populate("submissions.author", "name image");

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error("Error submitting to challenge:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
