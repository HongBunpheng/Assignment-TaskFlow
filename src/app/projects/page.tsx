"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app-shell";

function projectColor(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("marketing")) return "bg-pink-500";
    if (lower.includes("product")) return "bg-blue-500";
    if (lower.includes("engineering")) return "bg-emerald-500";
    return "bg-gray-400";
}

export default function ProjectsPage() {
    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: api.projects,
    });

    const tasksQuery = useQuery({
        queryKey: ["tasks"],
        queryFn: api.tasks,
    });

    if (projectsQuery.isLoading || tasksQuery.isLoading) {
        return (
            <AppShell activePath="/projects">
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </AppShell>
        );
    }

    if (projectsQuery.isError || tasksQuery.isError) {
        return (
            <AppShell activePath="/projects">
                <Card className="p-4">
                    <div className="font-medium">Failed to load projects</div>
                    <div className="text-sm text-muted-foreground">
                        Make sure JSON Server is running on port 3001.
                    </div>
                </Card>
            </AppShell>
        );
    }

    const projects = projectsQuery.data ?? [];
    const tasks = tasksQuery.data ?? [];

    return (
        <AppShell activePath="/projects">
            <div className="space-y-4">
                {projects.map((project) => {
                    const projectTasks = tasks.filter(
                        (t) => t.projectId === project.id
                    );

                    const totalTasks = projectTasks.length;
                    const completedTasks = projectTasks.filter(
                        (t) => t.status === "done"
                    ).length;

                    const progress =
                        totalTasks === 0
                            ? 0
                            : Math.round((completedTasks / totalTasks) * 100);

                    return (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="block"
                        >
                            <Card className="p-4 transition hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 rounded-full ${projectColor(
                                            project.name
                                        )}`}
                                    />
                                    <h3 className="font-medium">{project.name}</h3>
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {project.description || "No description"}
                                </p>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>
                                            {completedTasks}/{totalTasks} tasks
                                        </span>
                                    </div>

                                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-black transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </AppShell>
    );
}
