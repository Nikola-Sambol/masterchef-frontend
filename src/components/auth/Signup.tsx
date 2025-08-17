import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../axios/api.ts";
import { Link, useNavigate } from "react-router-dom";
import { handleAxiosError } from "../../utils/ErrorHandler.ts";
import axios from "axios";
import { useState } from "react";
import {IoEye, IoEyeOff} from "react-icons/io5";

interface SignupFormData {
    name: string;
    surname: string;
    email: string;
    password: string;
}

const Signup = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({ mode: "onSubmit" });

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: SignupFormData) => {
        try {
            const response = await api.post("/auth/public/signup", data);

            if (response.data) {
                toast.success("Uspješno ste se registrirali!");
                navigate("/signin");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message === "Email address already in use!") {
                toast.error("Adresa sa ovim mailom vec postoji!");
            } else {
                const msg = handleAxiosError(error);
                toast.error(msg);
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-74px)] flex justify-center items-center bg-[#FCFAF9] px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="sm:w-[450px] w-[360px] bg-white py-6 sm:px-8 px-4 rounded-lg shadow-lg border border-gray-200">
                <h1 className="text-center font-bold text-2xl text-gray-800">
                    Registracija
                </h1>
                <p className="text-slate-700 text-center mb-5">
                    Kreirajte novi račun
                </p>

                <div className="flex flex-col gap-3">
                    {/* First Name */}
                    <div>
                        <label htmlFor="name" className="block mb-1 font-medium text-gray-800">
                            Ime
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            className="w-full border border-black rounded px-3 py-2"
                            {...register("name", {
                                required: "Ime je obavezno",
                                minLength: {
                                    value: 3,
                                    message: "Ime je prekratko",
                                },
                            })}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="surname" className="block mb-1 font-medium text-gray-800">
                            Prezime
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            className="w-full border border-black rounded px-3 py-2"
                            {...register("surname", {
                                required: "Prezime je obavezno",
                                minLength: {
                                    value: 3,
                                    message: "Prezime je prekratko",
                                },
                            })}
                        />
                        {errors.surname && (
                            <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium text-gray-800">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full border border-black rounded px-3 py-2"
                            {...register("email", {
                                required: "Email je obavezan",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Unesite ispravnu email adresu",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block mb-1 font-medium text-gray-800">
                            Lozinka
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="w-full border border-black rounded px-3 py-2 pr-10"
                                {...register("password", {
                                    required: "Lozinka je obavezna",
                                    minLength: {
                                        value: 6,
                                        message: "Minimalno 6 znakova",
                                    },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                            >
                                {showPassword ? <IoEyeOff size={20}/> : <IoEye size={20}/>}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-[#E30C37] hover:bg-red-600 text-white py-2 rounded-md font-semibold transition-colors duration-200"
                >
                    Registriraj se
                </button>
                <p className="text-sm text-center text-gray-700 mt-4">
                    Već imate račun?{" "}
                    <Link to="/signin" className="text-[#E30C37] font-medium hover:underline">
                        Prijavite se
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;