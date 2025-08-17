import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../axios/api";
import { useMyContext } from "../../context/AuthContext.tsx";
import ModalWrapper from "../../utils/ModalWrapper.tsx";
import EditUserModal from "./EditUserModal.tsx";
import ChangePasswordModal from "./ChangePasswordModal.tsx";
import { HiDotsVertical } from "react-icons/hi";
import { useLogout } from "../../utils/Logout.ts";
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
import { handleUserDownloadPdf } from "../../utils/pdfHandler.ts";
import FloatingActionButton from "../../utils/FloatingActionButton.tsx";
import {IoMdAddCircle} from "react-icons/io";

type User = {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string[];
    enabled: boolean;
    creationDate: string;
};

type Recipe = {
    id: number;
    recipeName: string;
    creationDate: string;
};

const EditUserPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const logout = useLogout();
    const { isAdmin, currentUser, token } = useMyContext();

    const [user, setUser] = useState<User | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [recipeId, setRecipeId] = useState<number | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
    const [isRecipeDeleteModalOpen, setIsRecipeDeleteModalOpen] = useState(false);
    const [refreshRecipes, setRefreshRecipes] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { setValue } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            email: "",
        },
    });

    const actions = [];
    if (isAdmin) {
        actions.push({
            label: "Izvezi u PDF",
            icon: <BsFillFileEarmarkPdfFill />,
            color: "#4CAF50",
            textColor: "#fff",
            onClick: () => handleUserDownloadPdf(id, navigate),
        });
    }

    const fabActions = [];
    if (token) {
        fabActions.push({
            label: "Dodaj recept",
            icon: <IoMdAddCircle />,
            color: "#4CAF50",
            textColor: "#fff",
            onClick: () => navigate("/addrecipe"),
        });
    }

    const toggleMenu = (id: number) => setMenuOpenId((prev) => (prev === id ? null : id));
    const openRecipeDeleteModal = (recipeId: number) => {
        setIsRecipeDeleteModalOpen(true);
        setRecipeId(recipeId);
    };
    const closerRecipeDeleteModal = () => setIsRecipeDeleteModalOpen(false);
    const openSuspendModal = (userId: number) => {
        setIsSuspendModalOpen(true);
        setUserId(userId);
    };
    const closeSuspendModal = () => setIsSuspendModalOpen(false);
    const openDeleteModal = (userId: number) => {
        setIsDeleteModalOpen(true);
        setUserId(userId);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    // Fetch user
    useEffect(() => {
        const fetchUser = async () => {
            if (!id && !currentUser) return;
            const url = id ? `/admin/user/${id}` : `/auth/user`;
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
        fetchUser();
    }, [id, currentUser, setValue]);

    // Fetch recipes samo za admina
    useEffect(() => {
        if (!isAdmin) return;
        const fetchRecipes = async () => {
            if (!id && !currentUser) return;
            const url = id ? `/recipes/${id}` : `/recipes`;
            setLoading(true);
            try {
                const res = await api.get(url);
                setRecipes(res.data);
            } catch {
                setRecipes([]);
            } finally {
                setLoading(false);
                setRefreshRecipes(false);
            }
        };
        fetchRecipes();
    }, [id, currentUser, refreshRecipes, isAdmin]);

    const confirmRecipeDelete = async () => {
        try {
            await api.delete(`/recipes/delete/${recipeId}`);
            toast.success("Recept je izbrisan!");
            closerRecipeDeleteModal();
            setRefreshRecipes(true);
        } catch {
            toast.error("Recept nije izbrisan!");
            closerRecipeDeleteModal();
        }
    };

    const confirmSuspension = async () => {
        try {
            await api.post(`/admin/suspend-user/${userId}`);
            toast.success("Korisnik je suspendiran!");
        } catch {
            toast.error("Korisnik nije suspendiran!");
        } finally {
            closeSuspendModal();
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${userId}`);
            toast.success("Korisnik je izbrisan!");
            if (isAdmin) navigate("/admin/users");
            else logout();
        } catch {
            toast.error("Korisnik nije izbrisan!");
        } finally {
            closeDeleteModal();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    if (!user) return <div className="p-6">Učitavanje korisnika...</div>;

    return (
        <div className="flex justify-center bg-[#F9F9F9] min-h-screen px-4 py-8">
            <div
                className={`w-full max-w-7xl grid gap-6 ${
                    isAdmin ? "grid-cols-1 lg:grid-cols-10" : "grid-cols-1 lg:grid-cols-6"
                }`}
            >
                {/* PROFIL */}
                {/* PROFIL */}
                <div
                    className={`bg-white shadow-md rounded-md p-6 h-auto flex flex-col ${
                        isAdmin ? "lg:col-span-4" : "lg:col-span-6 lg:mx-auto"
                    }`}
                >
                    <h2 className="text-xl font-bold mb-6 text-center">
                        Profil korisnika {user.name} {user.surname}
                    </h2>

                    {/* Gumb za PDF samo za admina */}
                    {isAdmin && id && (
                        <div className="flex justify-center mb-6">
                            <button
                                type="button"
                                onClick={() => handleUserDownloadPdf(id, navigate)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                            >
                                <BsFillFileEarmarkPdfFill className="w-5 h-5" />
                                Izvezi u PDF
                            </button>
                        </div>
                    )}


                    <div className="space-y-4 flex-grow">
                        <div>
                            <label className="block mb-1 font-medium text-gray-800">Ime</label>
                            <input
                                type="text"
                                value={user.name}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-800">Prezime</label>
                            <input
                                type="text"
                                value={user.surname}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-800">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-800">Uloga</label>
                            <input
                                type="text"
                                value={user.role.includes("ROLE_ADMIN") ? "Administrator" : "Korisnik"}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-800">Omogućen</label>
                            <input
                                type="text"
                                value={user.enabled ? "Da" : "Ne"}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-800">Datum kreiranja</label>
                            <input
                                type="text"
                                value={formatDate(user.creationDate)}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex gap-4 justify-center">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#FF9800] hover:bg-yellow-400 text-white px-4 py-2 rounded"
                            >
                                Ažuriraj podatke
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSecondModalOpen(true)}
                                className="bg-[#FF9800] hover:bg-yellow-400 text-white px-4 py-2 rounded"
                            >
                                Ažuriraj lozinku
                            </button>
                        </div>
                        <div className="flex gap-4 justify-center mt-3">

                        {isAdmin && (
                                user.role.includes("ROLE_USER") && (
                                    <button
                                        type="button"
                                        className="bg-[#E30C37] hover:bg-red-800 text-white px-4 py-2 rounded"
                                        onClick={() => openSuspendModal(user.id)}
                                    >
                                        Suspendiraj korisnika
                                    </button>



                        ))}
                        {!user.role.includes("ROLE_ADMIN") && (
                            <button
                                type="button"
                                className="bg-[#E30C37] hover:bg-red-700 text-white px-4 py-2 rounded"
                                onClick={() => openDeleteModal(user.id)}
                            >
                                Izbriši profil
                            </button>
                        )}
                            </div>
                    </div>
                </div>

                {/* RECEPTE TABLICA SAMO ZA ADMINA */}
                {isAdmin && recipes.length > 0 && (
                    <div className="lg:col-span-6 bg-white shadow-md rounded-md p-6 overflow-x-auto">
                        <h2 className="text-xl font-bold mb-4">Korisnikovi recepti</h2>
                        {!loading && recipes.length > 0 ? (
                            <table className="min-w-full table-auto border-2 bg-[#BAE0FF]">
                                <thead>
                                <tr className="bg-blue-400 text-left text-sm font-medium text-black">
                                    <th className="px-6 py-3">Naziv recepta</th>
                                    <th className="px-6 py-3">Datum kreiranja</th>
                                    <th className="px-6 py-3 text-center">Akcije</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recipes.map((recipe) => (
                                    <tr key={recipe.id} className="border-t hover:bg-gray-50 h-20">
                                        <td className="px-6 py-4">{recipe.recipeName}</td>
                                        <td className="px-6 py-4">{formatDate(recipe.creationDate)}</td>
                                        <td className="px-6 py-4 text-center relative">
                                            <button onClick={() => toggleMenu(recipe.id)}>
                                                <HiDotsVertical className="w-6 h-6 mx-auto text-gray-600 hover:text-black" />
                                            </button>
                                            {menuOpenId === recipe.id && (
                                                <div className="absolute z-10 -left-24 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm shadow"
                                                        onClick={() => navigate(`/recipedetails/${recipe.id}`)}
                                                    >
                                                        Cijeli recept
                                                    </button>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm shadow"
                                                        onClick={() => openRecipeDeleteModal(recipe.id)}
                                                    >
                                                        Obriši recept
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Korisnik nema recepata</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modalni prozori */}
            {isModalOpen && (
                <ModalWrapper onClose={() => setIsModalOpen(false)}>
                    <EditUserModal
                        id={id ? Number(id) : (currentUser?.id ?? 0)}
                        onClose={() => {
                            setIsModalOpen(false);
                            setRefreshRecipes(true);
                        }}
                    />
                </ModalWrapper>
            )}
            {isSecondModalOpen && (
                <ModalWrapper onClose={() => setIsSecondModalOpen(false)}>
                    <ChangePasswordModal id={id ? Number(id) : (currentUser?.id ?? 0)} onClose={() => setIsSecondModalOpen(false)} isAdmin={isAdmin} />
                </ModalWrapper>
            )}
            {isRecipeDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                        <h2 className="text-xl font-semibold mb-4 text-center">Potvrda brisanja recepta</h2>
                        <p className="text-black mb-6 text-center">Jeste li sigurni da želite izbrisati recept?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => closerRecipeDeleteModal()}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={() => confirmRecipeDelete()}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                            >
                                Izbriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {fabActions.length > 0 && <FloatingActionButton actions={fabActions} />}
            {(isSuspendModalOpen || isDeleteModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            {isDeleteModalOpen && "Potvrda brisanja korisnika"}
                            {isSuspendModalOpen && "Potvrda suspendiranja korisnika"}
                        </h2>
                        <p className="text-black mb-6 text-center">
                            {isDeleteModalOpen && "Jeste li sigurni da želite izbrisati korisnika?"}
                            {isSuspendModalOpen && "Jeste li sigurni da želite suspendirati korisnika?"}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => (isSuspendModalOpen ? closeSuspendModal() : closeDeleteModal())}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={() => (isSuspendModalOpen ? confirmSuspension() : confirmDelete())}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleteModalOpen && "Izbriši"}
                                {isSuspendModalOpen && "Suspendiraj"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAdmin && (<FloatingActionButton actions={fabActions}/>)}
        </div>
    );
};

export default EditUserPage;
