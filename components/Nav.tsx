"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const links = [
  { href: "/guide", label: "Guide" },
  { href: "/models", label: "Models" },
  { href: "/workflows", label: "Workflows" },
];

export default function Nav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-violet-400 font-bold text-lg flex items-center gap-2">
          <Logo size={24} />ltx workflow
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={pathname === l.href ? "text-white font-medium" : "text-gray-400 hover:text-gray-200 transition-colors"}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {rightSlot}
    </header>
  );
}
