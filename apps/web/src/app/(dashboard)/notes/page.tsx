"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";

interface Note {
  id: string;
  title: string;
  body?: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const loadNotes = useCallback(async (q?: string) => {
    try {
      const url = q?.trim()
        ? `/api/notes?q=${encodeURIComponent(q.trim())}`
        : "/api/notes";
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      toast.error("Could not load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const t = window.setTimeout(() => loadNotes(query), 300);
    return () => window.clearTimeout(t);
  }, [query, loadNotes]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setBody("");
    setDialogOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setTitle(note.title);
    setBody(note.body || "");
    setDialogOpen(true);
  };

  const saveNote = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/notes/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed, body }),
        });
        if (!res.ok) throw new Error();
        toast.success("Note updated");
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed, body }),
        });
        if (!res.ok) throw new Error();
        toast.success("Note created");
      }
      setDialogOpen(false);
      await loadNotes(query);
    } catch {
      toast.error("Could not save note");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/notes/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Note deleted");
      setDeleteTarget(null);
      await loadNotes(query);
    } catch {
      toast.error("Could not delete note");
    }
  };

  return (
    <FadeIn className="flex-1 px-6 py-8 lg:px-10 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Notes"
        description="Quick captures tied to your focus work."
        actions={
          <Button size="sm" onClick={openCreate}>
            New note
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search notes"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <Panel className="text-center py-10">
          <p className="text-sm text-on-surface-variant">
            {query ? "No notes match your search." : "No notes yet."}
          </p>
          {!query && (
            <Button className="mt-4" size="sm" onClick={openCreate}>
              Create your first note
            </Button>
          )}
        </Panel>
      ) : (
        <Stagger className="flex flex-col gap-2">
          {notes.map((note) => (
            <StaggerItem key={note.id}>
              <Panel className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <button
                  type="button"
                  className="flex-1 text-left min-w-0"
                  onClick={() => openEdit(note)}
                >
                  <h2 className="text-sm font-medium text-on-surface truncate">
                    {note.title}
                  </h2>
                  {note.body && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                      {note.body}
                    </p>
                  )}
                  <p className="text-[10px] text-on-surface-variant/80 mt-2">
                    Updated{" "}
                    {new Date(note.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </button>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(note)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:text-error"
                    onClick={() => setDeleteTarget(note)}
                  >
                    Delete
                  </Button>
                </div>
              </Panel>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit note" : "New note"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={saveNote}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-on-surface-variant">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-md bg-surface-container-lowest border border-[var(--border)] text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[120px]"
              placeholder="Optional details…"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete note"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete &ldquo;{deleteTarget?.title}&rdquo;? This cannot be undone.
        </p>
      </Dialog>
    </FadeIn>
  );
}
