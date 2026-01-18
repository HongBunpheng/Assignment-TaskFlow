"use client";

import { use } from "react";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { TaskCheckbox } from "@/components/task-checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => api.task(id),
  });

  const toggleSubtask = useMutation({
    mutationFn: (subtaskid: string) => {
      const updatedSubtasks = task?.subtasks.map((st) =>
        st.id === subtaskid ? { ...st, completed: !st.completed } : st,
      );
      return api.updateTask(id, { subtasks: updatedSubtasks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading task...</div>;
  if (!task) return <div className="p-8 text-center">Task not found</div>;

  const completedCount = task.subtasks.filter((s) => s.completed).length;

  return (
    <AppShell activePath="/tasks">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Tasks &gt; Task #{id}
        </div>

        {/* Task Title & Description Card */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {task.title}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-none capitalize"
                >
                  {task.status.replace("-", " ")}
                </Badge>
                <span className="text-sm text-slate-400">
                  Created Jan 2, 2025
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="font-semibold text-slate-800">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subtasks Card */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col">
              <h3 className="font-semibold text-slate-800">Subtasks</h3>
              <p className="text-xs text-slate-400">
                {completedCount} of {task.subtasks.length} completed
              </p>
            </div>

            <div className="space-y-4">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 group">
                  <TaskCheckbox
                    checked={sub.completed}
                    onCheckedChange={() => sub.id && toggleSubtask.mutate(sub.id)}
                  />
                  <span className="text-sm font-medium transition-colors cursor-pointer">
                    {sub.title}
                  </span>
                </div>
              ))}

              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors pt-2">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add subtask</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span>💬</span> Comments ({task.comments.length})
            </h3>
          </div>

          <div className="space-y-6">
            {task.comments.map((comment, index) => (
              <div key={comment.id || index} className="flex gap-4">
                <Avatar className="w-8 h-8 bg-indigo-500">
                  <AvatarFallback className="text-white text-xs">
                    {comment.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {comment.author}
                    </span>
                    <span className="text-xs text-slate-400">2 hours ago</span>
                  </div>
                  <p className="text-sm text-slate-600">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
