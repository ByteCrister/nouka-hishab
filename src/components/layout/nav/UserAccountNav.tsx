"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutDialog } from "@/components/shared/logout/LogoutDialog";
import { User, LogOut } from "lucide-react";

import { useProfileStore } from "@/store/useProfileStore";
import { useSession } from "next-auth/react";

export function UserAccountNav() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const { profile } = useProfileStore();

  const name = profile?.profile?.fullName || session?.user?.name;
  const email = profile?.email || session?.user?.email;
  const image = profile?.avatarUrl || session?.user?.image;

  const initials = name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center outline-none">
        <Avatar className="h-9 w-9 border border-river-200 transition-opacity hover:opacity-80">
          <AvatarImage src={image || ""} alt={name || "User avatar"} />
          <AvatarFallback className="bg-river-100 text-river-900 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {name && <p className="font-medium">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-sm text-ink-500">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer w-full flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutDialog>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </LogoutDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


