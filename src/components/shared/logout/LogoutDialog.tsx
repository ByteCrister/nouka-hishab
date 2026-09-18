"use client";

import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LogoutDialog({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("confirmLogout")}</DialogTitle>
        </DialogHeader>
        <DialogFooter className="mt-4 flex sm:justify-end gap-3 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            {t("logout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


