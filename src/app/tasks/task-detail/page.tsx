"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function TaskDetailPage() {
  const { id } = useParams();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.task(id as string),
  });

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!task) return <p className="p-6">Task not found</p>;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <Badge>{task.status}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">Due {task.dueDate}</p>

          <div>
            <h4 className="font-medium mb-1">Description</h4>
            <p className="text-sm">{task.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
