import { createHashRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductPage from "./pages/Product";
import Cart from "./pages/Cart";
import Brand from "./pages/Brand";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import { AdminPage } from "./components/admin/AdminPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "category/:category", Component: Category },
      { path: "product/:id", Component: ProductPage },
      { path: "brand/:name", Component: Brand },
      { path: "cart", Component: Cart },
      { path: "explore", Component: Explore },
      { path: "search", Component: Search },
      { path: "wishlist", Component: Wishlist },
      { path: "account", Component: Account },
      { path: "account/orders", Component: Orders },
      { path: "help/:topic", Component: Help },
      { path: "*", Component: NotFound },
    ],
  },
  { path: "/sj-admin-portal-2026", Component: AdminPage },
  { path: "/admin", element: <Navigate to="/sj-admin-portal-2026" replace /> },
]);
