import { cn } from "@/lib/utils";

type LedgerLine = { label: string; value: string; positive?: boolean };

type LedgerCardProps = {
  title: string;
  tag?: string;
  lines: LedgerLine[];
  totalLabel: string;
  totalValue: string;
  className?: string;
};

export function LedgerCard({ title, tag, lines, totalLabel, totalValue, className }: LedgerCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-ink-700)]/10 bg-gradient-to-br from-white to-[var(--color-sand-50)] p-5",
        "shadow-gloss-md",
        className
      )}
    >
      <div className="mb-3.5 flex items-center justify-between border-b border-dashed border-[var(--color-ink-700)]/15 pb-3.5">
        <span className="font-display text-base font-semibold text-[var(--color-ink-700)]">{title}</span>
        {tag && (
          <span className="rounded-full bg-[var(--color-river-500)]/10 px-2.5 py-1 text-xs font-extrabold text-[var(--color-river-700)]">
            {tag}
          </span>
        )}
      </div>
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between py-2 text-[13.5px]">
          <span className="text-[var(--color-ink-500)]/75">{line.label}</span>
          <span className={cn("font-bold", line.positive && "text-[var(--color-river-700)]")}>{line.value}</span>
        </div>
      ))}
      <div className="mt-2.5 flex items-baseline justify-between border-t border-[var(--color-ink-700)]/10 pt-3">
        <span className="text-[13.5px] font-bold">{totalLabel}</span>
        <span className="font-display text-xl font-semibold text-[var(--color-sindoor-700)]">{totalValue}</span>
      </div>
    </div>
  );
}


