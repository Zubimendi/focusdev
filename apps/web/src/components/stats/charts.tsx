"use client";

interface BarPoint {
  label: string;
  value: number;
}

export function FocusBarChart({
  points,
  accent = "var(--primary, #2d6a5e)",
}: {
  points: BarPoint[];
  accent?: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const w = 560;
  const h = 180;
  const pad = { l: 8, r: 8, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const gap = 6;
  const barW = points.length
    ? (innerW - gap * (points.length - 1)) / points.length
    : 0;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48" role="img" aria-label="Focus minutes by day">
      {points.map((p, i) => {
        const bh = (p.value / max) * innerH;
        const x = pad.l + i * (barW + gap);
        const y = pad.t + innerH - bh;
        return (
          <g key={`${p.label}-${i}`}>
            <rect
              x={x}
              y={y}
              width={Math.max(barW, 2)}
              height={Math.max(bh, 2)}
              rx={4}
              fill={accent}
              opacity={p.value > 0 ? 0.9 : 0.18}
            >
              <title>
                {p.label}: {Math.round(p.value)}m
              </title>
            </rect>
            <text
              x={x + barW / 2}
              y={h - 8}
              textAnchor="middle"
              className="fill-on-surface-variant"
              fontSize={10}
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function FocusLineChart({
  points,
  accent = "var(--primary, #2d6a5e)",
}: {
  points: BarPoint[];
  accent?: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const w = 560;
  const h = 180;
  const pad = { l: 8, r: 8, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const coords = points.map((p, i) => {
    const x = pad.l + i * step;
    const y = pad.t + innerH - (p.value / max) * innerH;
    return { x, y, ...p };
  });
  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${d} L ${coords[coords.length - 1]?.x ?? 0} ${pad.t + innerH} L ${coords[0]?.x ?? 0} ${pad.t + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48" role="img" aria-label="Focus trend">
      <path d={area} fill={accent} opacity={0.12} />
      <path d={d} fill="none" stroke={accent} strokeWidth={2.5} strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={`${c.label}-${i}`}>
          <circle cx={c.x} cy={c.y} r={3} fill={accent} />
          <text
            x={c.x}
            y={h - 8}
            textAnchor="middle"
            className="fill-on-surface-variant"
            fontSize={10}
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function ProjectDonut({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  if (total <= 0) return null;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0" role="img" aria-label="Focus by project">
        <g transform="rotate(-90 60 60)">
          {slices.map((s) => {
            const frac = s.value / total;
            const dash = frac * c;
            const el = (
              <circle
                key={s.label}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
        </g>
      </svg>
      <ul className="flex flex-col gap-1.5 min-w-0">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate text-on-surface">{s.label}</span>
            <span className="ml-auto font-mono text-xs text-on-surface-variant">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
