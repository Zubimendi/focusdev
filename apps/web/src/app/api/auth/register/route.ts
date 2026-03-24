import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { RegisterSchema } from "@focus/shared";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input using shared schema
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user — wrapped in try/catch for E11000 race condition failsafe
    try {
      const user = await UserModel.create({
        email: normalizedEmail,
        name,
        password: hashedPassword,
      });

      return NextResponse.json(
        { message: "User registered successfully", userId: user._id },
        { status: 201 }
      );
    } catch (createError: any) {
      // MongoDB duplicate key error (race condition failsafe)
      if (createError.code === 11000) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      throw createError;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Registration error:", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
