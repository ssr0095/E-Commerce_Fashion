import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
// import Add from "./pages/Add";
// import List from "./pages/List";
// import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./components/Loading";
import { lazy } from "react";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  const Add = lazy(() => import("./pages/Add"));
  const List = lazy(() => import("./pages/List"));
  const Orders = lazy(() => import("./pages/Orders"));

  return (
    <div className="bg-gray-50 min-h-screen">
      <Suspense fallback={<Loading />}>
        <ToastContainer />
        {token === "" ? (
          <Login setToken={setToken} />
        ) : (
          <>
            <Navbar setToken={setToken} />
            <hr />
            <div className="flex h-full w-full flex-col items-center bg-gray-100 font-outfit md:flex-row md:items-start">
              <Sidebar />
              <div className="max-sm:w-full w-[70%] sm:mx-auto sm:ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                <Routes>
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                </Routes>
              </div>
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
};

export default App;
