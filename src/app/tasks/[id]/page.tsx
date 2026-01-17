"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCheckbox } from "@/components/task-checkbox";

type Task = Awaited<ReturnType<typeof api.task>>;
type Subtask = Task["subtasks"][number];
type Comment = Task["comments"][number];

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const taskQ = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.task(id),
    enabled: Boolean(id),
  });

  const updateTaskM = useMutation({
    mutationFn: (patch: Partial<Task>) => api.updateTask(id, patch),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["task", id] }),
        qc.invalidateQueries({ queryKey: ["tasks"] }),
      ]);
    },
  });

  if (taskQ.isLoading) {
    return (
      <AppShell activePath="/tasks">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppShell>
    );
  }

  if (taskQ.isError || !taskQ.data) {
    return (
      <AppShell activePath="/tasks">
        <Card className="p-5">
          <div className="font-medium">Task not found</div>
        </Card>
      </AppShell>
    );
  }

  const task = taskQ.data;

  return (
    <AppShell activePath="/tasks">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* HEADER */}
          <Card className="p-6">
            <h1 className="text-2xl font-semibold">{task.title}</h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">{task.status}</Badge>
              <span>Due {formatDate(task.dueDate)}</span>
            </div>

            {task.description && (
              <p className="mt-4 text-sm text-muted-foreground">
                {task.description}
              </p>
            )}
          </Card>

          {/* SUBTASKS */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Subtasks</h3>
              <span className="text-xs text-muted-foreground">
                {
                  task.subtasks?.filter((s: Subtask) => s.completed).length
                }{" "}
                of {task.subtasks?.length ?? 0} completed
              </span>
            </div>

            <div className="space-y-3">
              {task.subtasks?.map((s: Subtask) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <TaskCheckbox
                    checked={s.completed}
                    disabled={updateTaskM.isPending}
                    onCheckedChange={(checked) => {
                      const nextSubtasks = (task.subtasks ?? []).map((st) =>
                        st.id === s.id ? { ...st, completed: checked } : st
                      );

                      const completedCount = nextSubtasks.filter(
                        (st) => st.completed
                      ).length;

                      const nextStatus: Task["status"] =
                        completedCount === 0
                          ? "todo"
                          : completedCount === nextSubtasks.length
                            ? "done"
                            : "in-progress";

                      updateTaskM.mutate({
                        subtasks: nextSubtasks,
                        status: nextStatus,
                      });
                    }}
                  />
                  <span
                    className={`text-sm ${s.completed
                      ? "line-through text-muted-foreground"
                      : ""
                      }`}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* COMMENTS */}
          <Card className="p-6">
            <h3 className="font-medium mb-4">
              Comments ({task.comments?.length ?? 0})
            </h3>

            <div className="space-y-4">
              {task.comments?.map((c: Comment) => (
                <div key={c.id}>
                  <div className="text-sm font-medium">{c.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <p className="mt-1 text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <Card className="p-6 space-y-4 sticky top-20 h-fit">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="font-medium">{task.status}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Priority</div>
            <div className="font-medium">{task.priority}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Project</div>
            <div className="font-medium">
              Project #{task.projectId}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Due date</div>
            <div className="font-medium">{formatDate(task.dueDate)}</div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}