export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  token: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: "active" | "paused" | "archived";
  githubRepo?: string;
  githubRepoFullName?: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  taskCounts?: { todo: number; in_progress: number; done: number; total: number };
  focusMinutes?: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  projectId?: string;
  userId: string;
  status: "open" | "met" | "failed";
  periodType?: "week" | "month" | "year";
  periodStart?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}
