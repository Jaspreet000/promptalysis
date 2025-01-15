import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  context: { params: { challengeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { challengeId } = context.params;
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return NextResponse.json({ message: "Challenge not found" }, { status: 404 });
    }

    // Check if the user is the author of the challenge
    if (challenge.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized to delete this challenge" },
        { status: 403 }
      );
    }

    await Challenge.findByIdAndDelete(challengeId);
    return NextResponse.json({ message: "Challenge deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
