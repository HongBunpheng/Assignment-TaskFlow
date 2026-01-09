export const API_BASE = "http://localhost:3001";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export type Project = {
  id: number;
  name: string;
  description?: string;
  dueDate?: string | null;
};

export type Task = {
  id: number;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Done";
  priority?: "Low" | "Medium" | "High";
  projectId: number;
  assignee?: string;
  dueDate?: string;
  commentsCount?: number;
  attachmentsCount?: number;
};

export const api = {
  projects: () => fetchJson<Project[]>(`${API_BASE}/projects`),
  project: (id: number) => fetchJson<Project>(`${API_BASE}/projects/${id}`),

  tasks: () => fetchJson<Task[]>(`${API_BASE}/tasks`),
  task: (id: number) => fetchJson<Task>(`${API_BASE}/tasks/${id}`),
  tasksByProject: (projectId: number) =>
    fetchJson<Task[]>(`${API_BASE}/tasks?projectId=${projectId}`),
};
