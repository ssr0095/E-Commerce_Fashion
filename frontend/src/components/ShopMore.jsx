import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Button } from "@/components/ui/button";

const ShopMore = () => {
  const shop = useContext(ShopContext);

  return (
    <div className="w-full flex items-center justify-center mt-14 px-4 relative">
      <div className="w-full flex items-center justify-center z-10">
        <Button
          onClick={() => shop?.navigate("/collection")}
          variant="outline"
          className="rounded-none"
        >
          Shop more
        </Button>
      </div>
      <hr className="absolute top-[50%] left-0 w-full  z-0" />
    </div>
  );
};

export default ShopMore;
