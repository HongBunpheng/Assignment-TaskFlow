"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const tabs = ["All", "To Do", "In Progress", "Done"] as const;
type Tab = (typeof tabs)[number];

export default function TasksPage() {
    const [tab, setTab] = useState<Tab>("All");
    const [q, setQ] = useState("");

    const tasksQ = useQuery({ queryKey: ["tasks"], queryFn: api.tasks });

    const filtered = useMemo(() => {
        const list = tasksQ.data ?? [];
        return list
            .filter((t) => (tab === "All" ? true : t.status === tab))
            .filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
    }, [tasksQ.data, tab, q]);

    return (
        <AppShell activePath="/tasks">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-semibold">Tasks</div>
                    <div className="text-muted-foreground">
                        {tasksQ.data?.length ?? 0} total tasks
                    </div>
                </div>

                <div className="w-65">
                    <Input
                        placeholder="Search tasks..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                {tabs.map((t) => (
                    <Button
                        key={t}
                        variant={tab === t ? "default" : "outline"}
                        onClick={() => setTab(t)}
                    >
                        {t}
                    </Button>
                ))}
            </div>

            <Card className="mt-5 p-3">
                {tasksQ.isLoading ? (
                    <div className="space-y-3 p-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : tasksQ.isError ? (
                    <div className="p-4">
                        <div className="font-medium">Failed to load tasks</div>
                        <div className="text-sm text-muted-foreground">
                            Run: <span className="font-mono">npm run server</span>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filtered.map((task) => (
                            <Link
                                key={task.id}
                                href={`/tasks/${task.id}`}
                                className="block p-4 hover:bg-muted"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {task.description ?? "No description"}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            task.status === "Done"
                                                ? "secondary"
                                                : task.status === "In Progress"
                                                    ? "default"
                                                    : "outline"
                                        }
                                    >
                                        {task.status}
                                    </Badge>
                                </div>
                            </Link>
                        ))}

                        {filtered.length === 0 && (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                No tasks found.
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </AppShell>
    );
}
