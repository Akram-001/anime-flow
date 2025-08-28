// src/components/EpisodesManager.tsx
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Episode {
  id: string;
  title: string;
  number: number;
  videoUrl: string;
  duration: string;
}

export default function EpisodesManager({ animeId }: { animeId: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editVideo, setEditVideo] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // ✅ جلب الحلقات
  useEffect(() => {
    const q = query(
      collection(db, "animes", animeId, "episodes"),
      orderBy("number", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setEpisodes(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Episode))
      );
    });
    return () => unsub();
  }, [animeId]);

  // ✅ حذف حلقة
  const handleDelete = async (epId: string) => {
    try {
      await deleteDoc(doc(db, "animes", animeId, "episodes", epId));
      toast.success("Episode deleted");
    } catch {
      toast.error("Error deleting episode");
    }
  };

  // ✅ بدء التعديل
  const startEdit = (ep: Episode) => {
    setEditing(ep.id);
    setEditTitle(ep.title);
    setEditNumber(String(ep.number));
    setEditVideo(ep.videoUrl);
    setEditDuration(ep.duration);
  };

  // ✅ حفظ التعديل
  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "animes", animeId, "episodes", editing), {
        title: editTitle,
        number: Number(editNumber),
        videoUrl: editVideo,
        duration: editDuration,
      });
      setEditing(null);
      toast.success("Episode updated");
    } catch {
      toast.error("Error updating episode");
    }
  };

  return (
    <div className="space-y-3">
      {episodes.map((ep) =>
        editing === ep.id ? (
          <div key={ep.id} className="flex gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
            />
            <Input
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
              placeholder="Number"
              type="number"
            />
            <Input
              value={editVideo}
              onChange={(e) => setEditVideo(e.target.value)}
              placeholder="Video URL"
            />
            <Input
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              placeholder="Duration"
            />
            <Button size="sm" onClick={saveEdit}>
              Save
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div key={ep.id} className="flex items-center justify-between p-2 border rounded">
            <span>
              Ep {ep.number}: {ep.title} ({ep.duration})
            </span>
            <div className="space-x-2">
              <Button size="sm" onClick={() => startEdit(ep)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(ep.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )
      )}
      {episodes.length === 0 && <p>No episodes found</p>}
    </div>
  );
}
