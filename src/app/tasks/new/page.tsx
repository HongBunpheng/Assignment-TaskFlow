"use client";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, Paperclip, Plus, X, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    Array<{
      id: number;
      author: string;
      text: string;
      time: string;
    }>
  >([
    {
      id: 1,
      author: "Naroth",
      text: "The new color palette looks great! Just need to finalize the contrast ratios for accessibility.",
      time: "1 hour ago",
    },
    {
      id: 2,
      author: "Naroth",
      text: "Good point! I'll run the contrast checker and update the tokens accordingly.",
      time: "1 hour ago",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    title.trim() !== "" && status.trim() !== "" && projectId.trim() !== "";

  const handleAddAttachment = () => {
    const filename = prompt("Enter filename:");
    if (filename) {
      setAttachments([...attachments, filename]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handlePostComment = () => {
    if (comment.trim() === "") return;

    const newComment = {
      id: comments.length + 1,
      author: "John Doe",
      text: comment,
      time: "Just now",
    };

    setComments([...comments, newComment]);
    setComment("");
  };

  const handleCreateTask = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        assignee,
        dueDate,
        projectId: parseInt(projectId),
        attachments,
        commentsCount: comments.length,
        createdAt: new Date().toISOString(),
      };

      console.log("Creating task:", taskData);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Task created successfully! (UI only - no actual POST request)");

      // Navigate to task detail page (simulated ID)
      router.push(`/tasks/${Math.floor(Math.random() * 1000)}`);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges =
      title ||
      description ||
      status ||
      priority ||
      assignee ||
      dueDate ||
      projectId ||
      attachments.length > 0;

    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmDiscard) return;
    }

    router.push("/tasks");
  };

  return (
    <AppShell activePath="/tasks">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Create Task</div>
          <div className="text-muted-foreground">Fill in the details below</div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateTask}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Comments Section */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Comments & Discussion</div>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  NR
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{c.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.text}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2 border-t">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                NR
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  onClick={handlePostComment}
                  disabled={!comment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Task Details */}
        <Card className="p-6 space-y-5">
          <div className="font-semibold">Task Details</div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Database migration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              placeholder="Write task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select priority</option>
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🚩 High Priority</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium mb-2">Assignee</label>
              <div className="relative">
                <input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >

                </input>
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Project ID */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project ID <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. 2"
              type="number"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Attachments
            </label>
            <div className="space-y-2">
              {attachments.map((filename, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{filename}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddAttachment}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add attachment
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}