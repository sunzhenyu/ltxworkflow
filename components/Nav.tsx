import Logo from "@/components/Logo";
import NavClient, { type NavLink } from "@/components/NavClient";

const links: NavLink[] = [
  // Primary CTA — the paid feature, drawn as a button so users see it first.
  { href: "/generate", label: "Generate", primary: true },
  { href: "/models", label: "Downloads" },
  { href: "/workflows", label: "Workflows" },
  { href: "/pricing", label: "Pricing" },
  {
    label: "Resources",
    submenu: [
      { href: "/guide", label: "Guide" },
      { href: "/blog", label: "Blog" },
      { href: "/resources/tutorials", label: "Tutorials" },
      { href: "/resources/community", label: "Community" },
      { href: "/resources/showcase", label: "Showcase" },
      { href: "/resources/research", label: "Research" },
      { href: "/resources/tools", label: "Tools" },
    ],
  },
  // Removed from nav: "Pro Pack" (/pack). Route still works for SEO and any
  // bookmarks; just no longer surfaced as a top-level destination.
];

export default function Nav({ activeHref }: { activeHref?: string }) {
  // Logo import kept so layout-shared assets resolve at build time even though
  // it's used inside NavClient.
  void Logo;
  return <NavClient links={links} activeHref={activeHref} />;
}
