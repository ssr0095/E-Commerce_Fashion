// import { ShopContext } from "@/context/ShopContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { Button } from "@/components/ui/button";

export default function GoogleLoginButton({ setToken }) {
  // const { googleLogin } = useContext(ShopContext);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const googleLogin = async (googleData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/google`,
        JSON.stringify(googleData),
        {
          // Prevent axios from throwing errors for 401 responses
          validateStatus: (status) => status < 500,
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success && data.user.accessToken) {
        setToken(data.user.accessToken);
        toast.success("Login successful");
        // navigate("/");
        return true;
      } else {
        if (data?.message) toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Login failed");
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    if (!window.google) {
      toast.error("Google library not available");
      return;
    }

    try {
      setLoading(true);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: async (response) => {
          if (response.error) {
            console.error("Google OAuth error:", response.error);
            return;
          }
          // console.log(response);
          if (response.access_token) {
            try {
              // Get user info using the access token
              const userInfo = await axios
                .get("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: {
                    Authorization: `Bearer ${response.access_token}`,
                  },
                })
                .then((res) => {
                  console.log(res);
                  if (res.status != 200) {
                    throw new Error("Failed to fetch user info: " + res);
                  }
                  return res;
                })
                .catch((err) => {
                  console.log(err);
                });
              // console.log("user: " + userInfo);

              // if (userInfo) {
              await googleLogin({
                email: userInfo.data.email,
                name: userInfo.data.name,
                googleId: userInfo.data.sub,
                picture: userInfo.data.picture,
                accessToken: response.access_token, // Send to backend for verification
              });
              // localStorage.setItem("accessToken", data.user.accessToken);
              // toast.success("Google login successful");
              // window.location.href = "/";
              // }

              // Send to your backend for verification and token generation
              // or use navigate
            } catch (error) {
              console.error("Error in Google auth flow:", error);
            } finally {
              setLoading(false);
            }
          }
        },
      });

      client.requestAccessToken();
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      // disabled={!isGoogleLoaded}
      disabled={true}
      onClick={handleGoogleLogin}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          fill="currentColor"
        />
      </svg>
      {/* {isGoogleLoaded || !loading ? "Continue with Google" : "Loading..."} */}
      {!isGoogleLoaded || loading ? "Loading..." : "Login with Google"}
    </Button>
  );
}
