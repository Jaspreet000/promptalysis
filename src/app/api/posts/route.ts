import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = category ? { category } : {};

    const posts = await Post.find(query)
      .populate('author', 'name image')
      .populate('comments.author', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
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
    const { title, content, prompt, category } = await request.json();

    if (!title || !content || !category) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const post = await Post.create({
      title,
      content,
      prompt,
      category,
      author: session.user.id,
      likes: [],
      comments: []
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name image');

    return NextResponse.json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 