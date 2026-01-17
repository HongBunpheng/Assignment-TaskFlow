export const API_BASE = "http://localhost:3001";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export type Project = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  dueDate?: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags?: string[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  comments: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }[];
};


export const api = {
  projects: () => fetchJson<Project[]>(`${API_BASE}/projects`),
  project: (id: string | number) =>
    fetchJson<Project>(`${API_BASE}/projects/${id}`),

  tasks: () => fetchJson<Task[]>(`${API_BASE}/tasks`),
  task: (id: string | number) => fetchJson<Task>(`${API_BASE}/tasks/${id}`),
  tasksByProject: (projectId: string | number) =>
    fetchJson<Task[]>(`${API_BASE}/tasks?projectId=${projectId}`),

  updateTask: (id: string | number, patch: Partial<Task>) =>
    fetchJson<Task>(`${API_BASE}/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  createTask: (task: Task) =>
    fetchJson<Task>(`${API_BASE}/tasks`, {
      method: "POST",
      body: JSON.stringify(task),
    }),
};
