"use client";

import { use } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import { Plus, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskCheckbox } from "@/components/task-checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">Loading task...</div>
    );
  if (!task)
    return <div className="p-8 text-center text-slate-500">Task not found</div>;

  const completedCount = task.subtasks.filter((s) => s.completed).length;

  return (
    <AppShell activePath="/tasks">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-sm text-slate-400 mb-4 flex gap-2">
          <span>Tasks</span> <span>&gt;</span>{" "}
          <span className="text-slate-600">
            Task #
            {Math.abs(
              (id as string)
                .split("")
                .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10,
            )}
          </span>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card className="border shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900">
                  {task.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-0.5 capitalize border-slate-200 text-slate-600 font-medium"
                  >
                    {task.status}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    Due {task.dueDate}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {task.description || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subtasks Section */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-lg font-semibold text-slate-900">
                  Subtasks
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {completedCount} of {task.subtasks.length} completed
                </p>
              </div>

              <div className="space-y-4">
                {task.subtasks.length > 0 ? (
                  task.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 group">
                      <TaskCheckbox
                        id={`sub-${sub.id}`}
                        checked={sub.completed}
                        onCheckedChange={() =>
                          sub.id && toggleSubtask.mutate(sub.id)
                        }
                      />
                      <label
                        htmlFor={`sub-${sub.id}`}
                        className={cn(
                          "text-sm font-medium transition-colors cursor-pointer",
                          sub.completed
                            ? "text-slate-300 line-through"
                            : "text-slate-600",
                        )}
                      >
                        {sub.title}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No subtasks defined.
                  </p>
                )}

                <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors pt-2 group">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform text-center" />
                  <span className="text-sm font-medium">Add subtask</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                Comments ({task.comments.length})
              </h3>

              <div className="space-y-6">
                {task.comments.map((comment, index) => (
                  <div key={comment.id || index} className="flex gap-4">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                        {comment.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-slate-400">
                          {comment.createdAt || "2 hours ago"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}