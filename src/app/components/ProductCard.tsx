import { Link } from "react-router";
import { Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "../lib/api";
import { useCart } from "../lib/cart";

export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWishlist } = useCart();
  const liked = wishlist.includes(p.id);
  
  return (
    <div className="group">
      <div className="relative aspect-[3/4] bg-neutral-900 rounded-lg overflow-hidden mb-3">
        <Link to={`/product/${p.id}`}>
          <ImageWithFallback
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(p.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-amber-400 text-amber-400" : "text-white"}`} />
        </button>
      </div>
      <Link to={`/product/${p.id}`}>
        <p className="text-[10px] tracking-[0.2em] uppercase text-amber-400 mb-1">{p.brand}</p>
        <h3 className="text-sm text-white mb-1 group-hover:text-amber-400 transition">{p.name}</h3>
        <p className="text-sm font-semibold text-white">
          LKR {p.price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </Link>
    </div>
  );
}