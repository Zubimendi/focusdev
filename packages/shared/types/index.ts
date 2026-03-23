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
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
