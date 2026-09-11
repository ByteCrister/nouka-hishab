"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";

function StoreHydrator() {
  const { status } = useSession();
  const { fetchProfile, clearProfile } = useProfileStore();

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      clearProfile();
    }
  }, [status, fetchProfile, clearProfile]);

  return null;
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreHydrator />
      {children}
    </SessionProvider>
  );
}
