import { assets } from "../assets/assets";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <section className="w-full h-[80vh] px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-full my-5 flex flex-col items-center justify-center gap-4 border-2 border-gray-400 border-dashed">
        {/* <div className="absolute size-40 max-lg:-top-10 top-10 -right-6 bg-[url(/assets/images/leaf-1.svg)] bg-contain bg-no-repeat transform rotate-45" /> */}
        <h3 className="text-8xl">404</h3>
        <h2 className="text-2xl">Page Not Found</h2>
        <p className="text-center">
          The page you requested could not be found.
        </p>
        <Button asChild>
          <a href="/">
            <ArrowLeft className="size-4" />
            Go to Homepage
          </a>
        </Button>
        {/* <div className="absolute size-40 max-lg:-bottom-10 top-80 max-lg:left-10 left-50 bg-[url(/assets/images/leaf-1.svg)] bg-contain bg-no-repeat transform -rotate-70" /> */}
      </div>
    </section>
  );
};

export default NotFound;
