import { getSession } from "@/lib/auth-utils";
import TaskList from "@/components/dashboard/task-list";
import FocusTimer from "@/components/dashboard/focus-timer";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name || session?.user?.email}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FocusTimer />
        <TaskList />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Active Tasks</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Focus Hours</h3>
          <p className="text-3xl font-bold mt-2">12.5</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Current Streak</h3>
          <p className="text-3xl font-bold mt-2">4 days</p>
        </div>
      </div>
    </div>
  );
}
