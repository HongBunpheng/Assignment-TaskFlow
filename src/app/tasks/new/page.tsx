import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewTaskPage() {
    return (
        <AppShell activePath="/tasks">
            <div className="text-2xl font-semibold">Create Task</div>
            <div className="text-muted-foreground">UI only (no POST)</div>

            <Card className="mt-6 p-5 space-y-4">
                <div>
                    <div className="mb-2 text-sm font-medium">Title</div>
                    <Input placeholder="e.g. Database migration" />
                </div>

                <div>
                    <div className="mb-2 text-sm font-medium">Description</div>
                    <Textarea placeholder="Write task details..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="mb-2 text-sm font-medium">Status</div>
                        <Input placeholder="To Do / In Progress / Done" />
                    </div>
                    <div>
                        <div className="mb-2 text-sm font-medium">Project ID</div>
                        <Input placeholder="e.g. 2" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button>Create (disabled)</Button>
                    <Button variant="outline">Cancel</Button>
                </div>
            </Card>
        </AppShell>
    );
}
