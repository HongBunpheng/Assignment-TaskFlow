"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage({
    params
}: {
    params: { id: string };
}) {
    const id = Number(params.id);

    const projectQ = useQuery({
        queryKey: ["project", id],
        queryFn: () => api.project(id),
        enabled: Number.isFinite(id)
    });

    const tasksQ = useQuery({
        queryKey: ["tasks", "project", id],
        queryFn: () => api.tasksByProject(id),
        enabled: Number.isFinite(id)
    });

    return (
        <AppShell activePath="/projects">
            {projectQ.isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : projectQ.isError ? (
                <Card className="p-5">
                    <div className="font-medium">Project not found / failed to load</div>
                </Card>
            ) : (
                <>
                    <div className="text-3xl font-semibold">{projectQ.data!.name}</div>
                    <div className="mt-2 text-muted-foreground">
                        {projectQ.data!.description ?? "No description"}
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-semibold">{tasksQ.data?.length ?? 0}</div>
                            <div className="text-sm text-muted-foreground">Total Tasks</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-semibold">
                                {(tasksQ.data ?? []).filter((t) => t.status === "Done").length}
                            </div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-semibold">
                                {(tasksQ.data ?? []).filter((t) => t.status === "In Progress").length}
                            </div>
                            <div className="text-sm text-muted-foreground">In Progress</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-semibold">
                                {(tasksQ.data ?? []).filter((t) => t.status === "To Do").length}
                            </div>
                            <div className="text-sm text-muted-foreground">To Do</div>
                        </Card>
                    </div>

                    <Card className="mt-6 p-4">
                        <div className="font-semibold">Tasks</div>

                        {tasksQ.isLoading ? (
                            <div className="mt-4 space-y-3">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        ) : tasksQ.isError ? (
                            <div className="mt-3 text-sm text-muted-foreground">
                                Failed to load tasks for this project.
                            </div>
                        ) : (
                            <div className="mt-4 divide-y">
                                {tasksQ.data!.map((t) => (
                                    <Link
                                        key={t.id}
                                        href={`/tasks/${t.id}`}
                                        className="block py-3 hover:bg-muted px-2 rounded-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{t.title}</div>
                                            <Badge variant="outline">{t.status}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t.description ?? "No description"}
                                        </div>
                                    </Link>
                                ))}

                                {tasksQ.data!.length === 0 && (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        No tasks in this project.
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </>
            )}
        </AppShell>
    );
}
