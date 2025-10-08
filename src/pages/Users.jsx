import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function UsersTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);
      const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const handleBan = async (userId) => {
    await updateDoc(doc(db, "users", userId), { status: "banned" });
    setUsers(users.map(u => u.id === userId ? { ...u, status: "banned" } : u));
  };

  const handleDelete = async (userId) => {
    await deleteDoc(doc(db, "users", userId));
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleRankChange = async (userId, newRank) => {
    await updateDoc(doc(db, "users", userId), { rank: newRank });
    setUsers(users.map(u => u.id === userId ? { ...u, rank: newRank } : u));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">إدارة المستخدمين</h2>
      <table className="w-full border">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th>الاسم</th>
            <th>البريد</th>
            <th>الرتبة</th>
            <th>الحالة</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="text-center border-t">
              <td>{u.name || "غير معروف"}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.rank || "user"}
                  onChange={(e) => handleRankChange(u.id, e.target.value)}
                  className="bg-gray-100 p-1 rounded"
                >
                  <option value="user">User</option>
                  <option value="vip">VIP</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </td>
              <td>{u.status || "active"}</td>
              <td className="space-x-2">
                <Button onClick={() => handleBan(u.id)}>باند</Button>
                <Button variant="destructive" onClick={() => handleDelete(u.id)}>حذف</Button>
                <Button variant="outline">عرض</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}