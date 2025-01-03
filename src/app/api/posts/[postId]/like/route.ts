import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
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

    const userLikeIndex = post.likes.indexOf(session.user.id);
    
    // Toggle like
    if (userLikeIndex > -1) {
      // Unlike
      post.likes.splice(userLikeIndex, 1);
    } else {
      // Like
      post.likes.push(session.user.id);
    }

    await post.save();

    // Return updated post with populated author
    const updatedPost = await Post.findById(params.postId).populate("author");
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error handling like:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 