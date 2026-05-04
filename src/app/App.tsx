import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./lib/cart";
import { ProductsProvider } from "./lib/products";

export default function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ProductsProvider>
  );
}
