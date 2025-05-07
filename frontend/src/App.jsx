import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import Loading from "./components/Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const Home = lazy(() => import("./pages/Home"));
  const Collection = lazy(() => import("./pages/Collection"));
  const Customize = lazy(() => import("./pages/Customize"));
  const About = lazy(() => import("./pages/About"));
  // const Contact = lazy(() => import("./pages/Contact"));
  const Product = lazy(() => import("./pages/Product"));
  const Cart = lazy(() => import("./pages/Cart"));
  const Login = lazy(() => import("./pages/Login"));
  const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));
  const Payment = lazy(() => import("./pages/Payment"));
  const Orders = lazy(() => import("./pages/Orders"));
  const Verify = lazy(() => import("./pages/Verify"));
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Navbar />
        <ToastContainer />
        <SearchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
        <Footer />
      </Suspense>
    </>
  );
};

export default App;
