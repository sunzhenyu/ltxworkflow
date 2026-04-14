import Link from "next/link";
import Logo from "@/components/Logo";
import { auth } from "@/auth";
import NavClient from "@/components/NavClient";

const links = [
  { href: "/models", label: "Models" },
  { href: "/workflows", label: "Workflows" },
  { href: "/guide", label: "Guide" },
  {
    label: "Resources",
    submenu: [
      { href: "/blog", label: "Blog" },
      { href: "/changelog", label: "Release Notes" },
    ]
  },
];

export default async function Nav({ activeHref }: { activeHref?: string }) {
  const session = await auth();

  return <NavClient links={links} activeHref={activeHref} session={session} />;
}
