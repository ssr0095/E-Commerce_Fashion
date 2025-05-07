import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import Loader from "../components/CompLoader";
import axios from "axios";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { login, token, navigate, loadingUser, backendUrl } =
    useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success("Registration successful!");
        setCurrentState("Login"); // Switch to login after successful registration
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      // console.log(error.response?.data?.message || "Registration failed");
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (currentState === "Sign Up") {
        await handleRegister();
      } else {
        const success = await login(formData.email, formData.password);
        if (!success) {
          toast.error("Invalid email or password");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && !loadingUser) {
      navigate("/");
    }
  }, [token, loadingUser, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      {(isLoading || loadingUser) && <Loader />}

      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Sign Up" && (
        <input
          name="name"
          onChange={handleChange}
          value={formData.name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
          minLength={3}
        />
      )}

      <input
        name="email"
        onChange={handleChange}
        value={formData.email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />

      <input
        name="password"
        onChange={handleChange}
        value={formData.password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
        minLength={8}
      />

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
            setCurrentState((prev) => (prev === "Login" ? "Sign Up" : "Login"))
          }
        >
          {currentState === "Login" ? "Create account" : "Login Here"}
        </button>
      </div>

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 transition-colors"
        disabled={isLoading || loadingUser}
      >
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
