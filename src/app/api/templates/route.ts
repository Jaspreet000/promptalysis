import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Template from "@/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = category ? { category } : {};

    const templates = await Template.find(query)
      .populate('author', 'name image')
      .sort({ usageCount: -1 });

    return NextResponse.json(templates);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const template = await Template.create({
      ...body,
      author: session.user.id,
      usageCount: 0
    });

    return NextResponse.json(template);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 