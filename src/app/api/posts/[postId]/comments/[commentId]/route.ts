import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string; commentId: string } }
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

    // Check if the user is the author of the comment
    const commentDoc = await Post.findOne(
      { _id: params.postId, "comments._id": params.commentId },
      { "comments.$": 1 }
    ).populate('comments.author', '_id');

    if (!commentDoc || !commentDoc.comments[0]) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    const comment = commentDoc.comments[0];
    if (comment.author._id.toString() !== session.user.id) {
      return new NextResponse("Not authorized to delete this comment", { status: 403 });
    }

    // Remove the comment
    await Post.updateOne(
      { _id: params.postId },
      { $pull: { comments: { _id: params.commentId } } }
    );

    const updatedPost = await Post.findById(params.postId)
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
      });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 