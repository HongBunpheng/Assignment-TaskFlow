"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function TaskDetailPage({
    params
}: {
    params: { id: string };
}) {
    const id = Number(params.id);

    const taskQ = useQuery({
        queryKey: ["task", id],
        queryFn: () => api.task(id),
        enabled: Number.isFinite(id)
    });

    return (
        <AppShell activePath="/tasks">
            {taskQ.isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : taskQ.isError ? (
                <Card className="p-5">
                    <div className="font-medium">Task not found / failed to load</div>
                    <div className="text-sm text-muted-foreground">
                        Check the ID and make sure JSON Server is running.
                    </div>
                </Card>
            ) : (
                (() => {
                    const t = taskQ.data!;
                    return (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-3xl font-semibold">{t.title}</div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="outline">{t.status}</Badge>
                                        {t.priority && <Badge>{t.priority} Priority</Badge>}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline">Edit</Button>
                                    <Button variant="destructive">Delete</Button>
                                </div>
                            </div>

                            <Card className="p-5">
                                <div className="font-semibold">Description</div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    {t.description ?? "No description."}
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Assignee</span>
                                        <span>{t.assignee ?? "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Due date</span>
                                        <span>{t.dueDate ?? "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Project ID</span>
                                        <span>{t.projectId}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="font-semibold">Comments</div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    UI only (optional). Count: {t.commentsCount ?? 0}
                                </div>
                            </Card>
                        </div>
                    );
                })()
            )}
        </AppShell>
    );
}
