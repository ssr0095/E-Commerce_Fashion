// import { assets } from "../assets/assets";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <img className="w-[max(10%,80px)]" src="/images/logo.png" alt="logo" />
      <Button
        variant="outline"
        onClick={() => setToken("")}
        className="text-xs"
      >
        Logout
        <LogOut />
      </Button>
    </div>
  );
};

export default Navbar;
