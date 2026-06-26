"use client";

import {
    Product,
    OrderItem,
} from "@/core/services/types/data-base";
import Menu from "./Menu";

interface Props {
    products: Product[];
    cart: OrderItem[];

    onOpenCart: () => void;
    onDetail: (
        product: Product
    ) => void;

    onAdd: (
        product: Product
    ) => void;
}

export default function Home({
    products,
    cart,
    onOpenCart,
    onDetail,
    onAdd,
}: Props) {
    const cartCount = cart.reduce(
        (s, x) => s + x.quantity,
        0
    );

    return (
        <main className="min-h-screen bg-[#f5f5f7]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Store
                    </h1>

                    {/* Menu */}
                    <Menu />

                    {/* Cart */}
                    {/* <button
                        onClick={onOpenCart}
                        className="
        relative
        h-10 w-10
        rounded-full
        hover:bg-zinc-100
        transition
        flex items-center justify-center
        text-xl
      "
                    >

                        <span className="d-flex">
                            <span>Giỏ hàng</span>
                            <span>🛒</span>
                        </span>

                        {cartCount > 0 && (
                            <span
                                className="
            absolute
            -top-1
            -right-1
            min-w-5
            h-5
            px-1
            rounded-full
            bg-black
            text-white
            text-[11px]
            flex items-center justify-center
          "
                            >
                                {cartCount}
                            </span>
                        )}
                    </button> */}


                    {/* <button
                        onClick={onOpenCart}
                        className="
    relative
    flex items-center gap-2
    px-4 py-2
    rounded-full
    hover:bg-zinc-200
    transition
    text-sm font-medium bg-black text-white cursor-pointer
  "
                    >
                        <span>Giỏ hàng</span>
                        <span className="text-lg">🛒</span>

                        {cartCount > 0 && (
                            <span
                                className="
        absolute
        -top-1
        -right-1
        min-w-5
        h-5
        px-1
        rounded-full
        bg-black
        text-white
        text-[11px]
        flex items-center justify-center
      "
                            >
                                {cartCount}
                            </span>
                        )}
                    </button> */}


                    {/* <button
                        onClick={onOpenCart}
                        className="
    relative
    flex items-center gap-2
    px-5 py-2.5
    rounded-full
    bg-black text-white
    text-sm font-medium
    shadow-sm
    hover:bg-zinc-800
    active:scale-[0.97]
    transition-all duration-200
    cursor-pointer
  "
                    >
                        <span>Giỏ hàng</span>
                        <span className="text-lg">🛒</span>

                        {cartCount > 0 && (
                            <span
                                className="
        absolute
        -top-1.5
        -right-1.5
        min-w-5 h-5
        px-1
        rounded-full
        bg-red-500
        text-white
        text-[11px]
        flex items-center justify-center
        shadow-md
      "
                            >
                                {cartCount}
                            </span>
                        )}
                    </button> */}

                    {/* <button onClick={onOpenCart} className="cursor-pointer relative flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white font-medium text-sm shadow-sm hover:bg-zinc-800 hover:shadow-md active:scale-95 transition-all duration-200">
                        <span>Giỏ hàng</span>
                        <span className="text-lg">🛒</span>

                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center shadow-md">
                                {cartCount}
                            </span>
                        )}
                    </button> */}

                    <button
                        onClick={onOpenCart}
                        className="cursor-pointer relative flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold text-sm shadow-md hover:bg-yellow-300 hover:shadow-lg active:scale-95 transition-all duration-200"
                    >
                        <span>Giỏ hàng</span>
                        <span className="text-lg">🛒</span>

                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center shadow-md">
                                {cartCount}
                            </span>
                        )}
                    </button>


                </div>
            </header>

            {/* Hero */}
            <section className="py-24 text-center px-6">
                <h2 className="text-6xl font-semibold tracking-tight">
                    Khám phá sản phẩm.
                </h2>

                <p className="mt-6 text-xl text-slate-500">
                    Thiết kế tối giản.
                    Trải nghiệm hiện đại.
                </p>
            </section>

            {/* Products */}
            <section className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <article
                            key={product.id}
                            className="
                bg-white
                rounded-[32px]
                p-6
                shadow-sm
                hover:shadow-xl
                transition
              "
                        >
                            <div
                                onClick={() =>
                                    onDetail(product)
                                }
                                className="cursor-pointer"
                            >
                                <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100">
                                    <img
                                        src={product.image}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <h3 className="mt-6 text-xl font-semibold">
                                    {product.name}
                                </h3>

                                <p className="mt-2 text-slate-500 line-clamp-2">
                                    {product.description}
                                </p>
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <span className="text-2xl font-semibold">
                                    {(
                                        product.price ?? 0
                                    ).toLocaleString()}
                                    ₫
                                </span>

                                <button
                                    onClick={() =>
                                        onAdd(product)
                                    }
                                    className="px-5 py-2 rounded-full bg-black text-white"
                                >
                                    Mua
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}