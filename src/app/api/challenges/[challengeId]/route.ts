import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  context: { params: { challengeId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const challenge = await Challenge.findById(context.params.challengeId);
    
    if (!challenge) {
      return new NextResponse("Challenge not found", { status: 404 });
    }

    // Check if the user is the author of the challenge
    if (challenge.author.toString() !== session.user.id) {
      return new NextResponse("Not authorized to delete this challenge", { status: 403 });
    }

    await Challenge.findByIdAndDelete(context.params.challengeId);
    return new NextResponse("Challenge deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
