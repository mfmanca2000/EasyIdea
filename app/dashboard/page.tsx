"use client";

import { PostIt, POST_IT_COLORS } from "@/components/post-it";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Idea } from "@/lib/db";
import { Lightbulb, LogOut, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDescription, setQuickDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/ideas");
      if (response.ok) {
        const data = await response.json();
        setIdeas(data);
      }
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quickTitle.trim() || !quickDescription.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle,
          description: quickDescription,
          color: POST_IT_COLORS[Math.floor(Math.random() * POST_IT_COLORS.length)],
        }),
      });

      if (response.ok) {
        const newIdea = await response.json();
        setIdeas([newIdea, ...ideas]);
        setQuickTitle("");
        setQuickDescription("");
      }
    } catch (error) {
      console.error("Error creating idea:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIdeas(ideas.filter((idea) => idea.id !== id));
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  const handleOpenEdit = (idea: Idea) => {
    setSelectedIdea(idea);
    setEditTitle(idea.title);
    setEditDescription(idea.description);
    setEditColor(idea.color);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIdea || !editTitle.trim() || !editDescription.trim()) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/ideas/${selectedIdea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          color: editColor,
        }),
      });

      if (response.ok) {
        const updatedIdea = await response.json();
        setIdeas(
          ideas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
        );
        setSelectedIdea(null);
      }
    } catch (error) {
      console.error("Error updating idea:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">Easy Idea</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Add Form */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto border-2 border-blue-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Add New Idea
            </h2>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <Input
                placeholder="Idea title..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                disabled={isSubmitting}
                className="text-lg"
                autoFocus
              />
              <Textarea
                placeholder="Describe your idea..."
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
              />
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !quickTitle.trim() ||
                  !quickDescription.trim()
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Adding..." : "Add Idea"}
              </Button>
            </form>
          </div>
        </div>

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No ideas yet. Start by adding your first one above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {ideas.map((idea) => (
              <PostIt
                key={idea.id}
                idea={idea}
                onClick={() => handleOpenEdit(idea)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isUpdating}
                rows={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {POST_IT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-md border-2 transition-all ${
                      editColor === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedIdea(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isUpdating || !editTitle.trim() || !editDescription.trim()
                }
              >
                {isUpdating ? "Updating..." : "Update Idea"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
