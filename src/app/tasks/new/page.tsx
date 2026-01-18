"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { api, type Task } from "@/lib/api"
import { AppShell } from "@/components/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TaskCheckbox } from "@/components/task-checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { newId, TaskFormValues, taskSchema } from "@/lib/validations/task"

export default function NewTaskPage() {
  const router = useRouter()
  const qc = useQueryClient()

  const projectsQ = useQuery({
    queryKey: ["projects"],
    queryFn: api.projects,
  })

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
    // mode: "onSubmit",
  })

  const subtasksFA = useFieldArray({
    control: form.control,
    name: "subtasks",
  })

  const commentsFA = useFieldArray({
    control: form.control,
    name: "comments",
  })

  const createTaskM = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const tags = (values.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

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
      }

      return api.createTask(task)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] })
      router.push("/tasks")
      router.refresh()
    },
  })


  return (
    <AppShell activePath="/tasks">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Create Task</div>
          <div className="text-muted-foreground">Fill in the details below</div>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <Form {...form}>
          <form
            // onSubmit={form.handleSubmit((values) => createTaskM.mutate(values))}
            onSubmit={form.handleSubmit((values: TaskFormValues) => {
              createTaskM.mutate(values);
            })}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Database migration" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Write task details..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={projectsQ.isLoading || projectsQ.isError}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(projectsQ.data ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {projectsQ.isError && (
                      <div className="text-sm text-destructive">
                        Failed to load projects (is JSON Server running?)
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in-progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="design, accessibility" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Subtasks</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    subtasksFA.append({ title: "", completed: false })
                  }
                >
                  Add subtask
                </Button>
              </div>

              {subtasksFA.fields.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No subtasks yet (optional).
                </div>
              ) : (
                <div className="space-y-2">
                  {subtasksFA.fields.map((f, index) => (
                    <div
                      key={f.id}
                      className="flex items-start gap-3 rounded-md border p-3"
                    >
                      <FormField
                        control={form.control}
                        name={`subtasks.${index}.completed`}
                        render={({ field }) => (
                          <TaskCheckbox
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />

                      <div className="flex-1 space-y-2">
                        <FormField
                          control={form.control}
                          name={`subtasks.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Subtask title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => subtasksFA.remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Comments (optional)</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => commentsFA.append({ author: "", content: "" })}
                >
                  Add comment
                </Button>
              </div>

              {commentsFA.fields.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No comments yet (optional).
                </div>
              ) : (
                <div className="space-y-3">
                  {commentsFA.fields.map((f, index) => (
                    <div key={f.id} className="rounded-md border p-3 space-y-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => commentsFA.remove(index)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`comments.${index}.author`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <Input placeholder="Alice" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`comments.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comment</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="The new palette looks great!"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {createTaskM.isError && (
              <div className="text-sm text-destructive">
                Failed to create task. Please try again.
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={createTaskM.isPending}>
                {createTaskM.isPending ? "Creating..." : "Create task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={createTaskM.isPending}
                onClick={() => router.push("/tasks")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </AppShell>
  );
}

