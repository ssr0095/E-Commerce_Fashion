import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <HelmetProvider>
      <Toaster />
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </HelmetProvider>
  </BrowserRouter>
);
