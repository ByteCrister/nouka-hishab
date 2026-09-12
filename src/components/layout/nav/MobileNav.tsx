"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Menu, User, LogOut, Ship, LayoutDashboard, Anchor, CircleDollarSign, Wallet, Wrench, FileSpreadsheet, Trash2, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { LogoutDialog } from "@/components/shared/logout/LogoutDialog";
import { Separator } from "@/components/ui/separator";
import { SignInDialog } from "@/components/shared/signin/SigninDialog";
import { Logo } from "@/components/marketing/logo";

interface MobileNavProps {
  isAuthenticated: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function MobileNav({ isAuthenticated, user }: MobileNavProps) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [isSandOpen, setIsSandOpen] = useState(false);

  const sandLinks = [
    { href: "/sand", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/sand/boats", label: t("boats"), icon: Ship },
    { href: "/sand/trips", label: t("trips"), icon: Anchor },
    { href: "/sand/sales", label: t("sales"), icon: CircleDollarSign },
    { href: "/sand/payments", label: t("payments"), icon: Wallet },
    { href: "/sand/maintenance", label: t("maintenance"), icon: Wrench },
    { href: "/sand/reports", label: t("reports"), icon: FileSpreadsheet },
    { href: "/sand/recyclebin", label: t("recyclebin"), icon: Trash2 },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden p-2 -mr-2 text-ink-700 hover:text-river-500 transition-colors outline-none">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="text-left mb-6 mt-4">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-6">
          {/* Public Links */}
          <div className="flex flex-col space-y-4">
            <Link href="/how-it-works" onClick={() => setOpen(false)} className="text-base font-medium text-ink-700 hover:text-river-500 transition-colors">
              {t("howItWorks")}
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className="text-base font-medium text-ink-700 hover:text-river-500 transition-colors">
              {t("pricing")}
            </Link>
            <Link href="/stories" onClick={() => setOpen(false)} className="text-base font-medium text-ink-700 hover:text-river-500 transition-colors">
              {t("stories")}
            </Link>
          </div>

          {isAuthenticated && (
            <>
              <Separator />
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => setIsSandOpen(!isSandOpen)}
                  className="flex items-center justify-between w-full text-sm font-bold text-ink-400 uppercase tracking-wider outline-none"
                >
                  {t("sand")}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSandOpen ? "rotate-180" : ""}`} />
                </button>
                {isSandOpen && (
                  <div className="flex flex-col space-y-4 pt-2 pl-3 ml-1 border-l-2 border-river-100">
                    {sandLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center gap-3 text-base font-medium text-ink-700 hover:text-river-500 transition-colors">
                          <Icon className="w-5 h-5 opacity-70" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col space-y-4 pb-8">
            {isAuthenticated ? (
              <>
                <div className="py-2 mb-2">
                  <p className="font-bold text-ink-900">{user?.name || user?.email?.split('@')[0] || "User"}</p>
                  <p className="text-sm text-ink-500 truncate">{user?.email}</p>
                </div>
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 text-base font-medium text-ink-700 hover:text-river-500 transition-colors">
                  <User className="w-5 h-5 opacity-70" />
                  {t("profile")}
                </Link>
                <LogoutDialog>
                  <button className="flex items-center gap-3 text-base font-medium text-red-600 hover:text-red-700 transition-colors text-left outline-none">
                    <LogOut className="w-5 h-5 opacity-70" />
                    {t("logout")}
                  </button>
                </LogoutDialog>
              </>
            ) : (
              <SignInDialog>
                <button className="text-left text-base font-bold text-river-600 hover:text-river-700 transition-colors outline-none">
                  {t("signIn")}
                </button>
              </SignInDialog>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
