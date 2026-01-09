import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
    { href: "/", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    { href: "/projects", label: "Projects" }
];

export function AppShell({
    children,
    activePath
}: {
    children: React.ReactNode;
    activePath: string;
}) {
    return (
        <div className="min-h-screen bg-white">
            <div className="grid grid-cols-[260px_1fr]">
                <aside className="border-r p-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <div className="h-9 w-9 rounded-md bg-black" />
                        <span>TaskFlow</span>
                    </div>

                    <div className="mt-6 space-y-1">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                                    activePath === item.href && "bg-muted text-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-xs text-muted-foreground">PROJECTS</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-pink-500" />
                            Marketing Campaign
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Product Launch
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Engineering
                        </div>
                    </div>

                    <div className="mt-10 border-t pt-4 text-sm">
                        <div className="font-medium">John Doe</div>
                        <div className="text-muted-foreground">john@example.com</div>
                    </div>
                </aside>

                <main className="p-6">
                    <div className="flex items-center justify-end gap-2">
                        <Button asChild>
                            <Link href="/tasks/new">+ New Task</Link>
                        </Button>
                    </div>
                    <div className="mt-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
