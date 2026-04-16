"use client";

import Link from "next/link";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import { useState } from "react";

type NavLink = { href: string; label: string } | { label: string; submenu: { href: string; label: string }[] };

export default function NavClient({ links, activeHref, session }: { links: NavLink[]; activeHref?: string; session: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: { href: string; label: string }[]) => {
    return submenu.some(sub => activeHref?.startsWith(sub.href));
  };

  return (
    <>
      <nav className="flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => {
            if ("submenu" in l) {
              const isActive = isSubmenuActive(l.submenu);
              return (
                <div key={l.label} className="relative group">
                  <button className={`transition-colors flex items-center gap-1 ${isActive ? "text-violet-400" : "text-gray-400 hover:text-gray-200"}`}>
                    {l.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 min-w-[160px]">
                      {l.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            activeHref === sub.href ? "text-violet-400 bg-gray-800" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors ${activeHref === l.href ? "text-violet-400" : "text-gray-400 hover:text-gray-200"}`}
              >
                {l.label}
              </Link>
            );
          })}
          {session ? (
            <UserMenu email={session.user?.email || ""} name={session.user?.name} />
          ) : (
            <Link
              href="/sign-in"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-400 hover:text-gray-200 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-gray-900 rounded-lg border border-gray-800 py-2">
          {links.map((l) => {
            if ("submenu" in l) {
              const isActive = isSubmenuActive(l.submenu);
              return (
                <div key={l.label} className="border-b border-gray-800 last:border-0">
                  <div className={`px-4 py-2 text-sm font-medium ${isActive ? "text-violet-400" : "text-gray-500"}`}>{l.label}</div>
                  {l.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block px-6 py-2 text-sm transition-colors ${
                        activeHref === sub.href ? "text-violet-400 bg-gray-800" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-4 py-2 text-sm transition-colors ${
                  activeHref === l.href ? "text-violet-400 bg-gray-800" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
          {session ? (
              <div className="border-t border-gray-800 mt-2 pt-2">
                <UserMenu email={session.user?.email || ""} name={session.user?.name} />
              </div>
            ) : (
              <div className="border-t border-gray-800 mt-2 pt-2 px-4">
                <Link
                  href="/sign-in"
                  className="block text-sm text-violet-400 hover:text-violet-300 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
        </div>
      )}
    </>
  );
}
