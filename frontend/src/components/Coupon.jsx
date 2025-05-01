import { assets } from "../assets/assets";

const Coupon = () => {
  return (
    <div className="my-5 w-fit">
      <p className="my-2">Coupon</p>
      <div className="w-full md:w-[80%] flex flex-col items-center  outline-[1.5px] outline-dashed outline-gray-300 text-sm rounded-sm cursor-default">
        <div className="w-full flex items-center gap-3 p-4 ">
          <img src={assets.logo} width={64} height={24} alt="coupon" />
          <div className="flex flex-col items-start justify-center gap-1">
            <p className="font-semibold">Extra 10% off</p>
            <p className="text-gray-500">
              Get extra 10% off on your first purchase
            </p>
          </div>
        </div>
        <div className="w-full flex items-center justify-between border-t border-gray-300 ">
          <p className="text-gray-500  p-4 ">COUSINS3424</p>
          <p
            className="font-semibold  p-4 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
            onClick={async () =>
              await navigator.clipboard.writeText(
                import.meta.env.VITE_COUSINS_COUPION
              )
            }
          >
            Copy Code
          </p>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
