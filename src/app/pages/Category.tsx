import { useMemo, useState, useEffect } from "react"; // ADDED useEffect
import { useParams, useSearchParams, Link } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { useProducts } from "../lib/products";
import { CATEGORIES, CategoryKey, BRANDS, COLORS, SIZES } from "../lib/catalog";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const [params, setParams] = useSearchParams();
  const sub = params.get("sub") || "";
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState<[number, number]>([0, 1500]);
  const [sort, setSort] = useState("newest");

  // EXTRACTED 'refresh' here
  const { products, loading, refresh } = useProducts(); 
  
  // ADDED: Force fresh data fetch when the category loads or changes
  useEffect(() => {
    refresh();
  }, [refresh, category]);

  const cat = category as CategoryKey;
  const subs = CATEGORIES[cat] || [];

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.category === cat);
    if (sub) list = list.filter((p) => p.subcategory === sub);
    if (brand && brand !== "all") list = list.filter((p) => p.brand === brand);
    if (size) list = list.filter((p) => p.variants?.some((v) => v.size === size));
    if (color) list = list.filter((p) => p.variants?.some((v) => v.color === color));
    list = list.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, cat, sub, brand, size, color, price, sort]);

  if (!CATEGORIES[cat]) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-4xl mb-2">Category not found</h1>
        <Link to="/" className="text-amber-400 hover:underline">Go home</Link>
      </div>
    );
  }

  function setSub(s: string) {
    const next = new URLSearchParams(params);
    if (s) next.set("sub", s);
    else next.delete("sub");
    setParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <nav className="text-xs text-neutral-500 mb-2 tracking-widest uppercase">
        <Link to="/" className="hover:text-amber-400">Home</Link> / <span className="text-white capitalize">{cat}</span>
        {sub && <> / <span className="text-amber-400">{sub}</span></>}
      </nav>
      <h1 className="font-display text-5xl capitalize mb-2">{sub || cat}</h1>
      <p className="text-neutral-400 mb-8">{filtered.length} products</p>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="space-y-8">
          <div>
            <h3 className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Subcategory</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSub("")}
                className={`text-xs px-3 py-1.5 rounded-full border ${!sub ? "bg-amber-400 text-black border-amber-400" : "border-white/20 text-neutral-300 hover:border-amber-400"}`}
              >
                All
              </button>
              {subs.map((s) => (
                <button
                  key={s}
                  onClick={() => setSub(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${sub === s ? "bg-amber-400 text-black border-amber-400" : "border-white/20 text-neutral-300 hover:border-amber-400"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Brand</h3>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {BRANDS.map((b) => (
                  <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(size === s ? "" : s)}
                  className={`w-10 h-10 rounded border text-xs ${size === s ? "bg-amber-400 text-black border-amber-400" : "border-white/20 hover:border-amber-400"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Color</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? "" : c)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${color === c ? "bg-amber-400 text-black border-amber-400" : "border-white/20 text-neutral-300 hover:border-amber-400"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">
              Price: ${price[0]} - ${price[1]}
            </h3>
            <Slider
              min={0}
              max={1500}
              step={10}
              value={price}
              onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
            />
          </div>

          <Button
            variant="outline"
            className="w-full border-white/20"
            onClick={() => {
              setSub("");
              setBrand("");
              setSize("");
              setColor("");
              setPrice([0, 1500]);
            }}
          >
            Clear filters
          </Button>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {brand && brand !== "all" && (
                <Badge className="bg-amber-400 text-black" onClick={() => setBrand("")}>
                  {brand} ✕
                </Badge>
              )}
              {size && (
                <Badge className="bg-amber-400 text-black" onClick={() => setSize("")}>
                  Size {size} ✕
                </Badge>
              )}
              {color && (
                <Badge className="bg-amber-400 text-black" onClick={() => setColor("")}>
                  {color} ✕
                </Badge>
              )}
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="low">Price: Low → High</SelectItem>
                <SelectItem value="high">Price: High → Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-neutral-400">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-xl">
              <p className="text-neutral-400">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}