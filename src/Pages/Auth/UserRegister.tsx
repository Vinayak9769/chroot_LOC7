import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import imgSrc from "../../assets/freelancer-working-laptop-her-house.png";
// import loadingAnimation from "../../assets/Animation - 1726660821372.webm";
import { baseUrl } from "../../App";
// import useAuth from "../../hooks/useAuth";

const UserRegister: React.FC = () => {
//   const { auth, setAuth } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log(formData);

    try {
      const response = await fetch(`${baseUrl}/api/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        const data = await response.json();

        navigate("/user/login");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError(
        `An error occurred. Please check your connection and try again. ${error}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[90vh] items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-6xl gap-36 p-8">
        <div className="flex justify-center justify-center flex-col">
          

          <form onSubmit={handleForm} className="space-y-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-gray-700">
                username
              </label>
              <input
                type="username"
                name="username"
                placeholder="username"
                value={formData.username}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>

            <button
              className="w-full rounded-lg bg-black py-2 text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <video
                  //   src={loadingAnimation}
                  autoPlay
                  loop
                  className="mx-auto h-8 w-8"
                ></video>
              ) : (
                "Register"
              )}
            </button>

            <p className="text-center text-sm">
              Already a member?{" "}
              <Link
                to={"/user/login"}
                className="text-blue-500 hover:underline"
              >
                Login
              </Link>
            </p>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="hidden  items-center justify-center lg:flex">
          <img
            className="max-w-lg rounded-lg"
            // src={registerImage}
            // src={imgSrc}
            alt="Police image"
          />
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
