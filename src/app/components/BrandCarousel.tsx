import { motion } from "motion/react";

export function BrandCarousel() {
  // High-quality transparent SVG logos
  const logos = [
    { name: "Nike", url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
    { name: "Adidas", url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
    { name: "Gucci", url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Gucci_logo.svg" },
    { name: "Zara", url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" },
    { name: "Levi's", url: "https://upload.wikimedia.org/wikipedia/commons/1/11/Levi%27s_logo.svg" },
    { name: "Puma", url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Puma_Logo.svg" },
    { name: "H&M", url: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" },
    { name: "Calvin Klein", url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Calvin_klein_logo.svg" },
  ];

  const loop = [...logos, ...logos, ...logos];

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
          className="flex items-center gap-16 md:gap-24 w-max px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          {loop.map((logo, i) => (
            <div key={i} className="flex-shrink-0">
              <img 
                src={logo.url} 
                alt={logo.name} 
                className="h-8 md:h-12 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                style={{ filter: logo.name === 'Levi\'s' || logo.name === 'H&M' ? 'none' : 'invert(1)' }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}