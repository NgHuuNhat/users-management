"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { Edit, Trash2, Plus, User as UserIcon } from "lucide-react";
import { formatShortId } from "@/core/shared/format-short-id";
import { User } from "@/core/services/data-base";
import { formatDate } from "@/core/shared/format-date";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   role?: "admin" | "user";
//   isActive?: boolean;
// }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "user" as "user" | "admin", isActive: true, password: "" });

  useEffect(() => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
  }, []);

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, phone: user.phone || "", role: user.role || "user", isActive: user.isActive ?? true, password: "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? "/api/admin/users/update" : "/api/admin/users/create";
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: editingId, ...formData })
    });
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "", role: "user", isActive: true, password: "" });
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
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 bg-slate-50 min-h-screen">
      <div className="lg:w-[400px] shrink-0">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            {editingId ? <Edit className="w-5 h-5 text-orange-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
            {editingId ? "Cập nhật người dùng" : "Thêm người dùng"}
          </h2>

          <div className="space-y-4">
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Họ và tên" className="w-full px-3 py-2 border rounded-lg text-sm" required />
            <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-sm" required />
            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={editingId ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"} className="w-full px-3 py-2 border rounded-lg text-sm" required={!editingId} />
            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Số điện thoại" className="w-full px-3 py-2 border rounded-lg text-sm" />

            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
            {editingId ? "Lưu thay đổi" : "Thêm người dùng"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: "", email: "", phone: "", role: "user", isActive: true, password: "" }); }} className="w-full mt-2 text-slate-500 text-sm">Hủy</button>}
        </form>
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-center">Vai trò</th>
                  {/* <th className="px-4 py-3 text-center">Ngày tạo</th> */}
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u: User) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-4 hidden md:table-cell text-slate-600">
                      <p className="whitespace-nowrap text-[10px] text-blue-500 font-medium">{formatShortId(u.id)}</p>
                      {/* <p className="whitespace-break-spaces text-[10px] text-blue-500 font-medium">{formatDate(u.createdAt)}</p> */}
                    </td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs"><UserIcon size={14} /></div>
                      <div>
                        <div className="font-medium text-slate-800">{u.name}</div>
                        <p className="whitespace-break-spaces text-[10px] text-blue-500 font-medium">{formatDate(u.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-slate-600">{u.phone}</td>
                    <td className="px-4 py-4 hidden md:table-cell text-slate-600">{u.email}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] ${u.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    {/* <td className="px-4 py-4 hidden md:table-cell text-slate-600">
                      <p className="text-[10px] text-blue-500 font-medium text-center">{formatDate(u.createdAt)}</p>
                    </td> */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}