"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = Number(params.id);

    const projectQuery = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => api.project(projectId),
        enabled: !Number.isNaN(projectId)
    });

    const tasksQuery = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => api.tasksByProject(projectId),
        enabled: !Number.isNaN(projectId)
    });

    if (projectQuery.isLoading || tasksQuery.isLoading) {
        return (
            <AppShell activePath="/projects">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-24 w-full mb-6" />
                <Skeleton className="h-64 w-full" />
            </AppShell>
        );
    }

    if (projectQuery.isError || !projectQuery.data) {
        return (
            <AppShell activePath="/projects">
                <Card className="p-4">Project not found</Card>
            </AppShell>
        );
    }

    const project = projectQuery.data;
    const tasks = tasksQuery.data ?? [];

    const completed = tasks.filter(t => t.status === "done").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const todo = tasks.filter(t => t.status === "todo").length;

    return (
        <AppShell activePath="/projects">
            <div className="mb-4 text-sm text-muted-foreground">
                <Link href="/projects" className="hover:underline">
                    Projects
                </Link>{" "}
                / {project.name}
            </div>

            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">{project.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {project.description}
                    </p>
                </div>

            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Tasks" value={tasks.length} color="text-black" />
                <StatCard label="Completed" value={completed} color="text-emerald-600" />
                <StatCard label="In Progress" value={inProgress} color="text-orange-500" />
                <StatCard label="To Do" value={todo} color="text-gray-500" />
            </div>

            <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Tasks</h2>

                    <div className="flex gap-6 text-sm">
                        <span className="font-medium border-b-2 border-black">
                            All
                        </span>
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                            Active
                        </span>
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                            Completed
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded border flex items-center justify-center">
                                    {task.status === "done" && (
                                        <div className="h-2 w-2 rounded bg-black" />
                                    )}
                                </div>

                                <span
                                    className={
                                        task.status === "done"
                                            ? "line-through text-muted-foreground"
                                            : "font-medium"
                                    }
                                >
                                    {task.title}
                                </span>
                            </div>

                            <Badge
                                variant="outline"
                                className={
                                    task.status === "done"
                                        ? "border-emerald-500 text-emerald-600"
                                        : task.status === "in-progress"
                                            ? "border-orange-500 text-orange-600"
                                            : "border-gray-400 text-gray-600"
                                }
                            >
                                {task.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-1">Team Members</h2>
                <div className="flex items-center gap-3">
                    <Avatar initials="JD" />
                    <div>
                        <div className="text-sm font-medium">John Doe</div>
                        <div className="text-xs text-muted-foreground">Lead</div>
                    </div>
                </div>
            </Card>
        </AppShell>
    );
}

function StatCard({
    label,
    value,
    color
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <Card className="p-4 text-center">
            <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </Card>
    );
}

function Avatar({ initials }: { initials: string }) {
    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
            {initials}
        </div>
    );
}
