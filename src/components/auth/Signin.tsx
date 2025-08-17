import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {Link, useNavigate} from "react-router-dom";
import api from "../../axios/api.ts";
import { jwtDecode } from "jwt-decode";
import {useMyContext} from "../../context/AuthContext.tsx";
import {handleAxiosError} from "../../utils/ErrorHandler.ts";
import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

interface SigninFormData {
    email: string;
    password: string;
}

const Signin = () => {
    const {setToken} = useMyContext();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninFormData>({ mode: "onSubmit" });

    const handleSuccessfulLogin = (token: string, decodedToken: { sub?: string }) => {
        if (!decodedToken.sub) {
            toast.error("Nevažeći token. Nedostaje identifikator korisnika.");
            return;
        }
        const user = { email: decodedToken.sub };
        localStorage.setItem("USER", JSON.stringify(user));
        localStorage.setItem("JWT_TOKEN", token);
        setToken(token);
        navigate("/");
    }

    const onSubmit = async (data: SigninFormData) => {
        try {
            const response = await api.post("/auth/public/signin", data);
            toast.success("Uspješno ste se prijavili!");
            if (response.status === 200 && response.data.jwtToken) {
                const decodedToken = jwtDecode(response.data.jwtToken);
                handleSuccessfulLogin(response.data.jwtToken, decodedToken as { sub?: string });
            } else {
                toast.error("Prijava nije uspjela. Probajte opet.");
            }
        } catch (error) {
            const msg = handleAxiosError(error);
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-[calc(100vh-74px)] flex justify-center items-center bg-[#FCFAF9] px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="sm:w-[450px] w-[360px] bg-white py-6 sm:px-8 px-4 rounded-lg shadow-lg border border-gray-200"
            >
                <h1 className="text-center font-bold text-2xl text-gray-800">
                    Prijava
                </h1>
                <p className="text-slate-700 text-center mb-5">
                    Prijavite se za pristup aplikaciji.
                </p>

                <div className="flex flex-col gap-3">
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
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email address",
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
                                    required: "Lozinka je obavezna!",
                                    minLength: {
                                        value: 6,
                                        message: "Lozinka mora sadržavati minimalno 6 znakova!",
                                    },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-600 hover:text-black"
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
                    Prijava
                </button>
                <p className="text-sm text-center text-gray-700 mt-4">
                    Nemate račun?{" "}
                    <Link to="/signup" className="text-[#E30C37] font-medium hover:underline">
                        Registrirajte se
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Signin;