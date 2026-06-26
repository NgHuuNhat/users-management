"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/core/services/firebase";
import {
  Product,
  OrderItem,
} from "@/core/services/types/data-base";
import Cart from "./(home)/_components/Cart";
import Detail from "./(home)/_components/Detail";
import Home from "./(home)/_components/Home";

// import Home from "@/components/Home";
// import Detail from "@/components/Detail";
// import Cart from "@/components/Cart";

export default function Page() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [selected, setSelected] =
    useState<Product | null>(null);

  const [cart, setCart] =
    useState<OrderItem[]>([]);

  const [showCart, setShowCart] =
    useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        ) as Product[];

        setProducts(data);
      }
    );

    return unsubscribe;
  }, []);

  const addToCart = (
    product: Product
  ) => {
    setCart((prev) => {
      const exist = prev.find(
        (x) => x.productId === product.id
      );

      if (exist) {
        return prev.map((x) =>
          x.productId === product.id
            ? {
                ...x,
                quantity: x.quantity + 1,
              }
            : x
        );
      }

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
    });

    setShowCart(true);
  };

  const increase = (
    productId: string
  ) => {
    setCart((prev) =>
      prev.map((x) =>
        x.productId === productId
          ? {
              ...x,
              quantity: x.quantity + 1,
            }
          : x
      )
    );
  };

  const decrease = (
    productId: string
  ) => {
    setCart((prev) =>
      prev
        .map((x) =>
          x.productId === productId
            ? {
                ...x,
                quantity: x.quantity - 1,
              }
            : x
        )
        .filter((x) => x.quantity > 0)
    );
  };

  return (
    <>
      <Home
        products={products}
        cart={cart}
        onOpenCart={() =>
          setShowCart(true)
        }
        onDetail={setSelected}
        onAdd={addToCart}
      />

      <Detail
        product={selected}
        onClose={() =>
          setSelected(null)
        }
        onAdd={addToCart}
      />

      <Cart
        open={showCart}
        items={cart}
        onClose={() =>
          setShowCart(false)
        }
        onIncrease={increase}
        onDecrease={decrease}
      />
    </>
  );
}