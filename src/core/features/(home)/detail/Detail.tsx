"use client";

import { Product } from "@/core/services/data-base";

interface Props {
    product: Product | null;
    onClose: () => void;
    onAdd: (product: Product) => void;
}

export default function Detail({ product, onClose, onAdd }: Props) {
    if (!product) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="grid w-full max-w-5xl gap-6 rounded-[32px] bg-white p-5 shadow-2xl transition-all duration-300 sm:p-8 md:grid-cols-2"
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full rounded-2xl object-cover"
                />

                <div className="flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                            {product.name}
                        </h2>

                        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-base">
                            {product.description}
                        </p>

                        <div className="mt-6 text-2xl font-semibold sm:mt-10 sm:text-3xl md:text-4xl">
                            {(product.price ?? 0).toLocaleString()}₫
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3 sm:mt-10">
                        <button
                            onClick={onClose}
                            className="cursor-pointer flex-1 rounded-full bg-slate-200 px-5 py-3 text-sm font-medium transition hover:bg-slate-300 active:scale-95 sm:py-4"
                        >
                            Đóng
                        </button>

                        <button
                            onClick={() => onAdd(product)}
                            className="cursor-pointer flex-1 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-95 sm:py-4"
                        >
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}