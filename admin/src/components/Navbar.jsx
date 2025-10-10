// import { assets } from "../assets/assets";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = ({ setToken, backendUrl }) => {
  const logout = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        {
          // Prevent axios from throwing errors for 401 responses
          validateStatus: (status) => status < 500,
          withCredentials: true,
        }
      );

      if (response.status == 204) {
        setToken("");
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
      return false;
    }
  };

  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <img className="w-[max(10%,80px)]" src="/images/logo.png" alt="logo" />
      <Button
        variant="outline"
        onClick={async () => await logout()}
        className="text-xs"
      >
        Logout
        <LogOut />
      </Button>
    </div>
  );
};

export default Navbar;
