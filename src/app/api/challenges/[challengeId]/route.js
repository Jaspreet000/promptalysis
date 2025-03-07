import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const challenge = await Challenge.findById(context.params.challengeId);

    if (!challenge) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized to delete this challenge" },
        { status: 403 }
      );
    }

    await Challenge.findByIdAndDelete(context.params.challengeId);
    return NextResponse.json(
      { message: "Challenge deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
