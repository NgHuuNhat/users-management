"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/core/services/firebase";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "admin" | "user";
  isActive?: boolean;
  createdAt?: any;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    role: "user" as "admin" | "user",
    isActive: true,
    password: "",
  });

  const [error, setError] = useState("");

  // Lắng nghe realtime danh sách user
  useEffect(() => {
    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: User[] = [];

      snapshot.forEach((item) => {
        list.push({
          id: item.id,
          ...item.data(),
        } as User);
      });

      setUsers(list);

      // Log đúng dữ liệu vừa lấy từ Firestore
      console.log("Firestore users:", list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Users state:", users);
  }, [users]);

  // Tìm kiếm
  const filteredUsers = useMemo(() => {
    const search = keyword.toLowerCase().trim();

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.includes(search)
      );
    });

  }, [users, keyword]);

  // Mở modal edit
  const handleOpenEdit = (user: User) => {
    setError("");
    setEditingUser(user);

    setFormData({
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "user",
      isActive: user.isActive ?? true,
      password: "",
    });

  };

  // Lưu
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);

      // FIX
      // await updateDoc(doc(db, "users", editingUser.id), {
      //   email: formData.email.trim(),
      //   name: formData.name.trim(),
      //   phone: formData.phone.trim(),
      //   role: formData.role,
      //   isActive: formData.isActive,
      // });

      //
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: editingUser.id,
          email: formData.email.trim(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          password: formData.password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }
      //

      setEditingUser(null);

    } catch (error: any) {
      console.error("Lỗi cập nhật user:", error);
      setError(error.message || "Có lỗi xảy ra.");

    } finally {
      setSaving(false);
    }
  };

  return (<div className="space-y-8">
    {/* Thống kê */} <div className="grid grid-cols-1 md:grid-cols-4 gap-5"> <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"> <p className="text-xs text-slate-500 uppercase font-semibold">
      Tổng người dùng </p>

      <h3 className="text-3xl font-bold text-slate-800 mt-2">
        {users.length}
      </h3>
    </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 uppercase font-semibold">
          Admin
        </p>

        <h3 className="text-3xl font-bold text-blue-600 mt-2">
          {users.filter((u) => u.role === "admin").length}
        </h3>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 uppercase font-semibold">
          User
        </p>

        <h3 className="text-3xl font-bold text-emerald-600 mt-2">
          {users.filter((u) => u.role !== "admin").length}
        </h3>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 uppercase font-semibold">
          Đang hoạt động
        </p>

        <h3 className="text-3xl font-bold text-orange-500 mt-2">
          {users.filter((u) => u.isActive !== false).length}
        </h3>
      </div>
    </div>

    {/* Header */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
        Quản lý người dùng
      </h2>

      <p className="text-sm text-slate-500 mt-2">
        Theo dõi và quản trị tài khoản người dùng trên hệ thống.
      </p>

      <div className="mt-5">
        <input
          type="text"
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="
          w-full md:w-96
          px-3 py-2
          border border-slate-200
          rounded-lg
          text-sm
          bg-slate-50
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:bg-white
        "
        />
      </div>
    </div>

    {/* Danh sách */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-base font-bold mb-4 text-slate-800 uppercase tracking-tight">
        Danh sách người dùng ({filteredUsers.length})
      </h3>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-400 text-sm">
            Không có người dùng nào.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Điện thoại</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                        w-10 h-10
                        rounded-full
                        bg-blue-100
                        text-blue-600
                        font-bold
                        flex items-center justify-center
                      "
                      >
                        {user.name?.charAt(0).toUpperCase() ?? "U"}
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800">
                          {user.name || "Chưa cập nhật"}
                        </div>

                        <div className="text-xs text-slate-400 font-mono">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-600">
                    {user.email}
                  </td>

                  <td className="py-4 px-4 text-slate-600">
                    {user.phone || "-"}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive === false
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                      {user.isActive === false
                        ? "Đã khóa"
                        : "Hoạt động"}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="
                        px-4 py-2
                        rounded-lg
                        bg-amber-100
                        text-amber-700
                        hover:bg-amber-200
                        text-xs
                        font-medium
                        transition
                      "
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Modal */}
    {editingUser && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">
              Chỉnh sửa người dùng
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {editingUser.email}
            </p>
          </div>

          <div className="min-h-10 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error ? error : ''}
          </div>

          <div className="p-6 space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ID
              </label>

              <input
                value={editingUser.id}
                disabled
                className="
      w-full px-3 py-2
      border border-slate-200
      rounded-lg
      bg-slate-100
      text-slate-500
      cursor-not-allowed
      font-mono
      text-sm
    "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="
      w-full px-3 py-2
      border border-slate-200
      rounded-lg
      bg-slate-50
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      focus:bg-white
    "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mật khẩu mới
              </label>

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                placeholder="Để trống nếu không đổi mật khẩu"
                className="
      w-full px-3 py-2
      border border-slate-200
      rounded-lg
      bg-slate-50
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      focus:bg-white
    "
              />

              <p className="mt-1 text-xs text-slate-400">
                Để trống nếu không muốn thay đổi mật khẩu.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Họ tên
              </label>

              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="
                w-full px-3 py-2
                border border-slate-200
                rounded-lg
                bg-slate-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:bg-white
              "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại
              </label>

              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="
                w-full px-3 py-2
                border border-slate-200
                rounded-lg
                bg-slate-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:bg-white
              "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vai trò
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user",
                  })
                }
                className="
                w-full px-3 py-2
                border border-slate-200
                rounded-lg
                bg-slate-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trạng thái
              </label>

              <select
                value={String(formData.isActive)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "true",
                  })
                }
                className="
                w-full px-3 py-2
                border border-slate-200
                rounded-lg
                bg-slate-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
              >
                <option value="true">Hoạt động</option>
                <option value="false">Đã khóa</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={() => setEditingUser(null)}
              className="
              px-4 py-2
              rounded-lg
              bg-slate-100
              hover:bg-slate-200
              text-slate-700
            "
            >
              Hủy
            </button>

            <button
              onClick={handleSaveUser}
              disabled={saving}
              className="
              px-4 py-2
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              text-white
              disabled:opacity-50
            "
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  )
}