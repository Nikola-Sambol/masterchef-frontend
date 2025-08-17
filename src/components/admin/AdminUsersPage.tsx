import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios/api.ts";
import {handleAxiosError} from "../../utils/ErrorHandler.ts";
import { FcCheckmark } from "react-icons/fc";
import { FaTimes } from 'react-icons/fa';
import { HiDotsVertical } from "react-icons/hi";
import toast from "react-hot-toast";
import {BsFillFileEarmarkPdfFill} from "react-icons/bs";
import {handleUsersDownloadPdf} from "../../utils/pdfHandler.ts";
import {useMyContext} from "../../context/AuthContext.tsx";

interface UserDTO {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string[];
    creationDate: string;
    enabled: boolean;
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const { isAdmin } = useMyContext();
    const navigate = useNavigate();
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [refresh, setRefresh] = useState(false);
    const openSuspendModal = (userId: number) => {
        setIsSuspendModalOpen(true);
        setUserId(userId);
    }
    const closeSuspendModal = () => setIsSuspendModalOpen(false);

    const openDeleteModal = (userId: number) => {
        setIsDeleteModalOpen(true);
        setUserId(userId);
    }
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    const toggleMenu = (id: number) => {
        setMenuOpenId(prev => (prev === id ? null : id));
    };

    const actions = [];

    if (isAdmin) {
        actions.push({
            label: "Izvezi u PDF",
            icon: <BsFillFileEarmarkPdfFill />,
            color: "#4CAF50", // crvena
            textColor: "#fff",
            onClick: () => handleUsersDownloadPdf(navigate), // definiraj ovu funkciju
        });
    }



    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mjeseci su 0-indeksirani
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatRole = (role: string[]) => {
        if (role.includes("ROLE_ADMIN")) return "ADMIN";
        if (role.includes("ROLE_USER")) return "KORISNIK";
        return "Nepoznato";
    }

    const confirmSuspension = async () => {
        try {
            await api.post(`/admin/suspend-user/${userId}`);
            toast.success("Korisnik je suspendiran!");
        } catch {
            toast.error("Korisnik nije suspendiran!");
        } finally {
            closeSuspendModal();
            setRefresh(prev => !prev);
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${userId}`);
            toast.success("Korisnik je izbrisan!");
        } catch {
            toast.error("Korisnik nije izbrisan!");
        } finally {
            closeDeleteModal();
            setRefresh(prev => !prev);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/admin/users"); // prilagodi endpoint
                setUsers(response.data);
            } catch (error) {
                const msg = handleAxiosError(error);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [refresh]);

    if (loading) return <p className="text-center mt-10">Učitavanje korisnika...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-[#FCFAF9] p-6 md:p-12">
            {/* Header dio */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Korisnici</h1>

                {isAdmin && (
                    <button
                        onClick={() => handleUsersDownloadPdf(navigate)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                    >
                        <BsFillFileEarmarkPdfFill size={20} />
                        <span>Izvezi u PDF</span>
                    </button>
                )}
            </div>

            {/* separator crta */}
            <hr className="border-gray-300 mb-6" />

            {/* Ostatak */}
            <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse bg-[#BAE0FF]">
                        <thead>
                        <tr className="bg-blue-400 text-left text-sm font-medium text-black">
                            <th className="px-6 py-3">Ime</th>
                            <th className="px-6 py-3">Prezime</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Uloga</th>
                            <th className="px-6 py-3">Datum registracije</th>
                            <th className="px-6 py-3">Omogućen</th>
                            <th className="px-6 py-3 text-center">Profil</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users
                            .filter((user) => !user.role.includes("ROLE_ADMIN"))
                            .map((user) => (
                                <tr key={user.id} className="border-t hover:bg-blue-300 h-30">
                                    <td className="px-6 py-4">{user.name}</td>
                                    <td className="px-6 py-4">{user.surname}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{formatRole(user.role)}</td>
                                    <td className="px-6 py-4">{formatDate(user.creationDate)}</td>
                                    <td className="px-6 py-4">
                                        {user.enabled ? (
                                            <FcCheckmark size={32} />
                                        ) : (
                                            <FaTimes color="red" size={32} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center relative">
                                        <button onClick={() => toggleMenu(user.id)}>
                                            <HiDotsVertical className="w-6 h-6 mx-auto text-gray-600 hover:text-black" />
                                        </button>

                                        {menuOpenId === user.id && (
                                            <div className="absolute z-10 -left-24 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
                                                <button
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm shadow"
                                                    onClick={() => navigate(`/useredit/${user.id}`)}
                                                >
                                                    Profil
                                                </button>

                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm shadow"
                                                    onClick={() => openSuspendModal(user.id)}
                                                >
                                                    Suspendiraj
                                                </button>

                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm shadow"
                                                    onClick={() => openDeleteModal(user.id)}
                                                >
                                                    Obriši
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <p className="text-center py-6 text-gray-500">
                            Nema registriranih korisnika.
                        </p>
                    )}
                </div>
            </div>

            {/* Modal dio ostaje isti */}
            {(isSuspendModalOpen || isDeleteModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            {isDeleteModalOpen && "Potvrda brisanja korisnika"}
                            {isSuspendModalOpen && "Potvrda suspendiranja korisnika"}
                        </h2>
                        <p className="text-black mb-6 text-center">
                            {isDeleteModalOpen && "Jeste li sigurni da želite izbrisati korisnika?"}
                            {isSuspendModalOpen &&
                                "Jeste li sigurni da želite suspendirati korisnika?"}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() =>
                                    isSuspendModalOpen ? closeSuspendModal() : closeDeleteModal()
                                }
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={() =>
                                    isSuspendModalOpen ? confirmSuspension() : confirmDelete()
                                }
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleteModalOpen && "Izbriši"}
                                {isSuspendModalOpen && "Suspendiraj"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default AdminUsersPage;