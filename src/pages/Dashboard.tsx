// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Dashboard.tsx
 * - نظام رتب users collection: { name?, email, role, banned, createdAt }
 * - ownerEmail: لديك كـ owner افتراضي
 * - يعرض جدول المستخدمين مع: عرض ملف (Modal)، تغيير رتبة، حظر/رفع حظر، حذف.
 * - صلاحيات: owner/admin يمكنهم إدارة المستخدمين. moderator يمكنه فقط حظر.
 * - ملاحظات أمان: حذف يزيل doc من collection users فقط؛ تحديث email في Auth غير مغطى.
 */

const OWNER_EMAIL = "akramgourri2007@gmail.com";

type UserRecord = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  createdAt?: any;
  [k: string]: any;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [animes, setAnimes] = useState<any[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // anime form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Action");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("PG-13");

  // episodes
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // search / filter / pagination
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  // user modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUser, setModalUser] = useState<UserRecord | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  /* -------------------- helpers: permissions -------------------- */
  const currentUserRole = useMemo(() => {
    // try find role from fetched users
    if (!user) return null;
    const matched = users.find((u) => {
      if (!u) return false;
      // try match by uid if stored, else by email
      if ((u as any).uid && (user as any).uid) return (u as any).uid === (user as any).uid;
      return u.email === user.email;
    });
    return matched?.role || (user.email === OWNER_EMAIL ? "owner" : null);
  }, [user, users]);

  const canManageUsers = useMemo(() => {
    if (!currentUserRole) return false;
    return ["admin", "owner"].includes(currentUserRole);
  }, [currentUserRole]);

  const canModerate = useMemo(() => {
    if (!currentUserRole) return false;
    return ["moderator", "admin", "owner"].includes(currentUserRole);
  }, [currentUserRole]);

  /* -------------------- fetchers -------------------- */
  const fetchAnimes = async () => {
    try {
      const snap = await getDocs(collection(db, "animes"));
      setAnimes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("fetchAnimes", e);
    }
  };

  const fetchUsers = async () => {
    try {
      // order by createdAt desc if exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserRecord)));
    } catch (e) {
      console.error("fetchUsers", e);
    }
  };

  useEffect(() => {
    fetchAnimes();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- anime operations -------------------- */
  const handleAddAnime = async () => {
    if (!title || !desc || !image) {
      toast.error("Please fill all required anime fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        description: desc,
        image,
        category,
        featured,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        rating,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "animes"), payload);
      toast.success("Anime added");
      setTitle(""); setDesc(""); setImage(""); setTags(""); setCategory("Action"); setFeatured(false); setRating("PG-13");
      fetchAnimes();
    } catch (err) {
      console.error("addAnime", err);
      toast.error("Error adding anime");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnime = async (id: string) => {
    if (!confirm("Delete this anime? This action is irreversible.")) return;
    try {
      await deleteDoc(doc(db, "animes", id));
      toast.success("Anime deleted");
      fetchAnimes();
    } catch (e) {
      console.error(e);
      toast.error("Error deleting anime");
    }
  };

  const toggleFeatured = async (id: string, value: boolean) => {
    try {
      await updateDoc(doc(db, "animes", id), { featured: value });
      toast.success("Updated featured");
      fetchAnimes();
    } catch (e) {
      console.error(e);
      toast.error("Error updating featured");
    }
  };

  const handleAddEpisode = async (animeId: string) => {
    if (!epTitle || !epNumber || !epVideo) {
      toast.error("Fill all episode fields");
      return;
    }
    try {
      await addDoc(collection(db, "animes", animeId, "episodes"), {
        title: epTitle,
        number: Number(epNumber),
        videoUrl: epVideo,
        duration: epDuration,
        createdAt: serverTimestamp(),
      });
      setEpTitle(""); setEpNumber(""); setEpVideo(""); setEpDuration(""); setExpanded(null);
      toast.success("Episode added");
    } catch (e) {
      console.error(e);
      toast.error("Error adding episode");
    }
  };

  /* -------------------- users operations -------------------- */
  const updateUserRole = async (userId: string, newRole: string) => {
    if (!canManageUsers) return toast.error("No permission to change role");
    // prevent downgrading owner or editing owner by others
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.email === OWNER_EMAIL && user?.email !== OWNER_EMAIL) {
      return toast.error("Cannot change owner role");
    }

    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated");
    } catch (e) {
      console.error(e);
      toast.error("Error updating role");
    }
  };

  const toggleBanUser = async (userId: string, bannedState: boolean) => {
    if (!canModerate) return toast.error("No permission to ban/unban users");
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.email === OWNER_EMAIL) return toast.error("Cannot ban owner");

    try {
      await updateDoc(doc(db, "users", userId), { banned: bannedState });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: bannedState } : u)));
      toast.success(bannedState ? "User banned" : "User unbanned");
    } catch (e) {
      console.error(e);
      toast.error("Error updating ban state");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!canManageUsers) return toast.error("No permission to delete users");
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.email === OWNER_EMAIL) return toast.error("Cannot delete owner");

    if (!confirm(`Delete user ${target.email}? This will remove their Firestore user doc.`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted (Firestore)");
    } catch (e) {
      console.error(e);
      toast.error("Error deleting user");
    }
  };

  const openUserModal = (u: UserRecord) => {
    setModalUser(u);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setModalUser(null);
    setShowUserModal(false);
  };

  const saveModalUser = async () => {
    if (!modalUser) return;
    setModalSaving(true);
    try {
      // update only editable fields stored in Firestore user doc
      const payload: Partial<UserRecord> = {
        name: modalUser.name,
        role: modalUser.role,
        banned: modalUser.banned,
      };
      await updateDoc(doc(db, "users", modalUser.id), payload);
      // update local state
      setUsers((prev) => prev.map((u) => (u.id === modalUser.id ? { ...u, ...payload } : u)));
      toast.success("User updated");
      closeUserModal();
    } catch (e) {
      console.error(e);
      toast.error("Error saving user");
    } finally {
      setModalSaving(false);
    }
  };

  /* -------------------- UI derived data -------------------- */
  const filteredAnimes = animes.filter((anime) => {
    const matchSearch = anime.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || anime.category === filterCat;
    return matchSearch && matchCat;
  });
  const paginated = filteredAnimes.slice((page - 1) * perPage, page * perPage);

  const chartData = [
    { name: "Animes", value: animes.length },
    { name: "Users", value: users.length },
  ];

  /* -------------------- access control for route -------------------- */
  // allow if current user is ownerEmail or if their role is admin/owner in users collection
  const hasDashboardAccess = useMemo(() => {
    if (!user) return false;
    if (user.email === OWNER_EMAIL) return true;
    // if role known
    if (currentUserRole) return ["admin", "owner"].includes(currentUserRole);
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, users]);

  if (!user || !hasDashboardAccess) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-gray-500 mt-2">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  /* -------------------- render -------------------- */
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">⚙️ Admin Dashboard</h1>

        {/* statistics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Statistics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Add Anime */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Anime</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div>
              <Label>Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="PG-13">PG-13</SelectItem>
                  <SelectItem value="R">R</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <Label>Featured</Label>
            </div>
          </div>
          <Button onClick={handleAddAnime} disabled={loading}>
            {loading ? "Adding..." : "Add Anime"}
          </Button>
        </Card>

        {/* Search + Filter */}
        <div className="flex items-center gap-4">
          <Input placeholder="Search anime..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Comedy">Comedy</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Anime list */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Anime List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Featured</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((anime) => (
                  <tr key={anime.id} className="border-b">
                    <td className="p-2">{anime.title}</td>
                    <td className="p-2">{anime.category}</td>
                    <td className="p-2 text-center">
                      <Switch checked={!!anime.featured} onCheckedChange={(val) => toggleFeatured(anime.id, val)} />
                    </td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" onClick={() => setExpanded(expanded === anime.id ? null : anime.id)}>
                        {expanded === anime.id ? "Close" : "Add Episode"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteAnime(anime.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">No animes found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex justify-between mt-4">
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span>Page {page}</span>
            <Button size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * perPage >= filteredAnimes.length}>Next</Button>
          </div>
        </Card>

        {/* Episodes form when expanded */}
        {expanded && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Add Episode</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Episode Title</Label>
                <Input value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
              </div>
              <div>
                <Label>Episode Number</Label>
                <Input type="number" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} />
              </div>
              <div>
                <Label>Video URL</Label>
                <Input value={epVideo} onChange={(e) => setEpVideo(e.target.value)} />
              </div>
              <div>
                <Label>Duration</Label>
                <Input placeholder="24m" value={epDuration} onChange={(e) => setEpDuration(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => handleAddEpisode(expanded)}>Save Episode</Button>
          </Card>
        )}

        {/* Users management */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-white">
                    <td className="p-2">{u.name || "—"}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2 text-center">
                      <select
                        className="bg-gray-100 px-2 py-1 rounded text-sm"
                        value={u.role || "user"}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        disabled={!canManageUsers}
                      >
                        <option value="user">User</option>
                        <option value="vip">VIP</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    </td>
                    <td className="p-2 text-center">
                      {u.banned ? <span className="text-red-600 font-medium">Banned</span> : <span className="text-green-600 font-medium">Active</span>}
                    </td>
                    <td className="p-2 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openUserModal(u)}>View</Button>
                      <Button
                        size="sm"
                        variant={u.banned ? "default" : "destructive"}
                        onClick={() => toggleBanUser(u.id, !u.banned)}
                        disabled={!canModerate}
                      >
                        {u.banned ? "Unban" : "Ban"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)} disabled={!canManageUsers}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* -------------------- User Modal -------------------- */}
      {showUserModal && modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[90%] max-w-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Profile</h3>
              <div>
                <Button size="sm" variant="ghost" onClick={closeUserModal}>Close</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={modalUser.name || ""} onChange={(e) => setModalUser({ ...modalUser, name: e.target.value })} />
              </div>
              <div>
                <Label>Email (readonly)</Label>
                <Input value={modalUser.email || ""} disabled />
              </div>
              <div>
                <Label>Role</Label>
                <select value={modalUser.role || "user"} onChange={(e) => setModalUser({ ...modalUser, role: e.target.value })} className="bg-gray-100 px-2 py-1 rounded">
                  <option value="user">User</option>
                  <option value="vip">VIP</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div>
                <Label>Banned</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={!!modalUser.banned} onCheckedChange={(val) => setModalUser({ ...modalUser, banned: val })} />
                  <span className="text-sm">{modalUser.banned ? "Banned" : "Active"}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={closeUserModal}>Cancel</Button>
              <Button size="sm" onClick={saveModalUser} disabled={modalSaving}>{modalSaving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}