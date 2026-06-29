"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { OrderItem, Product } from "@/core/services/data-base";
import { db } from "@/core/services/firebase";

import Cart from "@/core/features/(home)/components/Cart";
import Detail from "@/core/features/(home)/components/Detail";
import Home from "@/core/features/(home)/components/Home";

export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selected, setSelected] = useState<Product | null>(null);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        return onSnapshot(collection(db, "products"), snapshot => {
            setProducts(
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Product[]
            );
        });
    }, []);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const exist = prev.find(item => item.productId === product.id);

            if (!exist) {
                return [
                    ...prev,
                    {
                        productId: product.id,
                        quantity: 1,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                    },
                ];
            }

            return prev.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        });

        setShowCart(true);
    };

    const increase = (productId: string) => {
        setCart(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decrease = (productId: string) => {
        setCart(prev =>
            prev
                .map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    return (
        <>
            <Home
                products={products}
                cart={cart}
                onOpenCart={() => setShowCart(true)}
                onDetail={setSelected}
                onAdd={addToCart}
            />

            <Detail
                product={selected}
                onClose={() => setSelected(null)}
                onAdd={addToCart}
            />

            <Cart
                open={showCart}
                items={cart}
                onClose={() => setShowCart(false)}
                onIncrease={increase}
                onDecrease={decrease}
            />
        </>
    );
}