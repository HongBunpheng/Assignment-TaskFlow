"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { api, type Task } from "@/lib/api";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TaskForm } from "@/components/task-form";

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.task(id as string),
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      tags: "",
      subtasks: [],
      comments: [],
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || "",
        tags: (task.tags || []).join(", "),
        subtasks: task.subtasks || [],
        comments: task.comments || [],
      });
    }
  }, [task, form]);

  const updateTaskM = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const tags = (values.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const updatedTask: Partial<Task> = {
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate,
        tags,
        subtasks: (values.subtasks ?? []).map((st, i) => ({
          id: st.id || String(i + 1),
          title: st.title,
          completed: st.completed,
        })),
        comments: (values.comments ?? []).map((c, i) => ({
          id: c.id || String(i + 1),
          author: c.author,
          content: c.content,
          createdAt: c.createdAt || new Date().toISOString(),
        })),
      };

      return api.updateTask(id as string, updatedTask);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["task", id] });
      router.push(`/tasks/${id}`);
      router.refresh();
    },
  });

  if (isLoadingTask) {
    return (
      <AppShell activePath="/tasks">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell activePath="/tasks">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Task not found</p>
          <Button
            onClick={() => router.push("/tasks")}
            className="mt-4"
            variant="outline"
          >
            Back to Tasks
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/tasks">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Edit Task</div>
          <div className="text-muted-foreground">Update task details</div>
        </div>
      </div>

      <TaskForm
        form={form}
        onSubmit={(values) => updateTaskM.mutate(values)}
        isSubmitting={updateTaskM.isPending}
        submitLabel="Update Task"
        cancelUrl={`/tasks/${id}`}
      />
    </AppShell>
  );
}