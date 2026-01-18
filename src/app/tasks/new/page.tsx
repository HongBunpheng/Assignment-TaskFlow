"use client";

import { useForm } from "react-hook-form";
import { api, type Task } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TaskForm } from "@/components/task-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskSchema, type TaskFormValues, newId } from "@/lib/validations/task";

export default function NewTaskPage() {
  const router = useRouter();
  const qc = useQueryClient();

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

  const createTaskM = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const tags = (values.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const task: Task = {
        id: newId(),
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate,
        tags,
        subtasks: (values.subtasks ?? []).map((st, i) => ({
          id: String(i + 1),
          title: st.title,
          completed: st.completed,
        })),
        comments: (values.comments ?? []).map((c, i) => ({
          id: String(i + 1),
          author: c.author,
          content: c.content,
          createdAt: new Date().toISOString(),
        })),
      };

      return api.createTask(task);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      router.push("/tasks");
      router.refresh();
    },
  });

  return (
    <AppShell activePath="/tasks">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Create Task</div>
          <div className="text-muted-foreground">Fill in the details below</div>
        </div>
      </div>

      <TaskForm
        form={form}
        onSubmit={(values) => createTaskM.mutate(values)}
        isSubmitting={createTaskM.isPending}
        submitLabel="Create Task"
        cancelUrl="/tasks"
      />
    </AppShell>
  );
}