"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskCheckbox } from "@/components/task-checkbox";

type Filter = "all" | "todo" | "in-progress" | "done";

function statusStyle(status: string) {
    switch (status) {
        case "done":
            return "border-emerald-500 text-emerald-600 bg-emerald-50";
        case "in-progress":
            return "border-orange-500 text-orange-600 bg-orange-50";
        case "todo":
        default:
            return "border-gray-400 text-gray-600 bg-gray-50";
    }
}

export default function TasksPage() {
    const [filter, setFilter] = useState<Filter>("all");
    const qc = useQueryClient();

    const tasksQ = useQuery({
        queryKey: ["tasks"],
        queryFn: api.tasks,
    });

    const toggleTaskStatusM = useMutation({
        mutationFn: async ({ id, nextStatus }: { id: string; nextStatus: "todo" | "done" }) =>
            api.updateTask(id, { status: nextStatus }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["tasks"] });
        }
    });

    const tasks = tasksQ.data ?? [];

    const filteredTasks =
        filter === "all"
            ? tasks
            : tasks.filter((t) => t.status === filter);

    return (
        <AppShell activePath="/tasks">
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">All Tasks</h1>
                        <p className="text-sm text-muted-foreground">
                            {tasks.length} total tasks
                        </p>
                    </div>

                </div>

                <div className="mt-4 flex gap-2">
                    {[
                        { label: "All", value: "all" },
                        { label: "To Do", value: "todo" },
                        { label: "In Progress", value: "in-progress" },
                        { label: "Done", value: "done" },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value as Filter)}
                            className={`rounded-md px-3 py-1.5 text-sm border
                ${filter === tab.value
                                    ? "bg-black text-white border-black"
                                    : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Card className="mt-4 p-2">
                    {tasksQ.isLoading ? (
                        <div className="space-y-3 p-3">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                    ) : tasksQ.isError ? (
                        <div className="p-4 text-sm text-red-500">
                            Failed to load tasks. Is JSON Server running?
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredTasks.map((task) => (
                                <Link
                                    href={`/tasks/${task.id}`}
                                    key={task.id}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <TaskCheckbox
                                            checked={task.status === "done"}
                                            disabled={toggleTaskStatusM.isPending}
                                            onCheckedChange={(checked) => {
                                                const nextStatus = checked ? "done" : "todo";
                                                toggleTaskStatusM.mutate({
                                                    id: task.id,
                                                    nextStatus
                                                });
                                            }}
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
                                                {task.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge
                                            variant="outline"
                                            className={`capitalize ${statusStyle(task.status)}`}
                                        >
                                            {task.status}
                                        </Badge>

                                        <div className="text-xs text-muted-foreground">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "No date"}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {filteredTasks.length === 0 && (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    No tasks found
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </AppShell>
    );
}
