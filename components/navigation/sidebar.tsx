"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
}

const gettingStartedItems: NavItem[] = [
  { title: "About Us", href: "/about" },
  { title: "How it Works", href: "/how-it-works"},
  { title: "Changelog", href: "/changelog" },
  { title: "Feedback", href: "/feedback" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-l p-6 hidden md:block">
      <nav className="space-y-6">
        <div>
          <div className="mb-4 text-sm font-medium">
            <Link href={'/'}>Getting Started</Link>
          </div>
          <div className="space-y-1">
            {gettingStartedItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center py-1.5 text-sm hover:text-primary ${
                  pathname === item.href
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* <footer className="absolute bottom-0 mb-4">
        <div className="flex items-center gap-2 text-xl font-semibold">
          Pwd ramn diay mag create tag another interface para sa logout 
          nya i reuse to nato ag fetch data naa sa sidebar
        </div>
      </footer> */}
    </aside>
  );
}
