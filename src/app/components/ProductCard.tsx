import { Link } from "react-router";
import { Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "../lib/api";
import { useCart } from "../lib/cart";

// Formatter to match your LKR styling
const formatLKR = (amount: number) => {
  return amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWishlist } = useCart();
  const liked = wishlist.includes(p.id);
  
  // 1. Determine if the product has bulk tiers
  const hasBulkPricing = p.bulkPricing && p.bulkPricing.length > 0;
  
  // 2. Generate the dynamic price display
  let priceDisplay;
  if (hasBulkPricing) {
    // Find the absolute lowest price in the bulk tiers
    const minPrice = Math.min(...p.bulkPricing!.map(tier => tier.price));
    const maxPrice = p.price; // The base price for 1 item
    
    priceDisplay = (
      <div className="flex flex-col mt-1">
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest mb-0.5">Bulk orders from</span>
        <span className="text-sm font-semibold text-amber-400">
          LKR {minPrice.toLocaleString('en-LK')} - {maxPrice.toLocaleString('en-LK')}
        </span>
      </div>
    );
  } else {
    // Standard single-price display for items without bulk tiers
    priceDisplay = (
      <span className="text-sm font-semibold text-white mt-1 block">
        LKR {formatLKR(p.price)}
      </span>
    );
  }

  // Handle the new images array or fallback to the old imageUrl
  const displayImage = (p.images && p.images.length > 0) ? p.images[0] : p.imageUrl;

  return (
    <div className="group">
      <div className="relative aspect-[3/4] bg-neutral-900 rounded-lg overflow-hidden mb-3">
        <Link to={`/product/${p.id}`}>
          <ImageWithFallback
            src={displayImage}
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

        {/* 3. Bulk Savings Badge */}
        {hasBulkPricing && (
          <span className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg">
            WHOLESALE
          </span>
        )}
      </div>
      <Link to={`/product/${p.id}`}>
        <p className="text-[10px] tracking-[0.2em] uppercase text-amber-400 mb-1">{p.brand}</p>
        <h3 className="text-sm text-white mb-1 group-hover:text-amber-400 transition">{p.name}</h3>
        {priceDisplay}
      </Link>
    </div>
  );
}