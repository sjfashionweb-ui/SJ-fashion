import { useState } from "react";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
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
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    { size: "M", color: "Black", stock: 10 },
  ]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
      toast.success("Image uploaded to Supabase Storage");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error(`Upload failed: ${err}`);
    } finally {
      setUploading(false);
    }
  }

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
    if (!name || !price || !imageUrl) {
      toast.error("Please fill name, price, and upload an image");
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
        imageUrl,
        variants,
      });
      toast.success("Product created");
      setName("");
      setDescription("");
      setSubcategory("");
      setBrand("");
      setPrice("");
      setImageUrl("");
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick..." />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Pick..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANDS.map((b) => (
                      <SelectItem key={b.name} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Product Image</Label>
              <div className="flex items-center gap-3 mt-1">
                <label className="flex-1 cursor-pointer border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Click to upload to Supabase
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Variants (size, color, stock)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addVariant}
              >
                <Plus className="w-4 h-4 mr-1" /> Add variant
              </Button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_90px_auto] gap-2 items-end p-3 border rounded-lg bg-gray-50"
                >
                  <div>
                    <Label className="text-xs">Size</Label>
                    <Select
                      value={v.size}
                      onValueChange={(val) => updateVariant(i, { size: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Select
                      value={v.color}
                      onValueChange={(val) => updateVariant(i, { color: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, { stock: Number(e.target.value) })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeVariant(i)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
