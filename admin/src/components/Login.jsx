import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendUrl } from "../App";
import { assets } from "../assets/assets";
import axios from "axios";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(40, { message: "Password must not exceed 30 characters." })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});

const Login = ({ setToken }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(authSchema),
    mode: "onChange", // Validate on change
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email: data.email,
        password: data.password,
        isAdminLogin: true,
      });
      console.log(response);
      if (response.data.success) {
        setToken(response.data.user.accessToken);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.status == 401) return toast.error("Unauthorized access");
      console.log(error);
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href={import.meta.env.VITE_FRONTEND_URL}
            className="flex items-center gap-2 self-center font-medium"
          >
            {/* <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"> */}
            <img
              src={assets.logo}
              width={96}
              height={18}
              className="w-32"
              alt="Cousins Fashion"
              loading="lazy"
            />
            {/* </div> */}
            {/* Cousins Fashion. */}
          </a>
          <div className={cn("flex flex-col gap-6")}>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Admin Panel</CardTitle>
                <CardDescription>
                  Login with your Google account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    <GoogleLoginButton />
                  </div>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="account@example.com"
                          required
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          required
                          {...register("password")}
                          placeholder="Enter password"
                        />
                        {errors.password && (
                          <p className="text-red-500 text-xs">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Login"}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
