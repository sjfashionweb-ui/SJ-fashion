import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProducts } from "../lib/products";
import { useCart } from "../lib/cart";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

// LKR Formatter
const formatLKR = (amount: number) => {
  return amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading, refresh } = useProducts();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0); // State for the image gallery
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Force fresh fetch on load
  useEffect(() => {
    refresh();
  }, [refresh, id]);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const liked = product ? wishlist.includes(product.id) : false;

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-32 text-center text-neutral-400">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-4xl mb-4 text-white">Product not found</h1>
        <Button onClick={() => navigate(-1)} variant="outline" className="border-white/20 text-white">
          Go Back
        </Button>
      </div>
    );
  }

  // 1. Get all images (fallback to single imageUrl if array is empty)
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  // 2. Dynamic Bulk Price Calculation
  const currentPrice = (() => {
    if (!product.bulkPricing || product.bulkPricing.length === 0) return product.price;
    
    // Sort tiers by quantity descending to find the highest applicable discount
    const applicableTier = [...product.bulkPricing]
      .sort((a, b) => b.minQty - a.minQty)
      .find(tier => qty >= tier.minQty);
      
    return applicableTier ? applicableTier.price : product.price;
  })();

  const sizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));
  const colors = Array.from(new Set(product.variants?.map((v) => v.color) || []));

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) return toast.error("Please select a size");
    if (colors.length > 0 && !selectedColor) return toast.error("Please select a color");
    
    addToCart({
      productId: product!.id,
      name: product!.name,
      price: currentPrice, // Add to cart at the discounted price!
      qty,
      image: images[0],
      size: selectedSize,
      color: selectedColor,
    });
    toast.success("Added to cart");
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-xs text-neutral-400 hover:text-amber-400 mb-8 uppercase tracking-widest transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* IMAGE GALLERY SECTION */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-neutral-900 rounded-xl overflow-hidden border border-white/5">
            <ImageWithFallback src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <Badge className="absolute top-4 left-4 bg-amber-400 text-black text-xs px-3 py-1 font-bold tracking-widest shadow-lg">
                WHOLESALE
              </Badge>
            )}
          </div>
          
          {/* Thumbnails (Only show if there's more than 1 image) */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImg(idx)}
                  className={`relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors duration-300 ${activeImg === idx ? 'border-amber-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS SECTION */}
        <div className="py-4">
          <div className="mb-8">
            <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">{product.brand}</p>
            <h1 className="font-display text-4xl lg:text-5xl text-white mb-4 leading-tight">{product.name}</h1>
            
            {/* PRICING DISPLAY */}
            <div className="flex flex-col gap-1 mb-6">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-amber-400">LKR {formatLKR(currentPrice)}</p>
                {qty > 1 && currentPrice < product.price && (
                  <span className="text-lg text-neutral-500 line-through">LKR {formatLKR(product.price)}</span>
                )}
              </div>
              {qty > 1 && currentPrice < product.price && (
                <p className="text-emerald-400 text-sm font-medium">✨ Bulk discount applied!</p>
              )}
            </div>

            {/* WHOLESALE TIER LEGEND */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <div className="mb-8 p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl space-y-2">
                <h4 className="text-[10px] uppercase tracking-widest text-amber-400 mb-3 font-bold">Volume Pricing</h4>
                <div className="flex justify-between text-sm text-neutral-300 border-b border-white/5 pb-2">
                  <span>1 - {product.bulkPricing.sort((a,b) => a.minQty - b.minQty)[0].minQty - 1} pieces</span>
                  <span className="font-medium text-white">LKR {formatLKR(product.price)} / ea</span>
                </div>
                {product.bulkPricing.sort((a, b) => a.minQty - b.minQty).map((tier, idx, arr) => (
                  <div key={idx} className="flex justify-between text-sm text-neutral-300 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span>{tier.minQty}{arr[idx + 1] ? ` - ${arr[idx + 1].minQty - 1}` : '+'} pieces</span>
                    <span className="font-medium text-amber-400">LKR {formatLKR(tier.price)} / ea</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-neutral-400 leading-relaxed text-sm">{product.description}</p>
          </div>

          <div className="space-y-6 mb-8 border-t border-white/10 pt-8">
            {sizes.length > 0 && (
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs text-neutral-400 uppercase tracking-widest">Size</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded border flex items-center justify-center text-sm transition-all ${
                        selectedSize === s ? "border-amber-400 bg-amber-400 text-black font-bold" : "border-white/20 text-neutral-300 hover:border-amber-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-widest block mb-3">Color</span>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 h-12 rounded-full border flex items-center justify-center text-sm transition-all ${
                        selectedColor === c ? "border-amber-400 bg-amber-400 text-black font-bold" : "border-white/20 text-neutral-300 hover:border-amber-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-widest block mb-3">Quantity</span>
              <div className="flex items-center w-32 h-12 border border-white/20 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-amber-400 transition">
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center text-white font-medium">{qty}</div>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-amber-400 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="flex-1 h-14 bg-amber-400 text-black hover:bg-amber-500 text-sm font-bold tracking-widest uppercase">
              <ShoppingBag className="w-5 h-5 mr-3" />
              Add to Cart
            </Button>
            <Button
              onClick={() => toggleWishlist(product.id)}
              variant="outline"
              className={`w-14 h-14 border-white/20 ${liked ? "bg-amber-400/10 border-amber-400" : "hover:border-amber-400"}`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-amber-400 text-amber-400" : "text-neutral-400"}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}