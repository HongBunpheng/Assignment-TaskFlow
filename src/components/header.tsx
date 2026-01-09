"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

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
    const meta = getHeaderMeta(pathname);

    return (
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
            <div>
                <h1 className="text-base font-semibold">{meta.title}</h1>
                {meta.subtitle && (
                    <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
                )}
            </div>

            {meta.action && (
                <Button asChild>
                    <Link href={meta.action.href}>{meta.action.label}</Link>
                </Button>
            )}
        </header>
    );
}
