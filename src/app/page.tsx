"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="relative p-4">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </div>

      <div className="absolute bottom-4 right-4 rounded-full bg-muted p-2">
        {icon}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const tasksQ = useQuery({
    queryKey: ["tasks"],
    queryFn: api.tasks
  });

  const tasks = tasksQ.data ?? [];
  const total = tasks.length;

  const completed = tasks.filter(
    (t) => t.status === "done"
  ).length;

  const inProgress = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;

  const today = new Date();

  const overdue = tasks.filter((t) => {
    if (t.status === "done") return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  return (
    <AppShell activePath="/">
      <div>
        {tasksQ.isLoading ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : tasksQ.isError ? (
          <Card className="mt-6 p-5">
            <div className="font-medium">Couldn’t load dashboard</div>
            <div className="text-sm text-muted-foreground">
              Make sure JSON Server is running on port 3001.
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Tasks"
                value={total}
                hint="from last week"
                icon={"📋"}
              />
              <StatCard
                label="Completed"
                value={completed}
                hint="from last week"
                icon={"✅"}
              />
              <StatCard
                label="In Progress"
                value={inProgress}
                hint="from last week"
                icon={"⏳"}
              />
              <StatCard
                label="Overdue"
                value={overdue}
                hint="from last week"
                icon={"🚩"}
              />
            </div>

            <Card className="mt-6 p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Recent Tasks</div>
                <Link
                  href="/tasks"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        readOnly
                        className="h-4 w-4"
                      />
                      <div>
                        <div
                          className={`font-medium ${task.status === "done"
                            ? "line-through text-muted-foreground"
                            : ""
                            }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Project #{task.projectId}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs capitalize
          ${task.status === "done"
                          ? "border-emerald-500 text-emerald-600"
                          : task.status === "in-progress"
                            ? "border-orange-500 text-orange-600"
                            : "border-gray-400 text-gray-600"
                        }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
