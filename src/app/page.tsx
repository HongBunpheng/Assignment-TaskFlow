"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{hint}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const tasksQ = useQuery({ queryKey: ["tasks"], queryFn: api.tasks });

  const tasks = tasksQ.data ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = 0; // optional: you can compute from dueDate if you want

  return (
    <AppShell activePath="/">
      <div>
        <div className="text-2xl font-semibold">Dashboard</div>
        <div className="text-muted-foreground">Welcome back</div>

        {tasksQ.isLoading ? (
          <div className="mt-6 grid gap-4">
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
            <div className="mt-6 grid gap-4">
              <StatCard label="Total Tasks" value={total} hint="from last week" />
              <StatCard label="Completed" value={completed} hint="from last week" />
              <StatCard label="In Progress" value={inProgress} hint="from last week" />
              <StatCard label="Overdue" value={overdue} hint="from last week" />
            </div>

            <Card className="mt-6 p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Recent Tasks</div>
                <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
                  View all
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {tasks.slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="block rounded-md border p-4 hover:bg-muted"
                  >
                    <div className="font-medium">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.status}</div>
                  </Link>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
