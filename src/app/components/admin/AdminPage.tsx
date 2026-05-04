import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Toaster } from "../ui/sonner";
import { AddProductForm } from "./AddProductForm";
import {
  deleteProduct,
  listOrders,
  listProducts,
  Order,
  Product,
  updateOrder,
  createOrder,
} from "../../lib/api";
import { toast } from "sonner";

const COLORS = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  async function refresh() {
    try {
      const [p, o] = await Promise.all([listProducts(), listOrders()]);
      setProducts(p);
      setOrders(o);
    } catch (e) {
      console.error("Failed to load admin data", e);
      toast.error(`Load failed: ${e}`);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const delivered = orders.filter((o) => o.status === "delivered").length;
    return {
      revenue,
      orderCount: orders.length,
      productCount: products.length,
      delivered,
    };
  }, [orders, products]);

  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      map.set(d, (map.get(d) || 0) + o.total);
    });
    return Array.from(map.entries())
      .slice(-14)
      .map(([date, total]) => ({ date, total: Math.round(total) }));
  }, [orders]);

  const salesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        if (!prod) return;
        map.set(prod.category, (map.get(prod.category) || 0) + it.qty * it.price);
      });
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [orders, products]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      refresh();
    } catch (e) {
      toast.error(`Delete failed: ${e}`);
    }
  }

  async function changeStatus(o: Order, status: Order["status"]) {
    try {
      await updateOrder(o.id, { status });
      toast.success(`Order ${o.id.slice(0, 6)} → ${status}`);
      refresh();
    } catch (e) {
      toast.error(`Update failed: ${e}`);
    }
  }

  async function seedDemoOrder() {
    if (products.length === 0) {
      toast.error("Add a product first");
      return;
    }
    const p = products[Math.floor(Math.random() * products.length)];
    const qty = 1 + Math.floor(Math.random() * 3);
    try {
      await createOrder({
        customer: ["Alice", "Bob", "Charlie", "Dana"][
          Math.floor(Math.random() * 4)
        ],
        items: [{ productId: p.id, name: p.name, qty, price: p.price }],
        total: p.price * qty,
        status: ["pending", "shipped", "delivered"][
          Math.floor(Math.random() * 3)
        ] as Order["status"],
      });
      toast.success("Demo order created");
      refresh();
    } catch (e) {
      toast.error(`Seed failed: ${e}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-rose-600">SJ</span> Admin Portal
            </h1>
            <p className="text-xs text-gray-500">Private — owner access only</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={seedDemoOrder}>
              + Demo Order
            </Button>
            <Button variant="ghost" onClick={() => (window.location.hash = "/")}>
              View Storefront
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            icon={<DollarSign className="w-5 h-5" />}
            label="Revenue"
            value={`$${stats.revenue.toFixed(2)}`}
            color="bg-rose-100 text-rose-700"
          />
          <Kpi
            icon={<ShoppingCart className="w-5 h-5" />}
            label="Orders"
            value={String(stats.orderCount)}
            color="bg-blue-100 text-blue-700"
          />
          <Kpi
            icon={<Package className="w-5 h-5" />}
            label="Products"
            value={String(stats.productCount)}
            color="bg-amber-100 text-amber-700"
          />
          <Kpi
            icon={<TrendingUp className="w-5 h-5" />}
            label="Delivered"
            value={String(stats.delivered)}
            color="bg-emerald-100 text-emerald-700"
          />
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-4">
            <AddProductForm onCreated={refresh} />
            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="capitalize">
                          {p.category}
                          {p.subcategory ? ` / ${p.subcategory}` : ""}
                        </TableCell>
                        <TableCell>{p.brand}</TableCell>
                        <TableCell>${p.price}</TableCell>
                        <TableCell>{p.variants?.length || 0}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-gray-500 py-8"
                        >
                          No products yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">
                          {o.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{o.customer}</TableCell>
                        <TableCell>{o.items.length}</TableCell>
                        <TableCell>${o.total.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={o.status}
                            onValueChange={(v) =>
                              changeStatus(o, v as Order["status"])
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-500 py-8"
                        >
                          No orders yet —{" "}
                          <button
                            className="underline"
                            onClick={seedDemoOrder}
                          >
                            create a demo order
                          </button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales over time</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {salesByDay.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No sales data yet.</p>
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={salesByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#fbbf24" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sales by category</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {salesByCategory.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No category sales yet.</p>
                  ) : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={salesByCategory}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={90}
                          label
                        >
                          {salesByCategory.map((entry, i) => (
                            <Cell key={`cell-${entry.name}-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
