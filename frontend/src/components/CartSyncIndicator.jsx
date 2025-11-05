import { useContext, useEffect, useState } from "react";
import { ShopContext } from "@/context/ShopContext";
import { Spinner } from "@/components/ui/spinner";

const CartSyncIndicator = () => {
  const { getCartSyncStatus } = useContext(ShopContext);
  const [status, setStatus] = useState({ pending: 0, isProcessing: false });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getCartSyncStatus());
    }, 500);

    return () => clearInterval(interval);
  }, [getCartSyncStatus]);

  if (!status.isProcessing && status.pending === 0) {
    return null; // Nothing to show
  }

  return (
    // <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
    <Spinner className="w-4 h-4" />
    // </div>
  );
};

export default CartSyncIndicator;
