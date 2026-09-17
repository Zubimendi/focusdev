import { NextResponse } from "next/server";
import { connectToDatabase } from "@focus/db";
import { FocusSessionModel, TaskModel, ProjectModel } from "@focus/db/models";
import { getAuthenticatedUser } from "@/lib/auth-middleware";
import mongoose from "mongoose";
import {
  startOfDay,
  subDays,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
  format,
} from "date-fns";

export const dynamic = "force-dynamic";

type Range = "week" | "month" | "year";

function sessionMinutes(s: {
  startTime: Date;
  endTime?: Date;
  duration?: number;
}) {
  if (typeof s.duration === "number" && s.duration > 0) return s.duration;
  if (s.endTime) {
    return Math.max(
      0,
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000
    );
  }
  return 0;
}

function getRangeBounds(range: Range, now = new Date()) {
  if (range === "month") {
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }
  if (range === "year") {
    return { start: startOfYear(now), end: endOfYear(now) };
  }
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

function getPreviousRangeBounds(range: Range, now = new Date()) {
  if (range === "month") {
    const prev = subDays(startOfMonth(now), 1);
    return { start: startOfMonth(prev), end: endOfMonth(prev) };
  }
  if (range === "year") {
    const prev = new Date(now.getFullYear() - 1, 0, 1);
    return { start: startOfYear(prev), end: endOfYear(prev) };
  }
  const prevWeekRef = subDays(startOfWeek(now, { weekStartsOn: 1 }), 1);
  return {
    start: startOfWeek(prevWeekRef, { weekStartsOn: 1 }),
    end: endOfWeek(prevWeekRef, { weekStartsOn: 1 }),
  };
}

function formatChange(current: number, previous: number, asPercent = true) {
  if (previous === 0) {
    if (current === 0) return "0";
    return asPercent ? "+100%" : `+${current}`;
  }
  if (asPercent) {
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }
  const diff = current - previous;
  return diff >= 0 ? `+${diff}` : `${diff}`;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "week";
    const range: Range =
      rangeParam === "month" || rangeParam === "year" ? rangeParam : "week";
    const projectId = searchParams.get("projectId") || undefined;

    const now = new Date();
    const { start, end } = getRangeBounds(range, now);
    const prev = getPreviousRangeBounds(range, now);
    const heatmapStart = subDays(startOfDay(now), 49);

    const sessionFilter: Record<string, unknown> = {
      userId: user.id,
      startTime: { $gte: heatmapStart },
    };
    if (projectId) sessionFilter.projectId = projectId;

    const sessions = await FocusSessionModel.find(sessionFilter);

    const rangeSessions = sessions.filter((s) => {
      const t = new Date(s.startTime);
      return t >= start && t <= end;
    });
    const prevSessions = sessions.filter((s) => {
      const t = new Date(s.startTime);
      return t >= prev.start && t <= prev.end;
    });

    const heatmap = Array.from({ length: 50 }).map((_, i) => {
      const date = subDays(startOfDay(now), 49 - i);
      const daySessions = sessions.filter((s) =>
        isSameDay(new Date(s.startTime), date)
      );
      return Math.min(daySessions.length, 4);
    });

    const dayCount =
      range === "week" ? 7 : range === "month" ? differenceInCalendarDays(end, start) + 1 : 14;
    const barDays = Math.min(dayCount, range === "year" ? 12 : dayCount);

    let last7Days: {
      day: string;
      height: string;
      minutes: number;
      color: string;
    }[];

    if (range === "year") {
      last7Days = Array.from({ length: 12 }).map((_, i) => {
        const monthDate = new Date(now.getFullYear(), i, 1);
        const monthSessions = rangeSessions.filter(
          (s) => new Date(s.startTime).getMonth() === i
        );
        const totalMinutes = monthSessions.reduce(
          (acc, s) => acc + sessionMinutes(s),
          0
        );
        const maxMinutes = 480 * 20;
        const height = Math.min((totalMinutes / maxMinutes) * 100, 100);
        return {
          day: format(monthDate, "MMM"),
          height: `${height}%`,
          minutes: Math.round(totalMinutes),
          color:
            height > 70
              ? "bg-primary"
              : height > 30
                ? "bg-secondary"
                : "bg-primary/40",
        };
      });
    } else {
      last7Days = Array.from({ length: barDays }).map((_, i) => {
        const dayDate =
          range === "week"
            ? subDays(startOfDay(now), 6 - i)
            : startOfDay(
                new Date(
                  start.getFullYear(),
                  start.getMonth(),
                  start.getDate() + i
                )
              );
        const daySessions = rangeSessions.filter((s) =>
          isSameDay(new Date(s.startTime), dayDate)
        );
        const totalMinutes = daySessions.reduce(
          (acc, s) => acc + sessionMinutes(s),
          0
        );
        const maxMinutes = 480;
        const height = Math.min((totalMinutes / maxMinutes) * 100, 100);
        return {
          day: range === "week" ? format(dayDate, "EEE") : format(dayDate, "d"),
          height: `${height}%`,
          minutes: Math.round(totalMinutes),
          color:
            height > 70
              ? "bg-primary"
              : height > 30
                ? "bg-secondary"
                : "bg-primary/40",
        };
      });
    }

    const totalFocusMinutes = rangeSessions.reduce(
      (acc, s) => acc + sessionMinutes(s),
      0
    );
    const prevFocusMinutes = prevSessions.reduce(
      (acc, s) => acc + sessionMinutes(s),
      0
    );

    const taskQuery: Record<string, unknown> = {
      userId: user.id,
      status: "done",
      updatedAt: { $gte: start, $lte: end },
    };
    const prevTaskQuery: Record<string, unknown> = {
      userId: user.id,
      status: "done",
      updatedAt: { $gte: prev.start, $lte: prev.end },
    };
    if (projectId) {
      taskQuery.projectId = projectId;
      prevTaskQuery.projectId = projectId;
    }

    const [completedTasks, prevCompletedTasks] = await Promise.all([
      TaskModel.countDocuments(taskQuery),
      TaskModel.countDocuments(prevTaskQuery),
    ]);

    let currentStreak = 0;
    for (let i = 0; i < 50; i++) {
      const date = subDays(startOfDay(now), i);
      const hasSession = sessions.some((s) =>
        isSameDay(new Date(s.startTime), date)
      );
      if (hasSession) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    // Best day / longest session / focus score
    const byDayMinutes = new Map<string, number>();
    for (const s of rangeSessions) {
      const key = startOfDay(new Date(s.startTime)).toISOString();
      byDayMinutes.set(key, (byDayMinutes.get(key) || 0) + sessionMinutes(s));
    }
    let bestDayLabel = "—";
    let bestDayMinutes = 0;
    Array.from(byDayMinutes.entries()).forEach(([key, mins]) => {
      if (mins > bestDayMinutes) {
        bestDayMinutes = mins;
        bestDayLabel = format(new Date(key), "EEEE");
      }
    });

    let longestSessionMinutes = 0;
    for (const s of rangeSessions) {
      longestSessionMinutes = Math.max(longestSessionMinutes, sessionMinutes(s));
    }

    const daysInRange = Math.max(1, differenceInCalendarDays(end, start) + 1);
    const avgMinutesPerDay = totalFocusMinutes / daysInRange;
    const focusScore = Math.min(100, Math.round((avgMinutesPerDay / 240) * 100));

    // Per-project breakdown
    const projectFocus = new Map<string, number>();
    for (const s of rangeSessions) {
      if (!s.projectId) continue;
      const pid = String(s.projectId);
      projectFocus.set(pid, (projectFocus.get(pid) || 0) + sessionMinutes(s));
    }

    const userObjectId = new mongoose.Types.ObjectId(user.id);
    const doneByProject = await TaskModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: "done",
          updatedAt: { $gte: start, $lte: end },
          ...(projectId
            ? { projectId: new mongoose.Types.ObjectId(projectId) }
            : { projectId: { $ne: null } }),
        },
      },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);
    const tasksByProject = new Map(
      doneByProject.map((r: { _id: unknown; count: number }) => [
        String(r._id),
        r.count,
      ])
    );

    const allProjectIds = Array.from(
      new Set([
        ...Array.from(projectFocus.keys()),
        ...Array.from(tasksByProject.keys()),
      ])
    );
    const projectDocs = allProjectIds.length
      ? await ProjectModel.find({ _id: { $in: allProjectIds } }).select(
          "name color"
        )
      : [];
    const projectNameMap = new Map(
      projectDocs.map((p) => [String(p._id), { name: p.name, color: p.color }])
    );

    const byProject = allProjectIds
      .map((pid) => ({
        projectId: pid,
        name: projectNameMap.get(pid)?.name || "Unknown",
        color: projectNameMap.get(pid)?.color || "#2d6a5e",
        focusMinutes: Math.round(projectFocus.get(pid) || 0),
        tasksDone: tasksByProject.get(pid) || 0,
      }))
      .sort((a, b) => b.focusMinutes - a.focusMinutes);

    const peakHours = (() => {
      const hourBuckets = Array.from({ length: 24 }, () => 0);
      for (const s of rangeSessions) {
        hourBuckets[new Date(s.startTime).getHours()] += sessionMinutes(s);
      }
      let peakStart = 10;
      let peakSum = 0;
      for (let h = 0; h <= 20; h++) {
        const sum = hourBuckets[h] + hourBuckets[h + 1] + hourBuckets[h + 2] + hourBuckets[h + 3];
        if (sum > peakSum) {
          peakSum = sum;
          peakStart = h;
        }
      }
      const fmt = (h: number) => {
        const ampm = h >= 12 ? "PM" : "AM";
        const hr = h % 12 || 12;
        return `${hr}:00 ${ampm}`;
      };
      return { start: fmt(peakStart), end: fmt(peakStart + 4) };
    })();

    return NextResponse.json({
      range,
      period: { start: start.toISOString(), end: end.toISOString() },
      heatmap,
      last7Days,
      byProject,
      highlights: {
        bestDay: bestDayLabel,
        bestDayMinutes: Math.round(bestDayMinutes),
        longestSession: formatMinutes(longestSessionMinutes),
        longestSessionMinutes: Math.round(longestSessionMinutes),
        focusScore,
        peakHours,
      },
      summary: [
        {
          label: "Focus Hours",
          value: `${(totalFocusMinutes / 60).toFixed(1)}h`,
          change: formatChange(totalFocusMinutes, prevFocusMinutes, true),
          icon: "schedule",
          color: "text-primary",
        },
        {
          label: "Sessions",
          value: rangeSessions.length.toString(),
          change: formatChange(rangeSessions.length, prevSessions.length, false),
          icon: "bolt",
          color: "text-secondary",
        },
        {
          label: "Tasks Done",
          value: completedTasks.toString(),
          change: formatChange(completedTasks, prevCompletedTasks, false),
          icon: "check_circle",
          color: "text-tertiary",
        },
        {
          label: "Current Streak",
          value: `${currentStreak}d`,
          change: currentStreak > 0 ? "🔥" : "—",
          icon: "local_fire_department",
          color: "text-error",
        },
      ],
      totals: {
        focusMinutes: Math.round(totalFocusMinutes),
        sessionCount: rangeSessions.length,
        tasksDone: completedTasks,
        streak: currentStreak,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
