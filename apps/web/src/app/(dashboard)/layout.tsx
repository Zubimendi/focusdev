import Link from "next/link";
import LogoutButton from "@/components/auth/logout-button";
import { getServerSession } from "next-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Focus</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block px-6 py-2 text-gray-700 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/tasks" className="block px-6 py-2 text-gray-700 hover:bg-gray-100">
            Tasks
          </Link>
          <Link href="/profile" className="block px-6 py-2 text-gray-700 hover:bg-gray-100">
            Profile
          </Link>
          <div className="mt-auto pt-4 border-t">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  );
}
