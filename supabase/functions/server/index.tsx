import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const BUCKET = "make-8d4aec83-products";

// Ensure storage bucket exists on startup
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET, { public: false });
      console.log(`Created bucket ${BUCKET}`);
    }
  } catch (e) {
    console.log(`Bucket init error: ${e}`);
  }
})();

app.get("/make-server-8d4aec83/health", (c) => c.json({ status: "ok" }));

// Upload a product image. Returns a signed URL valid for ~1 year.
app.post("/make-server-8d4aec83/upload", async (c) => {
  try {
    const form = await c.req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return c.json({ error: "No file provided in upload request" }, 400);
    }
    const ext = file.name.split(".").pop() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buf = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: file.type, upsert: false });
    if (upErr) {
      console.log(`Storage upload error for ${path}: ${upErr.message}`);
      return c.json({ error: `Upload failed: ${upErr.message}` }, 500);
    }
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signed) {
      console.log(`Signing error for ${path}: ${signErr?.message}`);
      return c.json({ error: `Sign URL failed: ${signErr?.message}` }, 500);
    }
    return c.json({ path, url: signed.signedUrl });
  } catch (e) {
    console.log(`Upload route error: ${e}`);
    return c.json({ error: `Upload route error: ${e}` }, 500);
  }
});

// Products
app.get("/make-server-8d4aec83/products", async (c) => {
  try {
    const items = await kv.getByPrefix("product:");
    return c.json({ products: items });
  } catch (e) {
    console.log(`List products error: ${e}`);
    return c.json({ error: `List products error: ${e}` }, 500);
  }
});

app.post("/make-server-8d4aec83/products", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const product = {
      id,
      name: body.name,
      description: body.description || "",
      category: body.category, // men | women | kids
      subcategory: body.subcategory || "",
      brand: body.brand || "",
      price: Number(body.price) || 0,
      imageUrl: body.imageUrl || "",
      variants: Array.isArray(body.variants) ? body.variants : [],
      createdAt: body.createdAt || new Date().toISOString(),
    };
    await kv.set(`product:${id}`, product);
    return c.json({ product });
  } catch (e) {
    console.log(`Create product error: ${e}`);
    return c.json({ error: `Create product error: ${e}` }, 500);
  }
});

app.delete("/make-server-8d4aec83/products/:id", async (c) => {
  try {
    await kv.del(`product:${c.req.param("id")}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log(`Delete product error: ${e}`);
    return c.json({ error: `Delete product error: ${e}` }, 500);
  }
});

// Orders
app.get("/make-server-8d4aec83/orders", async (c) => {
  try {
    const items = await kv.getByPrefix("order:");
    return c.json({ orders: items });
  } catch (e) {
    console.log(`List orders error: ${e}`);
    return c.json({ error: `List orders error: ${e}` }, 500);
  }
});

app.post("/make-server-8d4aec83/orders", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const order = {
      id,
      customer: body.customer || "Guest",
      items: body.items || [],
      total: Number(body.total) || 0,
      status: body.status || "pending",
      createdAt: body.createdAt || new Date().toISOString(),
    };
    await kv.set(`order:${id}`, order);
    return c.json({ order });
  } catch (e) {
    console.log(`Create order error: ${e}`);
    return c.json({ error: `Create order error: ${e}` }, 500);
  }
});

app.put("/make-server-8d4aec83/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`order:${id}`);
    if (!existing) return c.json({ error: "Order not found" }, 404);
    const body = await c.req.json();
    const updated = { ...existing, ...body, id };
    await kv.set(`order:${id}`, updated);
    return c.json({ order: updated });
  } catch (e) {
    console.log(`Update order error: ${e}`);
    return c.json({ error: `Update order error: ${e}` }, 500);
  }
});

// Seed sample products (idempotent — won't add if products already exist)
app.post("/make-server-8d4aec83/seed", async (c) => {
  try {
    const force = c.req.query("force") === "1";
    const existing = await kv.getByPrefix("product:");
    if (existing.length > 0 && !force) {
      return c.json({ skipped: true, count: existing.length });
    }
    if (force) {
      for (const p of existing) {
        await kv.del(`product:${p.id}`);
      }
    }
    const sample = SAMPLE_PRODUCTS();
    for (const p of sample) {
      await kv.set(`product:${p.id}`, p);
    }
    return c.json({ created: sample.length });
  } catch (e) {
    console.log(`Seed error: ${e}`);
    return c.json({ error: `Seed error: ${e}` }, 500);
  }
});

function SAMPLE_PRODUCTS() {
  const img = (id: string) =>
    `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;
  const v = (sizes: string[], colors: string[], stock = 12) =>
    sizes.flatMap((s) => colors.map((c) => ({ size: s, color: c, stock })));
  const SIZES = ["S", "M", "L", "XL"];
  const data: any[] = [
    { name: "Classic Black Tee", category: "men", subcategory: "T-Shirts", brand: "Nike", price: 29.99, imageUrl: img("1521572163474-6864f9cf17ab"), variants: v(SIZES, ["Black", "White", "Grey"]) },
    { name: "Slim Fit Denim Jeans", category: "men", subcategory: "Jeans", brand: "Levi's", price: 79.99, imageUrl: img("1542272604-787c3835535d"), variants: v(SIZES, ["Blue", "Black"]) },
    { name: "Leather Bomber Jacket", category: "men", subcategory: "Jackets", brand: "Zara", price: 199.99, imageUrl: img("1551028719-00167b16eac5"), variants: v(["M", "L", "XL"], ["Black", "Brown"]) },
    { name: "Athletic Hoodie", category: "men", subcategory: "Hoodies", brand: "Adidas", price: 64.99, imageUrl: img("1556821840-3a63f95609a7"), variants: v(SIZES, ["Black", "Navy", "Grey"]) },
    { name: "Oxford Dress Shirt", category: "men", subcategory: "Shirts", brand: "Tommy Hilfiger", price: 89.99, imageUrl: img("1564584217132-2271feaeb3c5"), variants: v(SIZES, ["White", "Blue"]) },
    { name: "Running Sneakers", category: "men", subcategory: "Footwear", brand: "Puma", price: 119.99, imageUrl: img("1542291026-7eec264c27ff"), variants: v(["S", "M", "L"], ["Black", "White", "Red"]) },
    { name: "Floral Summer Dress", category: "women", subcategory: "Dresses", brand: "Zara", price: 89.99, imageUrl: img("1515372039744-b8f02a3ae446"), variants: v(["XS", "S", "M", "L"], ["Pink", "Yellow", "White"]) },
    { name: "Silk Blouse", category: "women", subcategory: "Tops", brand: "H&M", price: 59.99, imageUrl: img("1551163943-3f6a855d1153"), variants: v(SIZES, ["White", "Black", "Beige"]) },
    { name: "High Waist Skinny Jeans", category: "women", subcategory: "Jeans", brand: "Levi's", price: 89.99, imageUrl: img("1541099649105-f69ad21f3246"), variants: v(SIZES, ["Blue", "Black"]) },
    { name: "Designer Handbag", category: "women", subcategory: "Footwear", brand: "Gucci", price: 1299.99, imageUrl: img("1584917865442-de89df76afd3"), variants: v(["M"], ["Black", "Beige"]) },
    { name: "Wool Trench Coat", category: "women", subcategory: "Jackets", brand: "Calvin Klein", price: 249.99, imageUrl: img("1591047139829-d91aecb6caea"), variants: v(SIZES, ["Beige", "Black", "Navy"]) },
    { name: "Pleated Mini Skirt", category: "women", subcategory: "Skirts", brand: "Zara", price: 49.99, imageUrl: img("1583496661160-fb5886a13d44"), variants: v(["XS", "S", "M"], ["Black", "Red", "Beige"]) },
    { name: "Yoga Leggings", category: "women", subcategory: "Activewear", brand: "Nike", price: 69.99, imageUrl: img("1571019613454-1cb2f99b2d8b"), variants: v(SIZES, ["Black", "Navy", "Grey"]) },
    { name: "Embroidered Kurta", category: "women", subcategory: "Kurtas", brand: "H&M", price: 79.99, imageUrl: img("1610030181087-540017dc9d77"), variants: v(SIZES, ["White", "Pink", "Blue"]) },
    { name: "Boys Graphic Tee", category: "kids", subcategory: "Boys T-Shirts", brand: "Puma", price: 24.99, imageUrl: img("1503944583220-79d8926ad5e2"), variants: v(["S", "M"], ["Red", "Blue", "Black"]) },
    { name: "Girls Party Dress", category: "kids", subcategory: "Girls Dresses", brand: "H&M", price: 39.99, imageUrl: img("1518831959646-742c3a14ebf7"), variants: v(["XS", "S", "M"], ["Pink", "White"]) },
    { name: "Kids Sneakers", category: "kids", subcategory: "Footwear", brand: "Adidas", price: 49.99, imageUrl: img("1514989940723-e8e51635b782"), variants: v(["S", "M"], ["White", "Pink", "Blue"]) },
    { name: "Cotton Pajama Set", category: "kids", subcategory: "Sleepwear", brand: "H&M", price: 29.99, imageUrl: img("1622290291468-a28f7a7dc6a8"), variants: v(["XS", "S", "M"], ["Blue", "Pink", "Yellow"]) },
    { name: "School Uniform Shirt", category: "kids", subcategory: "School Uniforms", brand: "Tommy Hilfiger", price: 34.99, imageUrl: img("1622445275576-721325763afe"), variants: v(["S", "M", "L"], ["White", "Blue"]) },
    { name: "Kids Activewear Set", category: "kids", subcategory: "Activewear", brand: "Nike", price: 54.99, imageUrl: img("1503454537195-1dcabb73ffb9"), variants: v(["S", "M"], ["Black", "Red"]) },
  ];
  return data.map((d) => ({
    ...d,
    id: crypto.randomUUID(),
    description: `Premium quality ${d.name.toLowerCase()} from ${d.brand}. Crafted with care for everyday luxury.`,
    createdAt: new Date().toISOString(),
  }));
}

Deno.serve(app.fetch);
