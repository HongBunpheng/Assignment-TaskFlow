import { z } from "zod"

export const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    projectId: z.string().min(1, "Project is required"),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["todo", "in-progress", "done"]),
    dueDate: z.string().min(1, "Due date is required"),
    tags: z.string().optional(),
    subtasks: z
        .array(
            z.object({
                id: z.string().optional(),
                title: z.string().min(1, "Subtask title is required"),
                completed: z.boolean(),
            })
        )
        .default([]),
    comments: z
        .array(
            z.object({
                id: z.string().optional(),
                author: z.string().min(1, "Author is required"),
                content: z.string().min(1, "Comment is required"),
                createdAt: z.string().optional(),
            })
        )
        .default([]),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export function newId() {
    return globalThis.crypto?.randomUUID?.() ?? String(Date.now())
}