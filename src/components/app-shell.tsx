import Link from "next/link";
import { Header } from "./header";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    { href: "/projects", label: "Projects" }
];

const projects = [
    { name: "Marketing Campaign", color: "bg-pink-500" },
    { name: "Product Launch", color: "bg-blue-500" },
    { name: "Engineering", color: "bg-emerald-500" }
];

export function AppShell({
    children,
    activePath
}: {
    children: React.ReactNode;
    activePath: string;
}) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-muted/40">
            <div className="grid h-full grid-cols-[260px_1fr]">

                <aside className="flex h-full flex-col border-r bg-white p-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="h-8 w-8 rounded bg-black" />
                        TaskFlow
                    </div>

                    <nav className="mt-6 space-y-1">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">
                            MENU
                        </div>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                                    activePath === item.href &&
                                    "bg-muted font-medium text-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-8">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">
                            PROJECTS
                        </div>
                        <div className="space-y-2">
                            {projects.map((p) => (
                                <div
                                    key={p.name}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                    <span className={`h-2 w-2 rounded-full ${p.color}`} />
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto border-t pt-4">
                        <div className="text-sm font-medium">John Doe</div>
                        <div className="text-xs text-muted-foreground">
                            john@example.com
                        </div>
                    </div>
                </aside>

                <div className="flex h-full flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
