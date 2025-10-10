/* src/pages/Dashboard.tsx */
import React, { useEffect, useMemo, useState } from "react";
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
 * Dashboard.tsx — كامل ومُحدَّث
 * - يجمع: إدارة الأنميات، إضافة حلقات، إحصائيات، إدارة المستخدمين (roles + bans).
 * - يفرض الصلاحيات التالية (مخزنة في users.role):
 *    owner (أقوى) — يغير الرتب، يحظر، يحذف، يعدل.
 *    founder — نفس صلاحيات owner تقريباً لكنه لا يقدر يلمس owner.
 *    admin — يقدر يشوف المستخدمين، يعدل بياناتهم، يحظر؛ لكن ما يغيّر رتب.
 *    moderator — يقدر يشوف المستخدمين ويحظر فقط.
 *    user / vip — مستخدم عادي.
 *
 * الملاحظات:
 * - تفعيل الأمان الحقيقي يجب عبر Firestore Rules أيضاً (مقدمة لك سابقاً).
 * - يتوقع أن الوثيقة لكل مستخدم في collection "users" لها id = uid من Firebase Auth.
 */

const OWNER_EMAIL = "akramgourri2007@gmail.com"; // عدّل إذا احتجت

type Anime = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
  rating?: string;
  createdAt?: any;
};

type UserRecord = {
  id: string; // doc id == uid
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  createdAt?: any;
  [k: string]: any;
};

export default function Dashboard(): JSX.Element {
  const { user } = useAuth();

  // --- data
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);

  const [loading, setLoading] = useState(false);

  // --- Anime form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Action");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("PG-13");

  // --- search / pagination
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  // --- episode
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null); // animeId expanded for adding episodes

  // --- users modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUser, setModalUser] = useState<UserRecord | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // --- compute current user's role by matching user.email or uid
  const currentUserRole = useMemo(() => {
    if (!user) return null;
    const found = users.find((u) => {
      if (!u) return false;
      if (u.id && (user as any).uid) return u.id === (user as any).uid;
      return u.email === user.email;
    });
    if (found?.role) return found.role;
    if (user.email === OWNER_EMAIL) return "owner";
    return null;
  }, [user, users]);

  // --- capability checks
  const canManageUsers = useMemo(() => currentUserRole === "owner", [currentUserRole]); // change role / delete
  const canEditUsers = useMemo(
    () => ["admin", "owner", "founder"].includes(currentUserRole || ""),
    [currentUserRole]
  ); // edit user data (not role unless owner)
  const canModerate = useMemo(
    () => ["moderator", "admin", "owner", "founder"].includes(currentUserRole || ""),
    [currentUserRole]
  ); // ban/unban
  const hasDashboardAccess = useMemo(
    () => ["owner", "admin", "founder", "moderator"].includes(currentUserRole || ""),
    [currentUserRole]
  ); // who sees dashboard at all

  /* -------------------- fetchers -------------------- */
  const fetchAnimes = async () => {
    try {
      const snap = await getDocs(collection(db, "animes"));
      setAnimes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Anime)));
    } catch (err) {
      console.error("fetchAnimes", err);
      toast.error("Error loading animes");
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as UserRecord)));
    } catch (err) {
      console.error("fetchUsers", err);
      toast.error("Error loading users");
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
      toast.error("Fill required anime fields");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "animes"), {
        title,
        description: desc,
        image,
        category,
        featured,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        rating,
        createdAt: serverTimestamp(),
      });
      toast.success("Anime added");
      setTitle("");
      setDesc("");
      setImage("");
      setTags("");
      setCategory("Action");
      setFeatured(false);
      setRating("PG-13");
      fetchAnimes();
    } catch (err) {
      console.error("handleAddAnime", err);
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
    } catch (err) {
      console.error("handleDeleteAnime", err);
      toast.error("Error deleting anime");
    }
  };

  const toggleFeatured = async (id: string, value: boolean) => {
    try {
      await updateDoc(doc(db, "animes", id), { featured: value });
      toast.success("Updated featured");
      fetchAnimes();
    } catch (err) {
      console.error("toggleFeatured", err);
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
      setEpTitle("");
      setEpNumber("");
      setEpVideo("");
      setEpDuration("");
      setExpanded(null);
      toast.success("Episode added");
    } catch (err) {
      console.error("handleAddEpisode", err);
      toast.error("Error adding episode");
    }
  };

  /* -------------------- users operations -------------------- */

  // change role — ONLY owner can
  const updateUserRole = async (userId: string, newRole: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return toast.error("User not found");

    // Protect owner
    if (target.email === OWNER_EMAIL && user?.email !== OWNER_EMAIL) {
      return toast.error("Cannot change Owner role");
    }

    if (currentUserRole !== "owner") {
      return toast.error("Only Owner can change roles");
    }

    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated");
    } catch (err) {
      console.error("updateUserRole", err);
      toast.error("Error updating role");
    }
  };

  // ban/unban — founder/admin/moderator/owner allowed (but founder can't ban owner)
  const toggleBanUser = async (userId: string, bannedState: boolean) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return toast.error("User not found");

    if (!canModerate) return toast.error("No permission to ban/unban");

    // protect owner
    if (target.email === OWNER_EMAIL) return toast.error("Cannot ban Owner");

    // founder cannot ban owner (already covered), but founder allowed otherwise
    if (currentUserRole === "founder" && target.role === "owner") {
      return toast.error("Founder cannot touch Owner");
    }

    try {
      await updateDoc(doc(db, "users", userId), { banned: bannedState });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: bannedState } : u)));
      toast.success(bannedState ? "User banned" : "User unbanned");
    } catch (err) {
      console.error("toggleBanUser", err);
      toast.error("Error updating ban state");
    }
  };

  // delete user doc — only owner
  const deleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return toast.error("User not found");

    if (target.email === OWNER_EMAIL) return toast.error("Cannot delete Owner");

    if (currentUserRole !== "owner") return toast.error("Only Owner can delete users");

    if (!confirm(`Delete user ${target.email}? This will remove their Firestore user doc.`)) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch (err) {
      console.error("deleteUser", err);
      toast.error("Error deleting user");
    }
  };

  // open modal to view/edit user (editing role only allowed for owner in modal save)
  const openUserModal = (u: UserRecord) => {
    setModalUser({ ...u });
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setModalUser(null);
    setShowUserModal(false);
  };

  const saveModalUser = async () => {
    if (!modalUser) return;
    // Only owner can change role in saveModalUser; others allowed to edit name only (if permitted)
    if (modalUser.email === OWNER_EMAIL && user?.email !== OWNER_EMAIL) {
      return toast.error("Cannot modify Owner");
    }

    // if trying to change role and current user is not owner — forbid
    const original = users.find((u) => u.id === modalUser.id);
    if (original && original.role !== modalUser.role && currentUserRole !== "owner") {
      return toast.error("Only Owner can change roles");
    }

    // founder cannot set role of owner — but owner is protected above
    if (currentUserRole === "founder" && original && original.role === "owner") {
      return toast.error("Founder cannot modify Owner");
    }

    // If current role can't edit users, block
    if (!canEditUsers && user?.email !== OWNER_EMAIL) {
      // user may edit own name only
      if ((user as any).uid !== modalUser.id) return toast.error("No permission to edit this user");
    }

    setModalSaving(true);
    try {
      // only update allowed fields
      const payload: Partial<UserRecord> = {
        name: modalUser.name,
        banned: modalUser.banned,
      };
      // role only if owner
      if (currentUserRole === "owner") payload.role = modalUser.role;

      await updateDoc(doc(db, "users", modalUser.id), payload);
      setUsers((prev) => prev.map((u) => (u.id === modalUser.id ? { ...u, ...payload } : u)));
      toast.success("User saved");
      closeUserModal();
    } catch (err) {
      console.error("saveModalUser", err);
      toast.error("Error saving user");
    } finally {
      setModalSaving(false);
    }
  };

  /* -------------------- UI derived -------------------- */
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

  /* -------------------- access gate -------------------- */
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

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Statistics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Add New Anime */}
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
          <div className="flex justify-between mt-4">
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span>Page {page}</span>
            <Button size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * perPage >= filteredAnimes.length}>Next</Button>
          </div>
        </Card>

        {/* Add Episode form */}
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
          <th className="p-2 text-center">Role</th>
          <th className="p-2 text-center">Status</th>
          <th className="p-2 text-center">Actions</th>
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
                <option value="founder">Founder</option>
                <option value="owner">Owner</option>
              </select>
            </td>
            <td className="p-2 text-center">
              {u.banned ? (
                <span className="text-red-600 font-medium">Banned</span>
              ) : (
                <span className="text-green-600 font-medium">Active</span>
              )}
            </td>
            <td className="p-2 flex flex-row gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={() => openUserModal(u)}>
                View
              </Button>

              <Button
                size="sm"
                variant={u.banned ? "default" : "destructive"}
                onClick={() => toggleBanUser(u.id, !u.banned)}
                disabled={!canModerate}
              >
                {u.banned ? "Unban" : "Ban"}
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteUser(u.id)}
                disabled={!canManageUsers}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr>
            <td colSpan={5} className="p-4 text-center text-gray-500">
              No users found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</Card>
      </div>

      {/* User Modal */}
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
                <select value={modalUser.role || "user"} onChange={(e) => setModalUser({ ...modalUser, role: e.target.value })} className="bg-gray-100 px-2 py-1 rounded" disabled={!canManageUsers}>
                  <option value="user">User</option>
                  <option value="vip">VIP</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="founder">Founder</option>
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