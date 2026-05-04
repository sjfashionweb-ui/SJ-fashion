import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Heart, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../lib/products";
import { useCart } from "../lib/cart";
import { toast } from "sonner";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const { add, toggleWishlist, wishlist } = useCart();
  const nav = useNavigate();
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);

  const sizes = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.size) || [])),
    [product],
  );
  const colors = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.color) || [])),
    [product],
  );

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [products, product]);

  if (loading) return <div className="max-w-7xl mx-auto p-12 text-neutral-400">Loading...</div>;
  if (!product)
    return (
      <div className="max-w-7xl mx-auto p-12 text-center">
        <h1 className="font-display text-4xl mb-2">Product not found</h1>
        <Link to="/" className="text-amber-400 hover:underline">Go home</Link>
      </div>
    );

  const liked = wishlist.includes(product.id);

  function handleAdd() {
    if (sizes.length && !size) return toast.error("Please select a size");
    if (colors.length && !color) return toast.error("Please select a color");
    add(product!, size || "OS", color || "Default", qty);
    toast.success(`Added ${qty} × ${product!.name} to cart`);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-neutral-900 rounded-xl overflow-hidden aspect-square">
          <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-2">{product.brand}</p>
          <h1 className="font-display text-4xl mb-3">{product.name}</h1>
          <p className="text-3xl font-light mb-6">LKR {product.price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-neutral-400 mb-8">{product.description}</p>

          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 h-12 px-4 border rounded text-sm ${size === s ? "bg-amber-400 text-black border-amber-400" : "border-white/20 hover:border-amber-400"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-6">
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Color</p>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 h-10 border rounded text-sm ${color === c ? "bg-amber-400 text-black border-amber-400" : "border-white/20 hover:border-amber-400"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center border border-white/20 rounded">
              <button className="w-10 h-12" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-12 text-center">{qty}</span>
              <button className="w-10 h-12" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <Button size="lg" className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-semibold" onClick={handleAdd}>
              <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-amber-400 text-amber-400" : ""}`} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div className="flex items-start gap-2">
              <Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Free Shipping</p>
                <p className="text-xs text-neutral-500">Over LKR 15,000</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">30-Day Returns</p>
                <p className="text-xs text-neutral-500">Hassle-free</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Authentic</p>
                <p className="text-xs text-neutral-500">Guaranteed</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Badge variant="outline" className="border-white/20">Category: <span className="ml-1 capitalize">{product.category}</span></Badge>
            {product.subcategory && <Badge variant="outline" className="border-white/20">{product.subcategory}</Badge>}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (<ProductCard key={p.id} p={p} />))}
          </div>
        </section>
      )}
    </div>
  );
}