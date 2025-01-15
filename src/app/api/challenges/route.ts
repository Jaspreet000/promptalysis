import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/challenge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = category ? { category } : {};

    const challenges = await Challenge.find(query)
      .populate({
        path: 'author',
        select: 'name image _id',
        transform: (doc) => ({
          id: doc._id.toString(),
          name: doc.name,
          image: doc.image
        })
      })
      .populate('submissions.author', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const { title, description, prompt, category, deadline } = await request.json();

    if (!title || !description || !prompt || !category || !deadline) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const challenge = await Challenge.create({
      title,
      description,
      prompt,
      category,
      deadline: new Date(deadline),
      author: session.user.id,
      submissions: [],
      createdAt: new Date()
    });

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('author', 'name image');

    return NextResponse.json(populatedChallenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 