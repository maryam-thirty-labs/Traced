"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Compass, Calendar, Sprout, User } from "lucide-react";
import { useMe } from "@/shared/lib/auth/MeContext";

type NavItem = { href: string; label: string; icon: typeof Compass };

const EXPLORER_ITEM: NavItem = { href: "/explorer", label: "Explorer", icon: Compass };

const ACTIVATED_ITEMS: readonly NavItem[] = [
  EXPLORER_ITEM,
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/etymology", label: "Roots", icon: Sprout },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function SideRail() {
  const pathname = usePathname();
  const { me } = useMe();

  const activated = me?.learning_activated === true;
  const items = activated ? ACTIVATED_ITEMS : [EXPLORER_ITEM];

  return (
    <nav className="flex h-full w-[52px] flex-col items-center border-r border-border-default bg-surface-panel py-4 gap-6">
      <Link
        href={activated ? "/today" : "/explorer"}
        className="text-xl font-bold text-accent-text"
        aria-label="Traced home"
      >
        T
      </Link>

      <div className="flex flex-col items-center gap-4 mt-2">
        {items.map(({ href, label, icon: Icon }) => {
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
