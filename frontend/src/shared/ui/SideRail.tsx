"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Compass, BookOpen, BarChart3, User, MessageSquare, Swords } from "lucide-react";

const navItems = [
  { href: "/explorer", label: "Explorer", icon: Compass },
  { href: "/cases", label: "Cases", icon: BookOpen },
  { href: "/multiplayer", label: "Multiplayer", icon: Swords },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function SideRail() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-[52px] flex-col items-center border-r border-border-default bg-surface-panel py-4 gap-6">
      <Link
        href="/explorer"
        className="text-xl font-bold text-accent-text"
        aria-label="Traced home"
      >
        T
      </Link>

      <div className="flex flex-col items-center gap-4 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                isActive
                  ? "bg-accent-muted text-accent-text glow-purple"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
