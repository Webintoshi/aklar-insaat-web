"use client";

import { Bell, ChevronDown, Menu, UserRound } from "lucide-react";

type HeaderProps = {
  user: {
    name: string;
    email: string;
  };
  onMenu: () => void;
};

export function Header({ user, onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[#e0e2e6] bg-white px-5 sm:px-7">
      <button
        type="button"
        aria-label="Menüyü aç"
        onClick={onMenu}
        className="rounded-md p-2 text-[#22252c] transition hover:bg-[#f4f4f5]"
      >
        <Menu className="h-5 w-5 stroke-[1.7]" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Bildirimler"
          className="rounded-md p-2 text-[#262930] transition hover:bg-[#f4f4f5]"
        >
          <Bell className="h-5 w-5 stroke-[1.7]" aria-hidden="true" />
        </button>
        <div className="hidden min-w-0 items-center gap-3 sm:flex">
          <div className="min-w-0 text-right">
            <p className="max-w-44 truncate text-[13px] font-medium text-[#202229]">
              {user.name}
            </p>
            <p className="max-w-44 truncate text-[11px] text-[#6f7480]">Site Yöneticisi</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eceef1] text-[#969ba5]">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <ChevronDown className="h-4 w-4 text-[#5f646e]" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
