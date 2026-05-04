import { Link, useNavigate } from "react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCart } from "../lib/cart";
import { createOrder } from "../lib/api";
import { toast } from "sonner";
import { useState } from "react";

export default function Cart() {
  const { items, total, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [placing, setPlacing] = useState(false);
  const nav = useNavigate();

  async function checkout() {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      await createOrder({
        customer: name || "Guest",
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        total,
        status: "pending",
      });
      toast.success("Order placed! Thank you.");
      clear();
      nav("/account");
    } catch (e) {
      toast.error(`Checkout failed: ${e}`);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0)
    return (
      <div className="max-w-7xl mx-auto p-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-neutral-700 mb-4" />
        <h1 className="font-display text-4xl mb-2">Your bag is empty</h1>
        <p className="text-neutral-400 mb-6">Discover beautiful pieces to add to your collection.</p>
        <Link to="/explore">
          <Button className="bg-amber-400 hover:bg-amber-500 text-black">Continue Shopping</Button>
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-8">Shopping Bag</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-4">
          {items.map((i) => (
            <div
              key={`${i.productId}-${i.size}-${i.color}`}
              className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <img src={i.imageUrl} alt={i.name} className="w-24 h-32 object-cover rounded" />
              <div className="flex-1">
                <Link to={`/product/${i.productId}`} className="hover:text-amber-400">
                  <h3 className="font-semibold">{i.name}</h3>
                </Link>
                <p className="text-xs text-neutral-400">Size: {i.size} · Color: {i.color}</p>
                <p className="font-semibold mt-2">${i.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-white/20 rounded">
                    <button className="w-8 h-8" onClick={() => setQty(i.productId, i.size, i.color, i.qty - 1)}>−</button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button className="w-8 h-8" onClick={() => setQty(i.productId, i.size, i.color, i.qty + 1)}>+</button>
                  </div>
                  <button onClick={() => remove(i.productId, i.size, i.color)} className="text-neutral-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="font-semibold">${(i.price * i.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <aside className="bg-white/5 border border-white/10 rounded-lg p-6 h-fit sticky top-28">
          <h2 className="font-display text-2xl mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-neutral-400">Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">Shipping</span><span>{total >= 50 ? "Free" : "$8.00"}</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">Tax</span><span>${(total * 0.08).toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-white/10 mb-6">
            <span>Total</span>
            <span>${(total + (total >= 50 ? 0 : 8) + total * 0.08).toFixed(2)}</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full mb-3 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          <Button onClick={checkout} disabled={placing} className="w-full bg-amber-400 hover:bg-amber-500 text-black">
            {placing ? "Placing order..." : "Checkout"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
