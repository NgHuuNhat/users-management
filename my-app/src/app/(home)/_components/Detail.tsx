"use client";

import { Product } from "@/core/services/types/data-base";

interface Props {
  product: Product | null;

  onClose: () => void;

  onAdd: (
    product: Product
  ) => void;
}

export default function Detail({
  product,
  onClose,
  onAdd,
}: Props) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-[40px] p-8 max-w-5xl w-full grid md:grid-cols-2 gap-10">
        <img
          src={product.image}
          className="rounded-[32px]"
        />

        <div>
          <h2 className="text-5xl font-semibold">
            {product.name}
          </h2>

          <p className="mt-6 text-slate-500 leading-8">
            {product.description}
          </p>

          <div className="mt-10 text-4xl font-semibold">
            {(
              product.price ?? 0
            ).toLocaleString()}
            ₫
          </div>

          <div className="flex gap-4 mt-10">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-full bg-slate-200"
            >
              Đóng
            </button>

            <button
              onClick={() =>
                onAdd(product)
              }
              className="px-8 py-4 rounded-full bg-black text-white"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}