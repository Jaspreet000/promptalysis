import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: {
    postId: string;
  };
}

export async function POST(
  req: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const { content } = await req.json();
    
    const post = await Post.findById(context.params.postId);
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    post.comments.push({
      author: session.user.id,
      content
    });

    await post.save();
    
    const updatedPost = await Post.findById(context.params.postId)
      .populate('comments.author', 'name image');
      
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 