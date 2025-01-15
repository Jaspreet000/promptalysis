import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Template from "@/models/template";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = category ? { category } : {};

    const posts = await Post.find(query)
      .populate({
        path: 'author',
        select: 'name image _id',
        transform: (doc) => ({
          id: doc._id.toString(),
          name: doc.name,
          image: doc.image
        })
      })
      .populate({
        path: 'comments.author',
        select: 'name image _id',
        transform: (doc) => ({
          id: doc._id.toString(),
          name: doc.name,
          image: doc.image
        })
      })
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
    const body = await request.json();
    const { title, content, prompt, category, fromTemplate } = body;

    const post = await Post.create({
      title,
      content,
      prompt,
      category,
      author: session.user.id,
      fromTemplate
    });

    if (fromTemplate) {
      await Template.findByIdAndUpdate(fromTemplate, {
        $inc: { usageCount: 1 }
      });
    }

    const populatedPost = await Post.findById(post._id)
      .populate({
        path: 'author',
        select: 'name image _id',
        transform: (doc) => ({
          id: doc._id.toString(),
          name: doc.name,
          image: doc.image
        })
      });

    return NextResponse.json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 