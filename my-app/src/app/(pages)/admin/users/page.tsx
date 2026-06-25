"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { User } from "@/core/services/types/data-base";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // realtime fetch users
  useEffect(() => {
    // const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const q = collection(db, "users");

    const unsub = onSnapshot(q, (snap) => {
      const data: User[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<User, "id">),
      }));

      setUsers(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // filter logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search);

      const matchRole =
        roleFilter === "all" ? true : u.role === roleFilter;

      const matchActive =
        activeFilter === "all"
          ? true
          : activeFilter === "active"
            ? u.isActive
            : !u.isActive;

      return matchSearch && matchRole && matchActive;
    });
  }, [users, search, roleFilter, activeFilter]);

  // toggle active
  const toggleActive = async (user: User) => {
    await updateDoc(doc(db, "users", user.id), {
      isActive: !user.isActive,
    });
  };

  // toggle role
  const toggleRole = async (user: User) => {
    await updateDoc(doc(db, "users", user.id), {
      role: user.role === "admin" ? "user" : "admin",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 uppercase">
          Quản lý người dùng
        </h1>
        <p className="text-sm text-slate-500">
          Tổng: {users.length} user
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="border px-3 py-2 rounded-lg w-full lg:w-80"
        />

        <div className="flex gap-2 flex-wrap">
          <select
            className="border px-3 py-2 rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="all">Tất cả role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="border px-3 py-2 rounded-lg"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  Không có user
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">
                    {u.name}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${u.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                        }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${u.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => toggleRole(u)}
                      className="px-2 py-1 text-xs border rounded"
                    >
                      Toggle role
                    </button>

                    <button
                      onClick={() => toggleActive(u)}
                      className="px-2 py-1 text-xs border rounded"
                    >
                      Toggle active
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}