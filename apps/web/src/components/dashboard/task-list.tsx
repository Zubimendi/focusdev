"use client";

import { useEffect, useState } from "react";
import { type Task } from "@focus/shared";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, status: "todo", priority: "medium" }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">My Tasks</h2>
      <form onSubmit={addTask} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="p-3 border rounded flex justify-between items-center">
            <span>{task.title}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              task.status === "done" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {task.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
