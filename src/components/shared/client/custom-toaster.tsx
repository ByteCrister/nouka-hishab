"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function CustomToaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-sand-50 group-[.toaster]:text-ink-700 group-[.toaster]:border-border group-[.toaster]:shadow-gloss-md dark:group-[.toaster]:bg-ink-900 dark:group-[.toaster]:text-sand-50",
          description: "group-[.toast]:text-ink-500 dark:group-[.toast]:text-sand-200",
          actionButton:
            "group-[.toast]:bg-river-500 group-[.toast]:text-sand-50 dark:group-[.toast]:bg-river-500",
          cancelButton:
            "group-[.toast]:bg-sand-200 group-[.toast]:text-ink-700 dark:group-[.toast]:bg-ink-700 dark:group-[.toast]:text-sand-50",
          error: "group-[.toaster]:bg-gloss-red group-[.toaster]:text-sand-50 group-[.toaster]:border-none group-[.toaster]:shadow-gloss-red gloss-sheen",
          success: "group-[.toaster]:bg-gloss-green group-[.toaster]:text-sand-50 group-[.toaster]:border-none group-[.toaster]:shadow-gloss-green gloss-sheen",
        },
      }}
      {...props}
    />
  );
}


