"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
// LƯU Ý: Mở comment dòng dưới đây và đảm bảo đường dẫn đúng với dự án của bạn
import { db } from "@/core/services/firebase";
import { NumericFormat } from "react-number-format";
import { Plus, Trash2, Tag, ListPlus, Edit, X } from "lucide-react";
import { formatShortId } from "@/core/shared/format-short-id";
import { formatDate } from "@/core/shared/format-date";

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  initialQuantity: number;
  quantity: number;
  image: string;
  description: string;
  attributes: Record<string, string>;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. State thông tin cơ bản của sản phẩm
  const initialFormState: Omit<Product, "id" | "attributes"> = {
    categoryId: "",
    name: "",
    price: 0,
    initialQuantity: 0,
    quantity: 0,
    image: "",
    description: "",
    createdAt: new Date().toISOString(),
  };
  const [formData, setFormData] = useState(initialFormState);

  // 2. State quản lý các trường tự định nghĩa (Key - Value)
  const [attributesList, setAttributesList] = useState<{ key: string; value: string }[]>([]);

  // --- LẮNG NGHE DỮ LIỆU REALTIME (READ) ---
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- QUẢN LÝ THUỘC TÍNH (ATTRIBUTES) ---
  const addAttributeRow = () => {
    setAttributesList([...attributesList, { key: "", value: "" }]);
  };

  const updateAttributeRow = (index: number, field: "key" | "value", val: string) => {
    const newList = [...attributesList];
    newList[index][field] = val;
    setAttributesList(newList);
  };

  const removeAttributeRow = (index: number) => {
    const newList = [...attributesList];
    newList.splice(index, 1);
    setAttributesList(newList);
  };

  // --- SUBMIT LÊN FIREBASE (CREATE / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (!formData.name || !formData.categoryId || formData.price <= 0) {
        throw new Error("Vui lòng nhập tên, danh mục và giá sản phẩm (lớn hơn 0)!");
      }

      // Chuyển mảng attributesList (UI) thành Object Record<string, string> (Database)
      const attributesObj: Record<string, string> = {};
      attributesList.forEach((attr) => {
        const k = attr.key.trim();
        const v = attr.value.trim();
        if (k && v) {
          attributesObj[k] = v;
        }
      });

      const payload: Omit<Product, "id"> = {
        ...formData,
        attributes: attributesObj,
      };

      if (editingId) {
        // Cập nhật sản phẩm hiện có
        await updateDoc(doc(db, "products", editingId), payload);
      } else {
        // Thêm sản phẩm mới (chèn thêm ngày tạo)
        await addDoc(collection(db, "products"), {
          ...payload,
          initialQuantity: formData.initialQuantity,
          createdAt: new Date().toISOString(),
        });
      }

      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // --- CHUẨN BỊ SỬA DỮ LIỆU (EDIT) ---
  const handleEdit = (product: Product) => {
    setEditingId(product.id);

    // Đổ dữ liệu cơ bản vào Form
    setFormData({
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
      initialQuantity: product.initialQuantity,
      quantity: product.quantity,
      image: product.image,
      description: product.description,
      createdAt: product.createdAt,
    });

    // Chuyển Object attributes từ DB về lại dạng mảng để hiển thị lên UI
    const attrs = product.attributes
      ? Object.entries(product.attributes).map(([key, value]) => ({ key, value }))
      : [];
    setAttributesList(attrs);

    // Cuộn trang lên form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HỦY CHẾ ĐỘ SỬA ---
  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setAttributesList([]);
    setErrorMsg("");
  };

  // --- XÓA DỮ LIỆU (DELETE) ---
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Thao tác không thể phục hồi.")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err: any) {
        alert("Lỗi khi xóa: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 bg-slate-50 min-h-screen">
      {/* CỘT TRÁI: FORM NHẬP LIỆU */}
      <div className="lg:w-2/5 space-y-6">
        <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-orange-400 shadow-orange-100' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5 text-orange-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingId ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-white flex items-center gap-1 text-xs font-semibold bg-red-500 hover:bg-red-600 px-2 py-1 rounded">
                <X className="w-4 h-4" /> Huỷ sửa
              </button>
            )}
          </div>

          {/* 1. THÔNG TIN CƠ BẢN */}
          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold text-blue-600 uppercase border-b pb-2">1. Thông tin cơ bản</p>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tên sản phẩm chi tiết</label>
              <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white" placeholder="VD: Áo Polo - Đen - Size L" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mã danh mục</label>
                <input name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white" placeholder="ID danh mục" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Số lượng nhập kho ban đầu</label>
                <input type="number" name="initialQuantity" value={formData.initialQuantity === 0 && !formData.name ? "" : formData.initialQuantity} onChange={(e) => setFormData(p => ({ ...p, initialQuantity: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white" placeholder="0" min="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Số lượng tồn kho hiện tại</label>
                <input type="number" name="quantity" value={formData.quantity === 0 && !formData.name ? "" : formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white" placeholder="0" min="0" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Giá bán (VNĐ)</label>
              <NumericFormat thousandSeparator="." decimalSeparator="," value={formData.price === 0 && !formData.name ? "" : formData.price} onValueChange={(v) => setFormData(p => ({ ...p, price: v.floatValue || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white" placeholder="Nhập giá bán..." />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">URL Ảnh sản phẩm</label>
              <input name="image" value={formData.image} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white" placeholder="https://..." />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mô tả</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" placeholder="Mô tả sản phẩm..." />
            </div>
          </div>

          {/* 2. THUỘC TÍNH MỞ RỘNG (KEY - VALUE) */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-end border-b pb-2">
              <p className="text-sm font-bold text-orange-600 uppercase flex items-center gap-2">
                <Tag className="w-4 h-4" /> 2. Thuộc tính mở rộng
              </p>
              <button type="button" onClick={addAttributeRow} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800">
                <ListPlus className="w-4 h-4" /> Thêm dòng
              </button>
            </div>

            {attributesList.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-2">Chưa có thuộc tính. Bấm "Thêm dòng" để tạo (VD: Màu sắc - Đen)</p>
            )}

            <div className="space-y-2">
              {attributesList.map((attr, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={attr.key}
                    onChange={(e) => updateAttributeRow(index, "key", e.target.value)}
                    placeholder="Tên thuộc tính (VD: Size)"
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-400"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttributeRow(index, "value", e.target.value)}
                    placeholder="Giá trị (VD: XL)"
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-400"
                  />
                  <button type="button" onClick={() => removeAttributeRow(index)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} disabled:opacity-50`}>
            {loading ? "Đang xử lý..." : editingId ? "LƯU CẬP NHẬT" : "LƯU SẢN PHẨM"}
          </button>

          {errorMsg && <p className="text-red-500 text-xs mt-3 text-center bg-red-50 p-2 rounded-lg border border-red-100">{errorMsg}</p>}
        </form>
      </div>

      {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
      <div className="lg:w-3/5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
          <div className="p-4 border-b bg-white">
            <h3 className="font-bold text-slate-800 uppercase text-sm">Danh sách kho hàng ({products.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Mã SP</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Thuộc tính</th>
                  <th className="px-4 py-3 text-right">Nhập kho</th>
                  <th className="px-4 py-3 text-right">Tồn kho</th>
                  <th className="px-4 py-3 text-right">Đã bán</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-sm">Chưa có sản phẩm nào.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-600">
                        <p className="whitespace-nowrap text-[10px] text-blue-500 font-medium mt-1">{formatShortId(p.id)}</p>
                        {/* <p className="whitespace-break-spaces text-[10px] text-blue-500 font-medium mt-1">{formatDate(p.createdAt)}</p> */}
                      </td>

                      <td className="px-4 py-4 flex gap-3 min-w-[200px]">
                        <img src={p.image} className="w-12 h-12 rounded-lg object-cover border bg-slate-100 shrink-0" alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/150x150?text=No+Image"; }} />
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-2">{p.name}</p>
                          <p className="text-[10px] text-blue-500 font-medium mt-1">DM: {p.categoryId}</p>
                          <p className="whitespace-break-spaces text-[10px] text-blue-500 font-medium mt-1">{formatDate(p.createdAt)}</p>

                        </div>
                      </td>

                      <td className="px-4 py-4 min-w-[150px]">
                        {p.attributes && Object.keys(p.attributes).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(p.attributes).map(([key, value]) => (
                              <span key={key} className="px-2 py-0.5 bg-orange-50 text-[10px] rounded border border-orange-200 text-orange-700">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">- Trống -</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-medium text-slate-600">
                        {p.initialQuantity}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-slate-600">
                        {p.quantity}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-slate-600">
                        {p.initialQuantity - p.quantity}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-blue-600 whitespace-nowrap">
                        {p.price.toLocaleString("vi-VN")} đ
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Sửa">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}