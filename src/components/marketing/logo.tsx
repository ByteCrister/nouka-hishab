import { Sailboat } from "lucide-react";

// Intentionally locale-invariant — do not wrap any part of this in t().
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="logo-mark gloss-sheen bg-gloss-green shadow-gloss-green w-8 h-8 rounded-lg flex items-center justify-center relative z-10">
        <Sailboat className="w-5 h-5 text-sand-50" />
      </div>
      <span className="font-display text-xl font-semibold">
        <span className="text-river-500">Nouka</span>
        <span className="text-sindoor-500">Hishab</span>
      </span>
    </div>
  );
}
