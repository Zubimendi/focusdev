import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import type { IUserPreferences } from "@focus/db/models/user";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

function serializeUser(user: {
  _id: { toString(): string };
  email: string;
  name?: string;
  image?: string;
  onboardingCompletedAt?: Date;
  preferences?: IUserPreferences;
  twoFactorEnabled?: boolean;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    onboardingCompletedAt: user.onboardingCompletedAt ?? null,
    preferences: user.preferences ?? {},
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
  };
}

async function resolveUserId(req: Request): Promise<string | null> {
  const sessionUser = await getCurrentUser();
  if (sessionUser?.id) {
    return sessionUser.id;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as { id: string };
      return decoded.id;
    } catch {
      return null;
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Me API error:", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name || name.length > 100) {
        return NextResponse.json(
          { error: "Name is required (1–100 characters)" },
          { status: 400 }
        );
      }
      update.name = name;
    }

    if (body?.onboardingCompleted === true) {
      update.onboardingCompletedAt = new Date();
    }

    if (body?.preferences && typeof body.preferences === "object") {
      const prefs = body.preferences as Record<string, unknown>;
      const allowed: (keyof IUserPreferences)[] = [
        "theme",
        "timerDuration",
        "notificationSound",
        "weekStartsOn",
        "notifyReviewDue",
        "notifyStreakRisk",
        "notifyGoalUpdates",
        "notifyHabitDue",
        "notifySecurity",
        "showCharts",
      ];
      const patchPrefs: Partial<IUserPreferences> = {};
      for (const key of allowed) {
        if (prefs[key] !== undefined) {
          (patchPrefs as Record<string, unknown>)[key] = prefs[key];
        }
      }
      for (const [key, value] of Object.entries(patchPrefs)) {
        update[`preferences.${key}`] = value;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Profile update error:", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
