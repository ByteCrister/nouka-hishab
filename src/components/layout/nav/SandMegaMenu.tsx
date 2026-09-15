"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ChevronDown, 
  LayoutDashboard, 
  Anchor, 
  Wallet, 
  CircleDollarSign
} from "lucide-react";

export function SandMegaMenu() {
  const t = useTranslations("nav");

  const sandLinks = [
    { href: "/sand", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/sand/trips", label: t("trips"), icon: Anchor },
    { href: "/sand/sales", label: t("sales"), icon: CircleDollarSign },
    { href: "/sand/payments", label: t("payments"), icon: Wallet },
  ];

  return (
    <div className="relative group/menu">
      <button className="flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-river-500 transition-colors h-16 outline-none">
        {t("sand")}
        <ChevronDown className="w-4 h-4 transition-transform group-hover/menu:rotate-180 text-ink-400 group-hover/menu:text-river-500" />
      </button>

      {/* Invisible bridge to prevent hover gap issues */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
        <div className="w-[600px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-river-100 p-6 grid grid-cols-2 gap-2">
          {sandLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-river-50 transition-colors group/item"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sand-50 border border-sand-100 flex items-center justify-center text-ink-500 group-hover/item:text-river-600 group-hover/item:bg-white group-hover/item:border-river-200 transition-colors shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900 group-hover/item:text-river-700 transition-colors">
                    {link.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
