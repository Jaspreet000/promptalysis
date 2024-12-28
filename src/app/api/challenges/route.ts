import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const challenges = await Challenge.find()
      .populate('author', 'name image')
      .populate('submissions.author', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json(challenges);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const challenge = await Challenge.create({
      ...body,
      author: session.user.id
    });

    return NextResponse.json(challenge);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 