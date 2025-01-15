import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Template from "@/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const template = await Template.findById(params.templateId);
    
    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    template.usageCount += 1;
    await template.save();
    
    const updatedTemplate = await Template.findById(template._id)
      .populate('author', 'name image');

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error tracking template usage:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 