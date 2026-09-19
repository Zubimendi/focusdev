import {
  GoalModel,
  GitContributionModel,
  ProjectModel,
  UserModel,
} from "@focus/db/models";
import { parseCommitTag } from "@/lib/github-goal-tags";
import { createNotification } from "@/lib/notifications";

interface GhCommit {
  sha: string;
  commit: {
    message: string;
    author?: { date?: string };
    committer?: { date?: string };
  };
  html_url?: string;
}

interface SyncOptions {
  userId: string;
  /** Limit sync to one project */
  projectId?: string;
}

export interface SyncResult {
  scanned: number;
  attributed: number;
  newContributions: number;
  goalsUpdated: string[];
  errors: string[];
}

async function githubFetch<T>(
  path: string,
  token: string
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "FocusDev",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, data: null };
  }
  const data = (await res.json()) as T;
  return { ok: true, status: res.status, data };
}

export async function syncGithubGoalContributions(
  options: SyncOptions
): Promise<SyncResult> {
  const result: SyncResult = {
    scanned: 0,
    attributed: 0,
    newContributions: 0,
    goalsUpdated: [],
    errors: [],
  };

  const user = await UserModel.findById(options.userId).select(
    "+githubAccessToken githubUsername name"
  );
  if (!user?.githubAccessToken) {
    result.errors.push("Connect GitHub in Settings (sign in with GitHub once) to sync commits.");
    return result;
  }

  let githubLogin = user.githubUsername;
  if (!githubLogin) {
    const me = await githubFetch<{ login: string }>("/user", user.githubAccessToken);
    if (me.ok && me.data?.login) {
      githubLogin = me.data.login;
      user.githubUsername = githubLogin;
      await user.save();
    }
  }
  if (!githubLogin) {
    result.errors.push("Could not resolve your GitHub username.");
    return result;
  }

  const projectQuery: Record<string, unknown> = {
    ownerId: options.userId,
    githubRepoFullName: { $exists: true, $nin: [null, ""] },
  };
  if (options.projectId) projectQuery._id = options.projectId;

  const projects = await ProjectModel.find(projectQuery);
  if (projects.length === 0) {
    result.errors.push(
      options.projectId
        ? "Link a GitHub repository to this project first."
        : "No projects have a linked GitHub repository."
    );
    return result;
  }

  const projectIds = projects.map((p) => p._id);
  const goals = await GoalModel.find({
    userId: options.userId,
    projectId: { $in: projectIds },
    commitTag: { $exists: true, $nin: [null, ""] },
    status: { $ne: "failed" },
  });

  if (goals.length === 0) {
    result.errors.push(
      "Add a commit tag on a project goal (e.g. [fd:career]) so commits can be attributed."
    );
    return result;
  }

  const goalsByProjectAndTag = new Map<string, (typeof goals)[0]>();
  for (const g of goals) {
    if (!g.projectId || !g.commitTag) continue;
    goalsByProjectAndTag.set(
      `${String(g.projectId)}:${g.commitTag.toLowerCase()}`,
      g
    );
  }

  const updatedGoalIds = new Set<string>();

  for (const project of projects) {
    const repo = project.githubRepoFullName!;
    const encoded = repo
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/");

    const commitsRes = await githubFetch<GhCommit[]>(
      `/repos/${encoded}/commits?author=${encodeURIComponent(githubLogin)}&per_page=50`,
      user.githubAccessToken
    );

    if (!commitsRes.ok || !commitsRes.data) {
      result.errors.push(
        `Could not fetch commits for ${repo} (HTTP ${commitsRes.status}).`
      );
      continue;
    }

    for (const commit of commitsRes.data) {
      result.scanned += 1;
      const message = commit.commit?.message || "";
      const tag = parseCommitTag(message);
      if (!tag) continue;

      const goal = goalsByProjectAndTag.get(`${String(project._id)}:${tag}`);
      if (!goal) continue;

      result.attributed += 1;
      const sha = commit.sha;
      const committedAt = new Date(
        commit.commit.author?.date ||
          commit.commit.committer?.date ||
          Date.now()
      );

      try {
        const existing = await GitContributionModel.findOne({
          userId: options.userId,
          sha,
        });
        if (existing) continue;

        await GitContributionModel.create({
          userId: options.userId,
          projectId: project._id,
          goalId: goal._id,
          repoFullName: repo,
          sha,
          message: message.split("\n")[0].slice(0, 500),
          htmlUrl: commit.html_url,
          committedAt,
          source: "push",
          commitTag: tag,
        });

        result.newContributions += 1;
        const nextValue = (goal.currentValue ?? 0) + 1;
        goal.currentValue = nextValue;
        if (!goal.unit) goal.unit = "commits";
        if (
          goal.targetValue != null &&
          nextValue >= goal.targetValue &&
          goal.status === "open"
        ) {
          goal.status = "met";
        }
        await goal.save();
        updatedGoalIds.add(String(goal._id));
      } catch (err) {
        // Duplicate key race — ignore
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: number }).code === 11000
        ) {
          continue;
        }
        result.errors.push(
          err instanceof Error ? err.message : "Failed to save contribution"
        );
      }
    }
  }

  result.goalsUpdated = [...updatedGoalIds];

  if (result.newContributions > 0) {
    await createNotification({
      userId: options.userId,
      type: "goal_update",
      title: "GitHub contributions synced",
      body: `${result.newContributions} commit${result.newContributions === 1 ? "" : "s"} attributed to your goals.`,
      href: options.projectId
        ? `/projects/${options.projectId}`
        : "/stats",
    });
  }

  return result;
}
