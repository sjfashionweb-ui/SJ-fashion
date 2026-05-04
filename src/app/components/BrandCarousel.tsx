import { motion } from "motion/react";
import { Link } from "react-router";
import { BRANDS } from "../lib/catalog";

export function BrandCarousel() {
  const loop = [...BRANDS, ...BRANDS];
  return (
    <section className="py-16 bg-neutral-950 border-y border-white/5 overflow-hidden">
      <div className="text-center mb-10">
        <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-2">
          Curated Selection
        </p>
        <h2 className="font-display text-4xl text-white">Shop by Brands</h2>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          {loop.map((b, i) => (
            <Link
              key={`${b.name}-${i}`}
              to={`/brand/${encodeURIComponent(b.name)}`}
              className="flex items-center justify-center bg-white/5 border border-white/10 rounded-xl w-44 h-28 px-6 shrink-0 hover:bg-white/10 hover:border-amber-400/50 transition-all group"
              title={b.name}
            >
              <img
                src={b.logo}
                alt={b.name}
                className="max-h-12 max-w-full object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = "block";
                }}
              />
              <span className="hidden font-heading text-lg text-white">{b.name}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
