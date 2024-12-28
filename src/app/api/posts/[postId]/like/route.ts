import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const post = await Post.findById(params.postId);
    
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const hasLiked = post.likes.includes(session.user.id);
    
    if (hasLiked) {
      post.likes = post.likes.filter((id: string) => id.toString() !== session.user.id);
    } else {
      post.likes.push(session.user.id);
    }

    await post.save();
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error toggling like:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 