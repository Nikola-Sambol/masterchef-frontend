import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../axios/api";
import { handleAxiosError } from "../../utils/ErrorHandler.ts";
import {IoEye, IoEyeOff} from "react-icons/io5";

interface Props {
    id: number;
    onClose: () => void;
    isAdmin?: boolean;
}

type ChangePasswordForm = {
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePasswordModal = ({ id, onClose, isAdmin = false }: Props) => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ChangePasswordForm>();

    const newPasswordValue = watch("newPassword");

    const onSubmit = async (data: ChangePasswordForm) => {
        try {
            const payload: { newPassword: string; oldPassword?: string } = { newPassword: data.newPassword };
            if (!isAdmin) {
                payload.oldPassword = data.oldPassword;
            }

            await api.post(`/auth/change-password/${id}`, payload);
            toast.success("Lozinka je uspješno promijenjena.");
            onClose();
        } catch (err) {
            const msg = handleAxiosError(err);
            toast.error(msg);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-bold mb-4">Promijeni lozinku</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
                {/* Stara lozinka */}
                {!isAdmin && (
                    <div>
                        <label className="block mb-1 font-medium">Stara lozinka</label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                className="w-full border rounded px-3 py-2"
                                {...register("oldPassword", { required: "Unesite staru lozinku" })}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-2 text-gray-600"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                                {showOldPassword ? <IoEyeOff size={20}/> : <IoEye size={20}/>}
                            </button>
                        </div>
                        {errors.oldPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.oldPassword.message}</p>
                        )}
                    </div>
                )}

                {/* Nova lozinka */}
                <div>
                    <label className="block mb-1 font-medium">Nova lozinka</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            className="w-full border rounded px-3 py-2"
                            {...register("newPassword", {
                                required: "Unesite novu lozinku",
                                minLength: { value: 6, message: "Lozinka mora imati barem 6 znakova" },
                            })}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-2 text-gray-600"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? <IoEyeOff size={20}/> : <IoEye size={20}/>}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                    )}
                </div>

                {/* Ponovi lozinku */}
                <div>
                    <label className="block mb-1 font-medium">Ponovi lozinku</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full border rounded px-3 py-2"
                            {...register("confirmPassword", {
                                required: "Ponovite novu lozinku",
                                validate: (value) =>
                                    value === newPasswordValue || "Lozinke se ne poklapaju",
                            })}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                        Odustani
                    </button>
                    <button type="submit" className="bg-[#4CAF50] text-white px-4 py-2 rounded">
                        Spremi
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordModal;
