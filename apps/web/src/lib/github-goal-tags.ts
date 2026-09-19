/**
 * Structured commit tags for FocusDev goal attribution.
 *
 * Convention — include one of these in the commit subject:
 *   [fd:career] Harden login rate limits
 *   (fd:api-auth) Add JWT middleware
 *   fd:career: ship password reset
 *
 * Tags are lowercase slugs matching a goal's `commitTag` for that project's linked repo.
 */

const TAG_PATTERNS = [
  /\[fd:([a-z0-9][a-z0-9-]{0,47})\]/i,
  /\(fd:([a-z0-9][a-z0-9-]{0,47})\)/i,
  /(?:^|\s)fd:([a-z0-9][a-z0-9-]{0,47})(?::|\s|$)/i,
];

export function slugifyCommitTag(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "goal";
}

/** Extract the first FocusDev tag from a commit message, if any. */
export function parseCommitTag(message: string): string | null {
  if (!message) return null;
  for (const pattern of TAG_PATTERNS) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1].toLowerCase();
  }
  return null;
}

export function formatCommitTemplate(commitTag: string, summary = "Describe the work"): string {
  return `[fd:${commitTag}] ${summary}`;
}

/** Ensure uniqueness among existing tags; append -2, -3, … if needed. */
export function uniqueCommitTag(
  desired: string,
  existing: Iterable<string>,
  exclude?: string
): string {
  const taken = new Set(
    Array.from(existing)
      .map((t) => t.toLowerCase())
      .filter((t) => t && t !== exclude?.toLowerCase())
  );
  const tag = slugifyCommitTag(desired);
  if (!taken.has(tag)) return tag;
  for (let i = 2; i < 100; i++) {
    const candidate = `${tag.slice(0, 44)}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${tag.slice(0, 40)}-${Date.now().toString(36)}`;
}
