import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { title, content, prompt, category } = body;

    const post = await Post.create({
      title,
      content,
      prompt,
      category,
      author: session.user.id
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 