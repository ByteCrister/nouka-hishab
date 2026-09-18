"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { ProfileLoading } from "./ProfileLoading";
import { ProfileDetails } from "./ProfileDetails";
import { ProfileImage } from "./ProfileImage";
import { StaggerContainer, StaggerItem } from "@/components/wrappers/motion-wrappers";
import { useTranslations } from "next-intl";

export const ProfileView = () => {
  const { fetchProfile, isLoading, profile, error } = useProfileStore();
  const t = useTranslations("profile");

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show loading during initial mount (no profile, no error) or while fetching
  if (isLoading || (!profile && !error)) {
    return <ProfileLoading />;
  }

  // Show error state if there's an explicit error or we somehow failed to load a profile
  if (error || !profile) {
    return (
      <div className="p-8 text-center bg-[var(--color-sand-50)] dark:bg-[var(--color-ink-900)] text-[var(--color-ink-600)] dark:text-[var(--color-sand-200)] rounded-xl border border-[var(--color-sand-200)] dark:border-[var(--color-ink-700)]">
        <h3 className="font-semibold text-lg">{t("failedToLoad")}</h3>
        <p className="mt-2 text-sm">{t("refreshPrompt")}</p>
        <button 
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-[var(--color-sand-200)] dark:bg-[var(--color-ink-700)] hover:bg-[var(--color-sand-300)] dark:hover:bg-[var(--color-ink-500)] rounded-md transition"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StaggerItem className="col-span-1">
        <ProfileImage />
      </StaggerItem>
      <StaggerItem className="col-span-2">
        <ProfileDetails />
      </StaggerItem>
    </StaggerContainer>
  );
};


