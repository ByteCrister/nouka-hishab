import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlossButtonProps = ButtonProps & {
  tone?: "red" | "green" | "river";
};

export function GlossButton({ tone = "red", className, ...props }: GlossButtonProps) {
  return (
    <Button
      className={cn(
        "gloss-sheen border-0 text-sand-50",
        tone === "red" && "bg-gloss-red shadow-gloss-red hover:brightness-105",
        (tone === "green" || tone === "river") && "bg-gloss-green shadow-gloss-green hover:brightness-105",
        className
      )}
      {...props}
    />
  );
}


