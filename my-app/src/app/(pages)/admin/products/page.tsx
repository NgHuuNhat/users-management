"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { Product } from "@/core/services/types/data-base";
import { db } from "@/core/services/firebase";
import { NumericFormat } from "react-number-format";
// import { db } from "@/lib/firebase"; 
// import { Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Trạng thái Form theo đúng cấu trúc dữ liệu Product (loại trừ id tự sinh)
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: null,
    image: "",
    description: "",
  });

  // 1. Lắng nghe danh sách sản phẩm real-time từ Firestore
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  // 2. Xử lý thay đổi dữ liệu các trường Input và Textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value, // Ép kiểu số trực tiếp cho trường price
    }));
  };

  // 3. Xử lý sự kiện gửi Form thêm sản phẩm
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (!formData.name || !formData.image || !formData.description) {
        throw new Error("Vui lòng nhập đầy đủ các trường thông tin!");
      }

      if (formData.price <= 0) {
        throw new Error("Giá bán sản phẩm bắt buộc phải lớn hơn 0 đ.");
      }

      // Đẩy thẳng object formData sạch lên Firestore collection 'product'
      await addDoc(collection(db, "products"), formData);

      // Reset Form về trạng thái ban đầu
      setFormData({ name: "", price: 0, image: "", description: "" });
    } catch (err: any) {
      setErrorMsg(err.message || "Xảy ra lỗi trong quá trình lưu dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* KHU VỰC THÊM SẢN PHẨM MỚI */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h3 className="text-base font-bold mb-4 text-slate-800 uppercase tracking-tight">Thêm sản phẩm mới</h3>

        {errorMsg && (
          <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ví dụ: Áo khoác da Bomber"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Giá bán (VNĐ)</label>
            {/* <input
              type="number"
              name="price"
              value={formData.price || ""}
              onChange={handleInputChange}
              placeholder="Ví dụ: 450000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            <NumericFormat
              value={debtInput ?? ""}
              thousandSeparator
              decimalScale={0}
              allowNegative={false}
              onValueChange={(values) => {
                setDebtInput(values.floatValue ?? null);
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
            /> */}
            <NumericFormat
              value={formData.price ?? ""}
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={0}
              allowNegative={false}
              placeholder="Ví dụ: 450000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              onValueChange={(values) => {
                setFormData((prev) => ({
                  ...prev,
                  price: values.floatValue ?? null,
                }));
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Đường dẫn hình ảnh (URL)</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Mô tả sản phẩm</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập chất liệu, thông số size hoặc mô tả ngắn gọn..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-150 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
              }`}
          >
            {loading ? "Đang ghi nhận dữ liệu..." : "Lưu Sản Phẩm Vào Kho"}
          </button>
        </form>
      </div>

      {/* KHU VỰC DANH SÁCH SẢN PHẨM HIỆN CÓ */}
      <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-base font-bold mb-4 text-slate-800 uppercase tracking-tight">
          Danh mục kho hàng ({products.length})
        </h3>

        {products.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-400 text-sm">Kho trống. Chưa có dữ liệu sản phẩm nào trên hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/50">
                  <th className="py-3 px-3 w-16">Ảnh</th>
                  <th className="py-3 px-4 w-48">Tên sản phẩm</th>
                  <th className="py-3 px-4">Mô tả chi tiết</th>
                  <th className="py-3 px-4 w-32">Đơn giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shadow-sm"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/150x150?text=No+Image"; }}
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 align-top pt-4">
                      {product.name}
                      <div className="text-[10px] font-mono text-slate-400 font-normal mt-1 select-all">
                        ID: {product.id}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs break-words align-top pt-4 whitespace-pre-line">
                      {product.description}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 align-top pt-4">
                      {product.price.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}