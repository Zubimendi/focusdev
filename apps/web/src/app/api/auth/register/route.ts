import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { RegisterSchema } from "@focus/shared";

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const body = await req.json();
    console.log(`[auth/register] ← request email=${body?.email ?? "(missing)"}`);

    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      console.log(`[auth/register] ✕ 400 invalid input`, validation.error.flatten());
      return NextResponse.json(
        {
          error:
            "Invalid input. Use a strong password (10+ chars with upper, lower, number, special).",
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();
    console.log(`[auth/register] mongo connected (${Date.now() - started}ms)`);

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[auth/register] ✕ 409 email already exists: ${normalizedEmail}`);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const user = await UserModel.create({
        email: normalizedEmail,
        name,
        password: hashedPassword,
      });

      console.log(
        `[auth/register] ✓ 201 created userId=${user._id} (${Date.now() - started}ms)`
      );
      return NextResponse.json(
        { message: "User registered successfully", userId: user._id },
        { status: 201 }
      );
    } catch (createError: unknown) {
      if (
        createError &&
        typeof createError === "object" &&
        "code" in createError &&
        createError.code === 11000
      ) {
        console.log(`[auth/register] ✕ 409 duplicate key: ${normalizedEmail}`);
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      throw createError;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[auth/register] ✕ 500 ${message}`);
    // Do not leak exception text to clients
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
