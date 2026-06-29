"use client";

import { Product } from "@/core/services/data-base";
import Footer from "./Footer";

interface Props {
  products: Product[];
  onDetail: (product: Product) => void;
  onAdd: (product: Product) => void;
}

export default function Main({ products, onDetail, onAdd }: Props) {
  return (
    <>
      <main className="min-h-screen bg-[#f5f5f7]">

        <section className="px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Khám phá sản phẩm.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg lg:text-xl">
            Thiết kế tối giản. Trải nghiệm hiện đại.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-3xl bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5 lg:p-6"
              >
                <div onClick={() => onDetail(product)} className="cursor-pointer">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100 sm:rounded-3xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-4 text-base font-semibold sm:text-lg lg:mt-6 lg:text-xl">
                    {product.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500 sm:text-base">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between lg:mt-6">
                  <span className="text-lg font-semibold sm:text-xl lg:text-2xl">
                    {(product.price ?? 0).toLocaleString()}₫
                  </span>

                  <button
                    onClick={() => onAdd(product)}
                    className="cursor-pointer rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 sm:px-5"
                  >
                    Mua
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}