"use client";

import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { SignInDialog } from "@/components/shared/signin/SigninDialog";
import { GlossButton } from "@/components/shared/gloss-button";

interface MarketingCTAProps {
  signInText: string;
  dashboardText: string;
  className?: string;
  tone?: "red" | "green" | "river";
}

export function MarketingCTA({ signInText, dashboardText, className, tone = "red" }: MarketingCTAProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  if (isAuthenticated) {
    return (
      <GlossButton asChild tone={tone} className={className}>
        <Link href="/boats">{dashboardText}</Link>
      </GlossButton>
    );
  }

  return (
    <SignInDialog>
      <GlossButton tone={tone} className={className}>
        {signInText}
      </GlossButton>
    </SignInDialog>
  );
}


