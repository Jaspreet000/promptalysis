import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: {
    postId: string;
  };
}

export async function DELETE(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const post = await Post.findById(context.params.postId);
    
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== session.user.id) {
      return new NextResponse("Not authorized to delete this post", { status: 403 });
    }

    await Post.findByIdAndDelete(context.params.postId);
    return new NextResponse("Post deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 