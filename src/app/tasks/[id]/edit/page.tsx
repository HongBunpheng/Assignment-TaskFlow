"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "@/lib/validations/task";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: task } = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.task(id as string),
  });

  const form = useForm({
    resolver: zodResolver(taskSchema),
    values: task,
  });

  const mutation = useMutation({
    mutationFn: (data) => api.updateTask(id as string, data),
    onSuccess: () => router.push(`/tasks/${id}`),
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="p-6 space-y-4"
    >
      {/* shadcn FormFields here */}

      <Button type="submit">Update Task</Button>
    </form>
  );
}
