import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./routes";
import { CartProvider } from "./lib/cart";
import { ProductsProvider } from "./lib/products";

export default function App() {
  return (
    <HelmetProvider>
      <ProductsProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ProductsProvider>
    </HelmetProvider>
  );
}