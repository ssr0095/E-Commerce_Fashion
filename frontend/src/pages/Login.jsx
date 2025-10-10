import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
// import Loader from "../components/CompLoader";
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

const authSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(30, { message: "Password must not exceed 30 characters." })
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
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate confirmPassword if it's present (signup mode)
      if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

const Login = () => {
  // const [currentState, setCurrentState] = useState("login");
  const [isLogin, setIsLogin] = useState(true);

  const {
    login,
    register: signup,
    token,
    loadingUser,
    loading,
    setLoading,
  } = useContext(ShopContext);
  // const [isLoading, setIsLoading] = useState(false);

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
    setLoading(true);
    try {
      if (!isLogin) {
        await signup(data.name, data.email, data.password);
        if (response.data.success) {
          // toast.success("Registration successful!");
          setIsLogin(true);
          reset();
        }
      } else {
        await login(data.email, data.password);
      }
    } catch (error) {
      // toast.error("Auth error:", error.response?.data.message);
      const message =
        // error.response?.data?.message ||
        !isLogin ? "Registration failed" : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && !loadingUser && !loading) window.location.href = "/";
  }, [token, loadingUser, loading]);

  return (
    <>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            {/* <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"> */}
            <img
              src="/logo.webp"
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
                {isLogin ? (
                  <>
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                      Login with your Google account
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-xl">Hello there</CardTitle>
                    <CardDescription>
                      Sign up with your Google account
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    {/* <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button> */}
                    <GoogleLoginButton isLogin={isLogin} />
                  </div>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6">
                      {!isLogin && (
                        <div className="grid gap-3">
                          <Label htmlFor="name">Username</Label>
                          <Input
                            {...register("name")}
                            id="name"
                            type="text"
                            placeholder="Enter name"
                            required
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                      )}

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
                          {isLogin && (
                            <button
                              href="#"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                              onClick={() =>
                                toast.info("Password reset under development")
                              }
                            >
                              Forgot your password?
                            </button>
                          )}
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

                      {!isLogin && (
                        <div className="grid gap-3">
                          <div className="flex items-center">
                            <Label htmlFor="confirmPassword">
                              Confirm Password
                            </Label>
                          </div>
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            placeholder="Enter confirm password"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-xs">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "Loading..." : isLogin ? "Login" : "Sign up"}
                      </Button>
                    </div>
                  </form>
                  <div className="text-center text-sm">
                    {isLogin ? (
                      <p>
                        Don&apos;t have an account?{" "}
                        <span
                          onClick={() => setIsLogin((prev) => !prev)}
                          className="underline underline-offset-4"
                        >
                          Sign up
                        </span>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{" "}
                        <span
                          onClick={() => setIsLogin((prev) => !prev)}
                          className="underline underline-offset-4"
                        >
                          Sign in
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
              By clicking continue, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
