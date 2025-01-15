import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, context) {
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

    const comment = post.comments.id(context.params.commentId);
    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== session.user.id) {
      return new NextResponse("Not authorized to delete this comment", {
        status: 403,
      });
    }

    post.comments.pull({ _id: context.params.commentId });
    await post.save();

    return new NextResponse("Comment deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
