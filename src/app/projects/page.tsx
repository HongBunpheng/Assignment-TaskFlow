"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
    const projectsQ = useQuery({ queryKey: ["projects"], queryFn: api.projects });

    return (
        <AppShell activePath="/projects">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-semibold">Projects</div>
                    <div className="text-muted-foreground">
                        {projectsQ.data?.length ?? 0} active projects
                    </div>
                </div>
            </div>

            <Card className="mt-5 p-3">
                {projectsQ.isLoading ? (
                    <div className="space-y-3 p-2">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : projectsQ.isError ? (
                    <div className="p-4">
                        <div className="font-medium">Failed to load projects</div>
                        <div className="text-sm text-muted-foreground">
                            Run: <span className="font-mono">npm run server</span>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y">
                        {projectsQ.data!.map((p) => (
                            <Link
                                key={p.id}
                                href={`/projects/${p.id}`}
                                className="block p-4 hover:bg-muted"
                            >
                                <div className="font-medium">{p.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {p.description ?? "No description"}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Card>
        </AppShell>
    );
}
