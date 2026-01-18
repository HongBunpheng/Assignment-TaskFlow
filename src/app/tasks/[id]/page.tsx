"use client";

import { use, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import { MessageSquare, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskCheckbox } from "@/components/task-checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => api.task(id),
  });

  const projectsQ = useQuery({
    queryKey: ["projects"],
    queryFn: api.projects,
  });

  const updateTaskM = useMutation({
    mutationFn: (patch: Parameters<typeof api.updateTask>[1]) =>
      api.updateTask(id, patch),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks", id] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ]);
    },
  });

  const toggleSubtask = useMutation({
    mutationFn: async (subtaskid: string) => {
      const updatedSubtasks =
        task?.subtasks.map((st) =>
          st.id === subtaskid ? { ...st, completed: !st.completed } : st
        ) ?? [];

      const completedCount = updatedSubtasks.filter((s) => s.completed).length;
      const nextStatus =
        completedCount === 0
          ? "todo"
          : completedCount === updatedSubtasks.length
            ? "done"
            : "in-progress";

      return updateTaskM.mutateAsync({
        subtasks: updatedSubtasks,
        status: nextStatus,
      });
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">Loading task...</div>
    );
  if (!task)
    return <div className="p-8 text-center text-slate-500">Task not found</div>;

  const completedCount = task.subtasks.filter((s) => s.completed).length;

  const projectName = useMemo(() => {
    const projects = projectsQ.data ?? [];
    return projects.find((p) => p.id === task.projectId)?.name;
  }, [projectsQ.data, task.projectId]);

  function statusBadgeClass(status: string) {
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

  return (
    <AppShell activePath="/tasks">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground flex gap-2">
              <span>Tasks</span> <span>/</span>{" "}
              <span className="text-foreground">Task Detail</span>
            </div>
          </div>

          <div />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <h1 className="text-3xl font-bold">{task.title}</h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", statusBadgeClass(task.status))}
                  >
                    {task.status}
                  </Badge>
                  {task.dueDate && <span>Due {task.dueDate}</span>}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card className="border shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Subtasks</div>
                    <div className="text-xs text-muted-foreground">
                      {completedCount} of {task.subtasks.length} completed
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {task.subtasks.length > 0 ? (
                    task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 rounded-md border p-3"
                      >
                        <TaskCheckbox
                          checked={sub.completed}
                          disabled={toggleSubtask.isPending || updateTaskM.isPending}
                          onCheckedChange={() =>
                            sub.id && toggleSubtask.mutate(sub.id)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => sub.id && toggleSubtask.mutate(sub.id)}
                          className={cn(
                            "text-sm font-medium text-left",
                            sub.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {sub.title}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No subtasks defined.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a subtask..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!newSubtaskTitle.trim() || updateTaskM.isPending}
                      onClick={() => {
                        const current = task.subtasks ?? [];
                        const max = current.reduce((acc, st) => {
                          const n = Number.parseInt(st.id, 10);
                          return Number.isFinite(n) ? Math.max(acc, n) : acc;
                        }, 0);
                        const nextSubtasks = [
                          ...current,
                          {
                            id: String(max + 1),
                            title: newSubtaskTitle.trim(),
                            completed: false,
                          },
                        ];

                        updateTaskM.mutate({ subtasks: nextSubtasks });
                        setNewSubtaskTitle("");
                      }}
                    >
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="border shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  Comments ({task.comments.length})
                </h3>

                <div className="space-y-6">
                  {task.comments.map((comment, index) => (
                    <div key={comment.id || index} className="flex gap-4">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                          {comment.author?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            {comment.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt || "—"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                  />
                  <Button
                    type="button"
                    disabled={!commentText.trim() || updateTaskM.isPending}
                    onClick={() => {
                      const nextComments = [
                        ...(task.comments ?? []),
                        {
                          id: String((task.comments?.length ?? 0) + 1),
                          author: "John Doe",
                          content: commentText.trim(),
                          createdAt: new Date().toISOString(),
                        },
                      ];
                      updateTaskM.mutate({ comments: nextComments });
                      setCommentText("");
                    }}
                  >
                    Post Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            <Card className="border shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">STATUS</div>
                  <Select
                    value={task.status}
                    onValueChange={(v) =>
                      updateTaskM.mutate({ status: v as any })
                    }
                    disabled={updateTaskM.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To do</SelectItem>
                      <SelectItem value="in-progress">In progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">PRIORITY</div>
                  <Select
                    value={task.priority}
                    onValueChange={(v) =>
                      updateTaskM.mutate({ priority: v as any })
                    }
                    disabled={updateTaskM.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">DUE DATE</div>
                  <Input
                    type="date"
                    value={task.dueDate ?? ""}
                    onChange={(e) =>
                      updateTaskM.mutate({ dueDate: e.target.value })
                    }
                    disabled={updateTaskM.isPending}
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">PROJECT</div>
                  <Select
                    value={task.projectId}
                    onValueChange={(v) => updateTaskM.mutate({ projectId: v })}
                    disabled={updateTaskM.isPending || projectsQ.isLoading || projectsQ.isError}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projectsQ.data ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {projectsQ.isError && (
                    <div className="text-xs text-destructive">
                      Failed to load projects
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}