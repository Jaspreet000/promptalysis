import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const { content } = await req.json();
    
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
    console.error("Error adding comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 