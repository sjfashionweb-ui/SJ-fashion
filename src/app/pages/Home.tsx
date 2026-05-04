import { Link } from "react-router";
import { Hero } from "../components/Hero";
import { BrandCarousel } from "../components/BrandCarousel";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../lib/products";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const collections = [
  {
    name: "Men",
    to: "/category/men",
    img: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80",
  },
  {
    name: "Women",
    to: "/category/women",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
  },
  {
    name: "Kids",
    to: "/category/kids",
    img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80",
  },
];

export default function Home() {
  const { products, loading } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <>
      <Hero />
      <BrandCarousel />

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-2">Discover</p>
          <h2 className="font-display text-4xl">Shop by Collection</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {collections.map((c) => (
            <Link
              key={c.name}
              to={c.to}
              className="relative h-96 rounded-xl overflow-hidden group block"
            >
              <ImageWithFallback
                src={c.img}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="font-display text-4xl text-white mb-2">{c.name}</h3>
                <p className="text-amber-400 text-sm tracking-widest uppercase group-hover:translate-x-2 transition-transform">
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-2">Trending</p>
            <h2 className="font-display text-4xl">Featured Products</h2>
          </div>
          <Link to="/explore" className="text-amber-400 text-sm tracking-widest uppercase hover:underline">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
