import Link from "next/link";
import { auth } from "@/auth";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";

const links = [
  { href: "/guide", label: "Guide" },
  { href: "/models", label: "Models" },
  { href: "/workflows", label: "Workflows" },
  { href: "/changelog", label: "Changelog" },
  { href: "/feedback", label: "Feedback" },
];

export default async function Nav({ activeHref }: { activeHref?: string }) {
  const session = await auth();

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-violet-400 font-bold text-lg flex items-center gap-2">
          <Logo size={24} />ltx workflow
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={activeHref === l.href ? "text-white font-medium" : "text-gray-400 hover:text-gray-200 transition-colors"}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {session?.user ? (
        <UserMenu email={session.user.email!} name={session.user.name} />
      ) : (
        <Link href="/sign-in">
          <button className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">
            Sign In
          </button>
        </Link>
      )}
    </header>
  );
}
