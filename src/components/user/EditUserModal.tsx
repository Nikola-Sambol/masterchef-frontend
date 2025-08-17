import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import api from "../../axios/api.ts";
import toast from "react-hot-toast";
import {useMyContext} from "../../context/AuthContext.tsx";
import {jwtDecode} from "jwt-decode";

interface Props {
    id: number;
    onClose: () => void;
}

type User = {
    name: string;
    surname: string;
    email: string;
};

const EditUserModal = ({id, onClose}: Props) => {

    const [user, setUser] = useState<User>();
    const {isAdmin, setToken} = useMyContext();

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            email: "",
        },
    });

    useEffect(() => {
        const fetchUser = async () => {
            let url = "";
            if (isAdmin) url = `/admin/user/${id}`;
            else url = `/auth/user`;

            try {
                const res = await api.get(url);
                setUser(res.data);
                setValue("name", res.data.name);
                setValue("surname", res.data.surname);
                setValue("email", res.data.email);
            } catch {
                toast.error("Greška pri dohvaćanju korisnika.");
            }
        };

        fetchUser()
    }, []);

    const handleSuccessfulLogin = (token: string, decodedToken: { sub?: string }) => {
        if (!decodedToken.sub) {
            return;
        }

        const user = {
            email: decodedToken.sub,
        };
        localStorage.setItem("USER", JSON.stringify(user));
        localStorage.setItem("JWT_TOKEN", token);
        setToken(token);
    }

    const onSubmit = async (data: { name: string; surname: string; email: string }) => {

        try {
            const response = await api.post(`/users/${id}`, {
                ...data,
            });
            toast.success("Korisnički podaci su uspješno ažurirani.");
            if (response.status === 200 && response.data.jwtToken) {
                const decodedToken = jwtDecode(response.data.jwtToken);
                handleSuccessfulLogin(response.data.jwtToken, decodedToken as { sub?: string });
            }
            onClose();
        } catch {
            toast.error("Greška pri ažuriranju korisnika.");
        }
    };

    if (!user) return <div className="p-6">Učitavanje korisnika...</div>;

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Ime */}
                <div>
                    <label htmlFor="name" className="block mb-1 font-medium text-gray-800">
                        Ime
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="w-full border rounded px-3 py-2"
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

                {/* Prezime */}
                <div>
                    <label htmlFor="surname" className="block mb-1 font-medium text-gray-800">
                        Prezime
                    </label>
                    <input
                        id="surname"
                        type="text"
                        className="w-full border rounded px-3 py-2"
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
                        className="w-full border rounded px-3 py-2"
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


}

export default EditUserModal;