import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Template from "@/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
  params: {
    templateId: string;
  };
};

export async function DELETE(
  request: Request,
  props: Props
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const template = await Template.findById(props.params.templateId);
    
    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Check if the user is the author of the template
    if (template.author.toString() !== session.user.id) {
      return new NextResponse("Not authorized to delete this template", { status: 403 });
    }

    await Template.findByIdAndDelete(props.params.templateId);
    return new NextResponse("Template deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 