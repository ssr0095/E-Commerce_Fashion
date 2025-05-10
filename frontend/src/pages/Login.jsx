import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import Loader from "../components/CompLoader";
import axios from "axios";

// Updated validation schema
const authSchema = z.object({
  name: z.string().optional(),
  // name: z.string().min(3, "Name must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

const Login = () => {
  const [currentState, setCurrentState] = useState("login");
  const { login, token, navigate, loadingUser, backendUrl } =
    useContext(ShopContext);
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
      if (currentState === "register") {
        const response = await axios.post(
          `${backendUrl}/api/auth/register`,
          data
        );
        if (response.data.success) {
          toast.success("Registration successful!");
          setCurrentState("login");
          reset();
        }
      } else {
        await login(data.email, data.password);
      }
    } catch (error) {
      // toast.error("Auth error:", error.response?.data.message);
      const message =
        error.response?.data?.message ||
        (currentState === "register" ? "Registration failed" : "Login failed");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && !loadingUser) navigate("/");
  }, [token, loadingUser, navigate]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      {(isLoading || loadingUser) && <Loader />}

      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">
          {currentState === "login" ? "Login" : "Sign Up"}
        </p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "register" && (
        <div className="w-full">
          <input
            {...register("name")}
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>
      )}

      <div className="w-full">
        <input
          {...register("email")}
          type="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="w-full">
        <input
          {...register("password")}
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
        />
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password.message}</p>
        )}
      </div>

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <button
          type="button"
          className="cursor-pointer hover:underline"
          onClick={() => toast.info("Password reset coming soon")}
        >
          Forgot your password?
        </button>

        <button
          type="button"
          className="cursor-pointer hover:underline"
          onClick={() =>
            setCurrentState((prev) => (prev === "login" ? "register" : "login"))
          }
        >
          {currentState === "login" ? "Create account" : "Login Here"}
        </button>
      </div>

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 transition-colors"
        disabled={isLoading || loadingUser}
      >
        {currentState === "login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
