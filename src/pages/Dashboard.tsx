import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// ---------------------- Types ----------------------
type Anime = {
  id: string;
  title: string;
  category: string;
  rating: number;
};

type User = {
  id: string;
  email: string;
  role: string;
  banned: boolean;
};

// ---------------------- Component ----------------------
const Dashboard: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newAnime, setNewAnime] = useState({ title: "", category: "", rating: 0 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");

  // -------- Fetch Anime --------
  useEffect(() => {
    const fetchAnime = async () => {
      const snapshot = await getDocs(collection(db, "anime"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Anime[];
      setAnimeList(data);
    };
    fetchAnime();
  }, []);

  // -------- Fetch Users --------
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // -------- Add Anime --------
  const addAnime = async () => {
    if (!newAnime.title || !newAnime.category) return;
    const docRef = await addDoc(collection(db, "anime"), newAnime);
    setAnimeList([...animeList, { ...newAnime, id: docRef.id }]);
    setNewAnime({ title: "", category: "", rating: 0 });
  };

  // -------- Delete Anime --------
  const deleteAnime = async (id: string) => {
    await deleteDoc(doc(db, "anime", id));
    setAnimeList(animeList.filter((a) => a.id !== id));
  };

  // -------- Ban / Unban User --------
  const toggleBanUser = async (id: string, banned: boolean) => {
    await updateDoc(doc(db, "users", id), { banned });
    setUsers(users.map((u) => (u.id === id ? { ...u, banned } : u)));
  };

  // -------- Filters --------
  const filteredAnime = animeList.filter((a) => {
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) &&
      (category ? a.category === category : true) &&
      (rating ? a.rating === Number(rating) : true)
    );
  });

  // -------- Stats --------
  const stats = {
    totalAnime: animeList.length,
    totalUsers: users.length,
    categories: [...new Set(animeList.map((a) => a.category))].length,
  };

  // ---------------------- JSX ----------------------
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats */}
      <Card className="p-4">
        <h2 className="font-bold">Total Anime</h2>
        <p>{stats.totalAnime}</p>
      </Card>
      <Card className="p-4">
        <h2 className="font-bold">Total Users</h2>
        <p>{stats.totalUsers}</p>
      </Card>
      <Card className="p-4">
        <h2 className="font-bold">Categories</h2>
        <p>{stats.categories}</p>
      </Card>

      {/* Manage Anime */}
      <Card className="p-6 col-span-2">
        <h2 className="text-lg font-semibold mb-4">Manage Anime</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Title"
            value={newAnime.title}
            onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={newAnime.category}
            onChange={(e) => setNewAnime({ ...newAnime, category: e.target.value })}
          />
          <Input
            placeholder="Rating"
            type="number"
            value={newAnime.rating}
            onChange={(e) =>
              setNewAnime({ ...newAnime, rating: Number(e.target.value) })
            }
          />
          <Button onClick={addAnime}>Add</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white text-black border rounded-md">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="">All</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Comedy">Comedy</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="bg-white text-black border rounded-md">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="">All</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Anime List */}
        <ul className="space-y-2">
          {filteredAnime.map((a) => (
            <li
              key={a.id}
              className="flex justify-between border p-2 rounded-md"
            >
              {a.title} - {a.category} - {a.rating}/5
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteAnime(a.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Manage Users */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Banned</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role || "user"}</td>
                  <td className="p-2">{u.banned ? "Yes" : "No"}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => toggleBanUser(u.id, !u.banned)}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;