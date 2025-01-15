import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RequestContext {
  params: {
    challengeId: string;
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: RequestContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const challenge = await Challenge.findById(params.challengeId);
    
    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the challenge
    if (challenge.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this challenge" },
        { status: 403 }
      );
    }

    await Challenge.findByIdAndDelete(params.challengeId);
    
    return NextResponse.json(
      { message: "Challenge deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
