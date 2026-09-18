import { cn } from "@/lib/utils";

type WaveDividerProps = {
  fill: string; // tailwind color class or CSS variable/color, e.g. "var(--color-background)"
  flip?: boolean;
  className?: string;
};

export function WaveDivider({ fill, flip, className }: WaveDividerProps) {
  return (
    <div className={cn("w-full leading-[0]", flip && "-scale-y-100", className)}>
      <svg viewBox="0 0 1440 80" width="100%" height="64" preserveAspectRatio="none">
        <path
          d="M0,32 C240,80 480,0 720,24 C960,48 1200,72 1440,24 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}


