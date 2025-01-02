import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const post = await Post.findById(params.postId).populate("author");

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Check if the user is the author of the post
    if (post.author.id !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Post.findByIdAndDelete(params.postId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 