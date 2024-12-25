import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const { content } = await request.json();
    
    const post = await Post.findById(params.postId);
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    post.comments.push({
      author: session.user.id,
      content
    });

    await post.save();
    
    const updatedPost = await Post.findById(params.postId)
      .populate('comments.author', 'name image');
      
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 