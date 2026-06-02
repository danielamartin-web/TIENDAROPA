import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Product } from '@/data/products';

interface ProductsResponse {
  products: Product[];
}

interface ProductResponse {
  product: Product;
}

interface UseProductsOptions {
  category?: string;
  inStockOnly?: boolean;
  enabled?: boolean;
  initialData?: Product[];
  keepStaleOnError?: boolean;
}

export function useProducts(opts: UseProductsOptions = {}) {
  const { category, inStockOnly, enabled = true, initialData = [], keepStaleOnError = false } = opts;
  const [products, setProducts] = useState<Product[]>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (inStockOnly) params.set('inStock', 'true');
    const qs = params.toString();
    try {
      const data = await api.get<ProductsResponse>(`/api/products${qs ? `?${qs}` : ''}`);
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
      if (!keepStaleOnError) {
        setProducts(initialData);
      }
    } finally {
      setLoading(false);
    }
  }, [category, inStockOnly, initialData, keepStaleOnError]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProducts();
  }, [enabled, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: number | null, fallback?: Product | null) {
  const [product, setProduct] = useState<Product | null>(fallback ?? null);
  const [loading, setLoading] = useState(id != null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null || !Number.isFinite(id)) {
      setProduct(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ProductResponse>(`/api/products/${id}`)
      .then((data) => {
        if (!cancelled) setProduct(data.product);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setProduct(fallback ?? null);
          setError('not_found');
        } else {
          setError(err instanceof Error ? err.message : 'unknown_error');
          if (fallback) setProduct(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, fallback]);

  return { product, loading, error };
}

export type ProductInput = Omit<Product, 'id'>;

export function useProductMutations(onSuccess?: () => void) {
  const [saving, setSaving] = useState(false);

  const createProduct = useCallback(
    async (input: ProductInput) => {
      setSaving(true);
      try {
        const data = await api.post<ProductResponse>('/api/products', input, { auth: true });
        onSuccess?.();
        return data.product;
      } finally {
        setSaving(false);
      }
    },
    [onSuccess]
  );

  const updateProduct = useCallback(
    async (id: number, patch: Partial<ProductInput>) => {
      setSaving(true);
      try {
        const data = await api.patch<ProductResponse>(`/api/products/${id}`, patch, { auth: true });
        onSuccess?.();
        return data.product;
      } finally {
        setSaving(false);
      }
    },
    [onSuccess]
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      setSaving(true);
      try {
        await api.delete(`/api/products/${id}`, { auth: true });
        onSuccess?.();
      } finally {
        setSaving(false);
      }
    },
    [onSuccess]
  );

  return { createProduct, updateProduct, deleteProduct, saving };
}
