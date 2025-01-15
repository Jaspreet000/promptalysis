import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Template from "@/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = category ? { category } : {};

    const templates = await Template.find(query)
      .populate({
        path: 'author',
        select: 'name image _id',
        transform: (doc) => ({
          id: doc._id.toString(),
          name: doc.name,
          image: doc.image
        })
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
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
    const { title, content, category, difficulty, tags } = await request.json();

    if (!title || !content || !category || !difficulty) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await Template.create({
      title,
      content,
      category,
      difficulty,
      tags: tags || [],
      author: session.user.id,
      usageCount: 0,
      likes: [],
      createdAt: new Date()
    });

    const populatedTemplate = await Template.findById(template._id)
      .populate('author', 'name image');

    return NextResponse.json(populatedTemplate);
  } catch (error) {
    console.error("Error creating template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 