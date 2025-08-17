import { useEffect, useState } from "react";
import api from "../../axios/api.ts";
import toast from "react-hot-toast";
import { HiDotsVertical } from "react-icons/hi";

type Category = {
    id: number;
    categoryName: string;
};

const AdminCategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const openDeleteModal = (id: number) => {
        setIsDeleteModalOpen(true);
        setCategoryId(id);
    }
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get("/categories/public");
            setCategories(res.data);
        } catch {
            toast.error("Greška pri dohvaćanju kategorija.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const toggleMenu = (id: number) => {
        setMenuOpenId(prev => (prev === id ? null : id));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Ime kategorije ne može biti prazno.");
            return;
        }
        try {
            await api.post("/categories", { categoryName: newCategoryName });
            toast.success("Kategorija dodana.");
            setNewCategoryName("");
            fetchCategories();
        } catch {
            toast.error("Greška pri dodavanju kategorije.");
        }
    };

    const startEditing = (category: Category) => {
        setEditCategoryId(category.id);
        setEditCategoryName(category.categoryName);
        setMenuOpenId(null);
    };

    const cancelEditing = () => {
        setEditCategoryId(null);
        setEditCategoryName("");
    };

    const handleUpdateCategory = async () => {
        if (!editCategoryName.trim()) {
            toast.error("Ime kategorije ne može biti prazno.");
            return;
        }
        try {
            await api.post(`/categories/update/${editCategoryId}`, { categoryName: editCategoryName });
            toast.success("Kategorija ažurirana.");
            setEditCategoryId(null);
            setEditCategoryName("");
            fetchCategories();
        } catch {
            toast.error("Greška pri ažuriranju kategorije.");
        }
    };

    const handleDeleteCategory = async (id: number | null) => {
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Kategorija izbrisana.");

            fetchCategories();
            setIsDeleteModalOpen(false);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' &&
                'status' in error.response && error.response.status === 400) {
                toast.error("Kategorija nije izbrisana jer postoje recepti koji koriste ovu kategoriju.");
            } else {
                toast.error("Greška pri brisanju kategorije.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FCFAF9] p-6 md:p-12">
            <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <h1 className="text-2xl font-bold text-center text-gray-800 my-6">
                    Kategorije recepata
                </h1>

                {/* Dodavanje nove kategorije */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Nova kategorija"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="border rounded px-4 py-2 w-full max-w-sm"
                    />
                    <button
                        onClick={handleAddCategory}
                        className="bg-[#4CAF50] hover:bg-green-700 text-white px-6 py-2 rounded"
                    >
                        Dodaj
                    </button>
                </div>

                {/* Tablica kategorija */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse bg-[#BAE0FF]">
                        <thead>
                        <tr className="bg-blue-400 text-left text-sm font-medium text-black">
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Naziv kategorije</th>
                            <th className="px-6 py-3 text-center">Akcije</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={3} className="text-center py-6">
                                    Učitavanje...
                                </td>
                            </tr>
                        )}
                        {!loading && categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-6 text-gray-500">
                                    Nema kategorija.
                                </td>
                            </tr>
                        )}
                        {categories.map(category => (
                            <tr key={category.id} className="border-t hover:bg-blue-300 h-20">
                                <td className="px-6 py-4">{category.id}</td>
                                <td className="px-6 py-4">
                                    {editCategoryId === category.id ? (
                                        <input
                                            value={editCategoryName}
                                            onChange={e => setEditCategoryName(e.target.value)}
                                            className="border rounded px-3 py-2 w-full"
                                        />
                                    ) : (
                                        category.categoryName
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center relative">
                                    {editCategoryId === category.id ? (
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={handleUpdateCategory}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm shadow"
                                            >
                                                Spremi
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm shadow"
                                            >
                                                Odustani
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => toggleMenu(category.id)}
                                                className="p-1"
                                            >
                                                <HiDotsVertical className="w-6 h-6 mx-auto text-gray-600 hover:text-black" />
                                            </button>
                                            {menuOpenId === category.id && (
                                                <div className="absolute z-10 -left-24 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm shadow"
                                                        onClick={() => startEditing(category)}
                                                    >
                                                        Ažuriraj
                                                    </button>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm shadow"
                                                        onClick={() => openDeleteModal(category.id)}
                                                    >
                                                        Obriši
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            ⚠️ Upozorenje
                        </h2>
                        <p className="text-red-700 font-bold mb-4 text-center">
                            Ako izbrišete kategoriju, izbrisat ćete sve recepte vezane uz nju.<br/>
                            Jeste li sigurni da želite nastaviti?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => closeDeleteModal()}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={() => handleDeleteCategory(categoryId)}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                            >
                                Izbriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryPage;