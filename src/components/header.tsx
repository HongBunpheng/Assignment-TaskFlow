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

    if (pathname === "/tasks/new") {
      return {
        title: "",
        subtitle: "",
        showEditDelete: true,
        action: null,
      };
    }

  if (/^\/tasks\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Edit Task",
      subtitle: "",
      showEditDelete: false,
      action: null,
    };
  }

  if (/^\/tasks\/[^/]+$/.test(pathname)) {
    return {
      title: "Task Details",
      subtitle: "",
      showEditDelete: true,
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

  const taskIdMatch = pathname.match(/^\/tasks\/(\d+)$/);
  const taskId = taskIdMatch?.[1];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.push("/tasks");
      router.refresh();
    },
  });

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-base font-semibold">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
        )}
      </div>

      {meta.showEditDelete && taskId ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/tasks/${taskId}/edit`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={() => {
              if (confirm("Delete this task?")) {
                deleteMutation.mutate(taskId);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      ) : (
        meta.action && (
          <Button asChild>
            <Link href={meta.action.href}>{meta.action.label}</Link>
          </Button>
        )
      )}
    </header>
  );
}


// export function Header() {
//     const pathname = usePathname();
//     const router = useRouter();
//     const queryClient = useQueryClient();
//     const meta = getHeaderMeta(pathname);

//     const deleteMutation = useMutation({
//       mutationFn: (id: string) => api.deleteTask(id),
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: ["tasks"] });
//         router.push("/tasks");
//         router.refresh();
//       },
//       onError: (error) => {
//         console.error("Error deleting task:", error);
//         alert("Failed to delete task. Please try again.");
//       },
//     });

//     const handleEdit = () => {
//       const taskIdMatch = pathname.match(/^\/tasks\/(\d+)$/);
//       if (taskIdMatch) {
//         const taskId = taskIdMatch[1];
//         router.push(`/tasks/${taskId}/edit`);
//       }
//     };

//     const handleDelete = async () => {
//       const taskIdMatch = pathname.match(/^\/tasks\/(\d+)$/);
//       if (!taskIdMatch) return;

//       const taskId = taskIdMatch[1];

//       const confirmDelete = window.confirm(
//         "Are you sure you want to delete this task?",
//       );

//       if (confirmDelete) {
//         deleteMutation.mutate(taskId);
//       }
//     };

//     return (
//       <header className="flex h-14 items-center justify-between border-b bg-white px-6">
//         <div>
//           <h1 className="text-base font-semibold">{meta.title}</h1>
//           {meta.subtitle && (
//             <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
//           )}
//         </div>

//         {meta.showEditDelete && taskId ? (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleEdit}
//               className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
//             >
//               <Edit2 className="w-4 h-4" />
//               Edit
//             </button>
//             <button
//               onClick={handleDelete}
//               className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
//             >
//               <Trash2 className="w-4 h-4" />
//               Delete
//             </button>
//           </div>
//         ) : (
//           meta.action && (
//             <Button asChild>
//               <Link href={meta.action.href}>{meta.action.label}</Link>
//             </Button>
//           )
//         )}

//         {/* {meta.action && (
//           <Button asChild>
//             <Link href={meta.action.href}>{meta.action.label}</Link>
//           </Button>
//         )} */}
//       </header>
//     );
// }
