"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/core/services/firebase";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "admin" | "user";
  isActive?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "", phone: "", role: "user" as const, isActive: true, password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
  }, []);

  const filteredUsers = useMemo(() => {
    const s = keyword.toLowerCase().trim();
    return users.filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s));
  }, [users, keyword]);

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: editingUser.id, ...formData }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      setEditingUser(null);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) throw new Error("Xóa thất bại");
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Thống kê - Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng", val: users.length, color: "text-slate-800" },
          { label: "Admin", val: users.filter(u => u.role === "admin").length, color: "text-blue-600" },
          { label: "User", val: users.filter(u => u.role !== "admin").length, color: "text-emerald-600" },
          { label: "Active", val: users.filter(u => u.isActive).length, color: "text-orange-500" }
        ].map((item, i) => (
          <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400">{item.label}</p>
            <h3 className={`text-2xl font-bold ${item.color}`}>{item.val}</h3>
          </div>
        ))}
      </div>

      {/* Bảng danh sách - Responsive Design */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border overflow-hidden">
        <input 
          placeholder="Tìm kiếm người dùng..."
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="py-3 px-4 text-left">Người dùng</th>
                <th className="py-3 px-4 hidden md:table-cell">Email</th>
                <th className="py-3 px-4 hidden lg:table-cell">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium">{user.name} <br /><span className="text-xs text-slate-400 md:hidden">{user.email}</span></td>
                  <td className="py-4 px-4 hidden md:table-cell text-slate-600">{user.email}</td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className={`px-2 py-1 rounded-full text-[10px] ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="py-4 px-4 flex justify-center gap-2">
                    <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal chỉnh sửa (tương tự như code cũ của bạn) */}
      {/* ... (Giữ nguyên logic Modal và form field) ... */}
    </div>
  );
}