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

    const { content } = await req.json();
    if (!content || content.trim().length === 0) {
      return new NextResponse("Comment content is required", { status: 400 });
    }

    await connectDB();
    const post = await Post.findById(params.postId);

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Add new comment
    post.comments.push({
      content,
      author: {
        id: session.user.id,
        name: session.user.name || "",
        image: session.user.image || "",
      },
      createdAt: new Date(),
    });

    await post.save();

    // Return updated post with populated author
    const updatedPost = await Post.findById(params.postId)
      .populate("author")
      .populate("comments.author");
      
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 