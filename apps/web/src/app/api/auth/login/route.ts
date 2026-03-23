import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { LoginSchema } from "@focus/shared";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input using shared schema
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    await connectToDatabase();

    // Find user and include password
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT for mobile/client use
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
