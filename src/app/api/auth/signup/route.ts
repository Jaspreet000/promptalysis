import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    await connectDB();

    const exists = await User.findOne({ email });
    if (exists) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 