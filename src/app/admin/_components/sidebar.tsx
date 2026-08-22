"use client";

import {
  FileText,
  FolderKanban,
  Gauge,
  Image,
  LogOut,
  MessageCircle,
  MessageSquare,
  Settings2,
  X,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

const navigation = [
  { name: "Genel Bakış", href: "/admin", icon: Gauge },
  { name: "Projeler", href: "/admin/projects", icon: FolderKanban },
  { name: "Medya Merkezi", href: "/admin/media", icon: Image },
  { name: "Site İçerikleri", href: "/admin/content", icon: FileText },
  { name: "Mesajlar", href: "/admin/messages", icon: MessageSquare },
  { name: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { name: "SEO ve Ayarlar", href: "/admin/settings", icon: Settings2 },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-[#e0e2e6] bg-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[138px] items-center justify-between px-6">
          <NextImage
            src="/logoypng_48.png"
            alt="Aklar İnşaat"
            width={186}
            height={58}
            className="h-auto w-[184px] object-contain"
            priority
          />
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={onClose}
            className="rounded-md p-2 text-[#555b66] hover:bg-[#f3f3f4] lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Admin menüsü" className="flex-1 space-y-1 px-3 py-1">
          {navigation.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex h-12 items-center gap-4 rounded-md px-5 text-[14px] font-medium transition-colors focus-visible:outline-offset-[-2px] ${
                  active
                    ? "bg-[#fff2f2] text-[#d40000]"
                    : "text-[#20232a] hover:bg-[#f6f6f7]"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-3 top-0 h-full w-[3px] bg-[#d40000]"
                  />
                )}
                <item.icon className="h-[19px] w-[19px] stroke-[1.7]" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 pb-10 pt-5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-11 w-full items-center gap-4 rounded-md px-3 text-sm font-medium text-[#22252c] transition hover:bg-[#f6f6f7]"
          >
            <LogOut className="h-5 w-5 stroke-[1.7]" aria-hidden="true" />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}
