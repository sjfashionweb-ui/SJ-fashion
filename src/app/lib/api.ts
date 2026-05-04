import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8d4aec83`;

const authHeaders = () => ({
  Authorization: `Bearer ${publicAnonKey}`,
});

export type Variant = {
  size: string;
  color: string;
  stock: number;
  price?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: "men" | "women" | "kids";
  subcategory: string;
  brand: string;
  price: number;
  imageUrl: string;
  variants: Variant[];
  createdAt: string;
};

export type Order = {
  id: string;
  customer: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

async function handle<T>(res: Response, ctx: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`API error in ${ctx}: ${res.status} ${text}`);
    throw new Error(`${ctx} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`, { headers: authHeaders() });
  const data = await handle<{ products: Product[] }>(res, "listProducts");
  return data.products || [];
}

export async function createProduct(p: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const data = await handle<{ product: Product }>(res, "createProduct");
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handle(res, "deleteProduct");
}

export async function uploadImage(
  file: File,
): Promise<{ url: string; path: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });
  return handle<{ url: string; path: string }>(res, "uploadImage");
}

export async function listOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE}/orders`, { headers: authHeaders() });
  const data = await handle<{ orders: Order[] }>(res, "listOrders");
  return data.orders || [];
}

export async function createOrder(o: Partial<Order>): Promise<Order> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(o),
  });
  const data = await handle<{ order: Order }>(res, "createOrder");
  return data.order;
}

export async function seedProducts(force = false): Promise<{ created?: number; skipped?: boolean }> {
  const res = await fetch(`${BASE}/seed${force ? "?force=1" : ""}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handle(res, "seedProducts");
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>,
): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await handle<{ order: Order }>(res, "updateOrder");
  return data.order;
}
