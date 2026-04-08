import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SavedWorkflows from "@/components/dashboard/SavedWorkflows";
import AdvancedWorkflowBuilder from "@/components/dashboard/AdvancedWorkflowBuilder";
import UserMenu from "@/components/UserMenu";
import Logo from "@/components/Logo";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-violet-400 font-bold text-lg flex items-center gap-2"><Logo size={24} />ltx workflow</Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300 text-sm">Dashboard</span>
        </div>
        <UserMenu email={session.user?.email!} name={session.user?.name} />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Plan</p>
          <p className="font-semibold text-violet-400">Free</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Prompts Enhanced</p>
          <p className="font-semibold">Unlimited</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Saved Workflows</p>
          <p className="font-semibold">Cloud Sync</p>
        </div>
      </section>

      <AdvancedWorkflowBuilder userId={session.user?.id ?? ""} />
      <SavedWorkflows userId={session.user?.id ?? ""} />
    </main>
  );
}
