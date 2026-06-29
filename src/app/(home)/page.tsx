"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { Product } from "@/core/services/data-base";
import { db } from "@/core/services/firebase";

import Cart from "@/core/features/(home)/cart/Cart";
import Detail from "@/core/features/(home)/detail/Detail";
import { useCartStore } from "@/core/features/(home)/cart/cart-store";
import Main from "@/core/features/(home)/Main";

export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selected, setSelected] = useState<Product | null>(null);

    const { addItem, increase, decrease, openCart } = useCartStore();

    useEffect(() => {
        return onSnapshot(collection(db, "products"), (snapshot) => {
            setProducts(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Product[]
            );
        });
    }, []);

    const handleAdd = (product: Product) => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });

        openCart();
    };

    return (
        <>
            <Main
                products={products}
                onDetail={setSelected}
                onAdd={handleAdd}
            />

            <Detail
                product={selected}
                onClose={() => setSelected(null)}
                onAdd={handleAdd}
            />

            <Cart />
        </>
    );
}