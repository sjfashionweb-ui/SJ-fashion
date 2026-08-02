import { useState, useRef, useEffect } from "react";
import { MessageCircle, HelpCircle, Package, X } from "lucide-react";
import { Link } from "react-router";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // IMPORTANT: Match this to your actual WhatsApp number
  const WHATSAPP_NUMBER = "94763923201"; 
  const helpMessage = "Hi SJ-Fashion! I need some help with your products.";
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" ref={menuRef}>
      
      {/* TikTok Button */}
      <a
        href="https://tiktok.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-black hover:bg-neutral-800 text-white rounded-full shadow-lg hover:-translate-y-1 transition-all duration-300 border border-white/10 group"
        aria-label="Follow us on TikTok"
      >
        {/* Custom TikTok SVG */}
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
        <span className="absolute right-full mr-4 bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
          Follow our TikTok
        </span>
      </a>

      {/* WhatsApp Expandable Menu */}
      <div className={`flex flex-col gap-2 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 mb-2' : 'scale-0 opacity-0 h-0 overflow-hidden'}`}>
        <Link 
          to="/account/orders"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg border border-white/10 transition-colors w-40"
        >
          <Package className="w-4 h-4 text-amber-400" />
          Track Order
        </Link>
        
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(helpMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg border border-white/10 transition-colors w-40"
        >
          <HelpCircle className="w-4 h-4 text-[#25D366]" />
          Get Help
        </a>
      </div>

      {/* Main WhatsApp Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-1 transition-all duration-300"
        aria-label="Open support menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

    </div>
  );
}