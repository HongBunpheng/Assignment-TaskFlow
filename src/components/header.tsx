"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

function getHeaderMeta(pathname: string) {
    if (pathname === "/") {
        return {
            title: "Dashboard",
            subtitle: "Welcome back",
            action: {
                label: "+ New Task",
                href: "/tasks/new"
            }
        };
    }

    if (/^\/tasks\/[^/]+$/.test(pathname)) {
      return {
        title: "Task Detail",
        subtitle: "",
        showEditDelete: true,
        action: null,
      };
    }

    if (/^\/tasks\/[^/]+\/edit$/.test(pathname)) {
      return {
        title: "",
        subtitle: "",
        showEditDelete: false,
        action: null,
      };
    }

    if (pathname.startsWith("/tasks")) {
        return {
            title: "Tasks",
            subtitle: "Manage and track your tasks",
            action: {
                label: "+ New Task",
                href: "/tasks/new"
            }
        };
    }

    if (pathname === "/projects") {
        return {
            title: "Projects",
            subtitle: "3 active projects",
            action: {
                label: "+ New Project",
                href: "#"
            }
        };
    }

    if (pathname.startsWith("/projects/")) {
        return {
            title: "",
            subtitle: "",
            action: {
                label: "+ Add Task",
                href: "/tasks/new"
            }
        };
    }

    return {
        title: "TaskFlow",
        subtitle: "",
        action: null
    };
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const meta = getHeaderMeta(pathname);

  const taskIdMatch = pathname.match(/^\/tasks\/([^/]+)$/);
  const taskId = taskIdMatch?.[1];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.push("/tasks");
      router.refresh();
    },
  });

  const handleEdit = () => {
    if (taskId) router.push(`/tasks/${taskId}/edit`);
  };

  const handleDelete = () => {
    if (
      taskId &&
      window.confirm("Are you sure you want to delete this task?")
    ) {
      deleteMutation.mutate(taskId);
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-base font-semibold">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {meta.showEditDelete && taskId ? (
          <>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </>
        ) : (
          meta.action && (
            <Button
              asChild
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Link href={meta.action.href}>{meta.action.label}</Link>
            </Button>
          )
        )}
      </div>
    </header>
  );
}
