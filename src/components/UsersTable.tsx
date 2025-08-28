// src/components/UsersTable.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Users</h2>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
