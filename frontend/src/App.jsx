import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts/layout";
import Loading from "./components/Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";

const App = () => {
  const Home = lazy(() => import("./pages/Home"));
  const Collection = lazy(() => import("./pages/Collection"));
  const Customize = lazy(() => import("./pages/Customize"));
  const About = lazy(() => import("./pages/About"));
  const Product = lazy(() => import("./pages/Product"));
  const Cart = lazy(() => import("./pages/Cart"));
  const Login = lazy(() => import("./pages/Login"));
  const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));
  const Payment = lazy(() => import("./pages/Payment"));
  const Orders = lazy(() => import("./pages/Orders"));
  const Verify = lazy(() => import("./pages/Verify"));

  return (
    <Suspense fallback={<Loading />}>
      <ToastContainer />
      <Routes>
        {/* Routes with Navbar & Footer */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/collection"
          element={
            <MainLayout>
              <Collection />
            </MainLayout>
          }
        />
        <Route
          path="/customize"
          element={
            <MainLayout>
              <Customize />
            </MainLayout>
          }
        />
        <Route
          path="/about"
          element={
            <MainLayout>
              <About />
            </MainLayout>
          }
        />
        <Route
          path="/product/:productId"
          element={
            <MainLayout>
              <Product />
            </MainLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <MainLayout>
              <Cart />
            </MainLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <MainLayout>
              <Orders />
            </MainLayout>
          }
        />

        {/* Routes without Navbar & Footer */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/place-order"
          element={
            <AuthLayout>
              <PlaceOrder />
            </AuthLayout>
          }
        />
        <Route
          path="/payment/:orderId"
          element={
            <AuthLayout>
              <Payment />
            </AuthLayout>
          }
        />
        <Route
          path="/verify"
          element={
            <AuthLayout>
              <Verify />
            </AuthLayout>
          }
        />

        <Route
          path="*"
          element={
            <MainLayout>
              <NotFound />
            </MainLayout>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default App;
