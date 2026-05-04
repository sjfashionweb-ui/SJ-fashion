import { useState } from "react";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createProduct, uploadImage, Variant } from "../../lib/api";
import { CATEGORIES, CategoryKey, SIZES, COLORS, BRANDS } from "../../lib/catalog";

type Props = { onCreated: () => void };

export function AddProductForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryKey>("men");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState(""); // Base price for Qty 1
  
  // NEW: Support multiple images
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // NEW: Bulk Pricing State
  const [bulkPricing, setBulkPricing] = useState<{ minQty: number; price: number }[]>([]);

  const [variants, setVariants] = useState<Variant[]>([
    { size: "M", color: "Black", stock: 10 },
  ]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImages((prev) => [...prev, url]); // Append to images array
      toast.success("Image uploaded to Supabase Storage");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error(`Upload failed: ${err}`);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  // Bulk Pricing Handlers
  function addTier() {
    setBulkPricing([...bulkPricing, { minQty: 10, price: 0 }]);
  }
  function updateTier(i: number, patch: Partial<{ minQty: number; price: number }>) {
    setBulkPricing(bulkPricing.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function removeTier(i: number) {
    setBulkPricing(bulkPricing.filter((_, idx) => idx !== i));
  }

  // Variant Handlers
  function addVariant() {
    setVariants([...variants, { size: "M", color: "Black", stock: 0 }]);
  }
  function updateVariant(i: number, patch: Partial<Variant>) {
    setVariants(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function removeVariant(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || images.length === 0) {
      toast.error("Please fill name, price, and upload at least one image");
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({
        name,
        description,
        category,
        subcategory,
        brand,
        price: Number(price),
        imageUrl: images[0], // Set first image as primary fallback
        images, // Save the full array
        bulkPricing: bulkPricing.length > 0 ? bulkPricing : undefined,
        variants,
      });
      toast.success("Product created");
      setName("");
      setDescription("");
      setSubcategory("");
      setBrand("");
      setPrice("");
      setImages([]);
      setBulkPricing([]);
      setVariants([{ size: "M", color: "Black", stock: 10 }]);
      onCreated();
    } catch (err) {
      console.error("Create product failed", err);
      toast.error(`Create failed: ${err}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-neutral-900 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input className="bg-neutral-950 border-white/10" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                className="bg-neutral-950 border-white/10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v as CategoryKey);
                    setSubcategory("");
                  }}
                >
                  <SelectTrigger className="bg-neutral-950 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger className="bg-neutral-950 border-white/10">
                    <SelectValue placeholder="Pick..." />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    {CATEGORIES[category].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Brand</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="bg-neutral-950 border-white/10">
                    <SelectValue placeholder="Pick..." />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    {BRANDS.map((b) => (
                      <SelectItem key={b.name} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Price (LKR)</Label>
                <Input
                  className="bg-neutral-950 border-white/10"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="For Qty: 1"
                />
              </div>
            </div>

            {/* MULTIPLE IMAGE UPLOAD SECTION */}
            <div>
              <Label>Product Images</Label>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 group">
                    <img src={img} alt={`upload-${i}`} className="w-full h-full object-cover rounded-lg border border-white/10" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <label className="w-20 h-20 cursor-pointer border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:bg-white/5 transition">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  ) : (
                    <Upload className="w-4 h-4 text-neutral-400" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* BULK PRICING SECTION */}
            <div className="p-4 border border-amber-400/20 rounded-lg bg-amber-400/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-amber-400">Bulk Pricing Tiers</Label>
                  <p className="text-xs text-neutral-400">Offer discounts for higher quantities.</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addTier} className="border-amber-400/30 text-amber-400 hover:bg-amber-400/20">
                  <Plus className="w-4 h-4 mr-1" /> Add Tier
                </Button>
              </div>

              <div className="space-y-2">
                {bulkPricing.map((tier, i) => (
                  <div key={i} className="flex items-end gap-2 p-2 border border-white/10 rounded bg-neutral-950">
                    <div className="flex-1">
                      <Label className="text-[10px] text-neutral-400">{"If Qty is >="}</Label>
                      <Input type="number" value={tier.minQty} onChange={(e) => updateTier(i, { minQty: Number(e.target.value) })} className="bg-neutral-900 border-white/10 h-8 text-sm" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-neutral-400">Price becomes (LKR)</Label>
                      <Input type="number" value={tier.price} onChange={(e) => updateTier(i, { price: Number(e.target.value) })} className="bg-neutral-900 border-white/10 h-8 text-sm text-amber-400" />
                    </div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeTier(i)} className="h-8 w-8 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* VARIANTS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Variants (size, color, stock)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addVariant} className="border-white/10 hover:bg-white/5">
                  <Plus className="w-4 h-4 mr-1" /> Add variant
                </Button>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-auto pr-1">
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_90px_auto] gap-2 items-end p-3 border border-white/10 rounded-lg bg-neutral-950">
                    <div>
                      <Label className="text-xs">Size</Label>
                      <Select value={v.size} onValueChange={(val) => updateVariant(i, { size: val })}>
                        <SelectTrigger className="bg-neutral-900 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10 text-white">
                          {SIZES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Select value={v.color} onValueChange={(val) => updateVariant(i, { color: val })}>
                        <SelectTrigger className="bg-neutral-900 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10 text-white">
                          {COLORS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Stock</Label>
                      <Input type="number" className="bg-neutral-900 border-white/10" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} />
                    </div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeVariant(i)} className="hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 bg-amber-400 text-black hover:bg-amber-500" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}