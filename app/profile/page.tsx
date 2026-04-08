import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <Nav rightSlot={<UserMenu email={session.user?.email!} name={session.user?.name} />} />

      <section className="bg-gray-900 rounded-xl p-6 space-y-6">
        <h1 className="text-xl font-bold">Profile</h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-bold">
            {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{session.user?.name || "—"}</p>
            <p className="text-sm text-gray-400">{session.user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-800 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Email</span>
            <span>{session.user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Name</span>
            <span>{session.user?.name || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Plan</span>
            <span className="text-violet-400">Free</span>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <Link href="/dashboard">
            <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
