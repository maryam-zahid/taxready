type ReadinessDonutProps = {
  total: number;
  taxReady: number;
  readyForReview: number;
  inProgress: number;
  blocked: number;
};

const readinessColors = {
  taxReady: "#16a34a",
  readyForReview: "#2563eb",
  inProgress: "#f59e0b",
  blocked: "#dc2626",
  empty: "#e5e7eb",
} as const;

export function ReadinessDonut({
  total,
  taxReady,
  readyForReview,
  inProgress,
  blocked,
}: ReadinessDonutProps) {
  const safeTotal = Math.max(total, 1);

  const taxReadyEnd =
    (taxReady / safeTotal) * 100;

  const reviewEnd =
    taxReadyEnd +
    (readyForReview / safeTotal) * 100;

  const progressEnd =
    reviewEnd +
    (inProgress / safeTotal) * 100;

  const chart =
    total === 0
      ? `${readinessColors.empty} 0% 100%`
      : [
          `${readinessColors.taxReady} 0% ${taxReadyEnd}%`,
          `${readinessColors.readyForReview} ${taxReadyEnd}% ${reviewEnd}%`,
          `${readinessColors.inProgress} ${reviewEnd}% ${progressEnd}%`,
          `${readinessColors.blocked} ${progressEnd}% 100%`,
        ].join(", ");

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center desktop:grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)]">
      <div className="flex justify-center sm:justify-start desktop:justify-center xl:justify-start">
        <div
          className="relative grid size-[164px] shrink-0 place-items-center rounded-full sm:size-[176px]"
          style={{
            background: `conic-gradient(${chart})`,
          }}
          role="img"
          aria-label={`${taxReady} tax ready, ${readyForReview} ready for review, ${inProgress} in progress, ${blocked} blocked`}
        >
          <div className="grid size-[108px] place-items-center rounded-full border border-border/70 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:size-[116px]">
            <div className="text-center">
              <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-foreground">
                {total}
              </p>

              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {total === 1 ? "client" : "clients"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <LegendRow
          label="Tax Ready"
          value={taxReady}
          color={readinessColors.taxReady}
        />

        <LegendRow
          label="Ready for Review"
          value={readyForReview}
          color={readinessColors.readyForReview}
        />

        <LegendRow
          label="In Progress"
          value={inProgress}
          color={readinessColors.inProgress}
        />

        <LegendRow
          label="Blocked"
          value={blocked}
          color={readinessColors.blocked}
        />
      </div>
    </div>
  );
}

function LegendRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-md px-2 py-2">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
        {label}
      </span>

      <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}