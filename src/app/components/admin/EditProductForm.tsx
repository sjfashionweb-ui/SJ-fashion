import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Product, updateProduct } from "../../lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditProductForm({ product, onClose, onUpdated }: EditProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({ ...product });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProduct(product.id, formData);
      toast.success("Product updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-neutral-900 border-white/10 text-white mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Product: {product.name}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-neutral-950 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (LKR)</Label>
              <Input 
                type="number"
                value={formData.price} 
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="bg-neutral-950 border-white/10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="bg-neutral-950 border-white/10"
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-amber-400 text-black hover:bg-amber-500">
            {loading ? "Saving..." : "Update Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}