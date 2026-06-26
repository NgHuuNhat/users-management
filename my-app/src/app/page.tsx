"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/core/services/firebase";
import { Product } from "@/core/services/types/data-base";
import Menu from "./(home)/_components/Menu";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Product[] = [];

      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      setProducts(list);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [products, keyword]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Menu />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Cửa hàng sản phẩm
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Khám phá các sản phẩm mới nhất trong kho.
          </p>

          <div className="mt-5">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full md:w-96 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Danh sách */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Danh mục sản phẩm
          </h2>

          <div className="text-sm text-slate-500">
            {filteredProducts.length} sản phẩm
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center">
            <p className="text-slate-400">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group"
              >
                {/* Ảnh */}
                <div className="aspect-square overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).src =
                        "https://placehold.co/600x600?text=No+Image";
                    }}
                  />
                </div>

                {/* Nội dung */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-800 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-sm text-slate-500 line-clamp-3 min-h-[60px]">
                    {product.description}
                  </p>

                  <div className="text-xl font-bold text-blue-600">
                    {product.price?.toLocaleString("vi-VN")} đ
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        border
                        border-slate-200
                        text-sm
                        font-medium
                        hover:bg-slate-50
                      "
                    >
                      Chi tiết
                    </button>

                    <button
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        bg-blue-600
                        text-white
                        text-sm
                        font-medium
                        hover:bg-blue-700
                      "
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}