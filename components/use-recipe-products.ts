"use client";

import { useCallback, useState } from "react";

type Product = { id: number; name: string };

let cachedProducts: Product[] | null = null;
let productsRequest: Promise<Product[]> | null = null;

async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  productsRequest ??= fetch("/api/fichas/products", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Nao foi possivel carregar os ingredientes.");
      const data = await response.json() as { products?: Product[] };
      cachedProducts = data.products ?? [];
      return cachedProducts;
    })
    .finally(() => {
      productsRequest = null;
    });

  return productsRequest;
}

export function useRecipeProducts() {
  const [products, setProducts] = useState<Product[]>(cachedProducts ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ensureProducts = useCallback(async () => {
    if (cachedProducts) {
      setProducts(cachedProducts);
      return cachedProducts;
    }

    setLoading(true);
    setError("");
    try {
      const loaded = await fetchProducts();
      setProducts(loaded);
      return loaded;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel carregar os ingredientes.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, ensureProducts };
}
