import { useEffect, useState } from "react";
import api from "../../axios/api.ts";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import FloatingActionButton from "../../utils/FloatingActionButton.tsx";
import { useMyContext } from "../../context/AuthContext.tsx";
import { IoIosArrowBack, IoIosArrowForward, IoMdAddCircle } from "react-icons/io";
import toast from "react-hot-toast";

type UserDTO = {
    name: string;
    surname: string;
};

type Recipe = {
    id: number;
    recipeName: string;
    creationDate: string;
    imagePath: string;
    videoPath: string;
    preparationTime: string;
    components: null;
    category: null;
    user: UserDTO;
};

type Category = {
    id: number;
    categoryName: string;
};

const RecipeCard = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [searchInput, setSearchInput] = useState(""); // što korisnik trenutno tipka
    const [searchTerm, setSearchTerm] = useState(""); // što backend zapravo pretražuje

    const [page, setPage] = useState(0);
    const [size] = useState(6);
    const [totalPages, setTotalPages] = useState(0);

    const { token } = useMyContext();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("q") || "";


    const actions = [];
    if (token) {
        actions.push({
            label: "Dodaj recept",
            icon: <IoMdAddCircle />,
            color: "#4CAF50",
            textColor: "#fff",
            onClick: () => navigate("/addrecipe"),
        });
    }

    // Dohvat kategorija
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories/public");
                setCategories(res.data);
            } catch (err) {
                console.error("Greška pri dohvaćanju kategorija", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setSearchTerm(searchQuery);  // sinkroniziraj searchTerm s query iz URL-a
        setPage(0); // ako želiš reset paginacije na novu pretragu
    }, [searchQuery]);

    // Dohvat recepata
    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const response = await api.get("/recipes/public", {
                    params: {
                        page: page,
                        size: size,
                        categoryId: categoryId || null,
                        recipeName: searchTerm || searchQuery || null,
                    },
                });
                setRecipes(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch {
                toast.error("Nije moguce dohvatiti recepte");
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, [page, size, categoryId, searchTerm]);

    // Format datuma
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Pokreni pretragu
    const handleSearch = () => {
        setSearchTerm(searchInput.trim());
        setPage(0);
    };

    if (loading) return <p>Učitavanje recepata...</p>;
    if (error) return <p>Greška: {error}</p>;

    return (
        <div className="w-full">
            {/* FILTERI */}
            <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto px-5 mt-4">
                <input
                    type="text"
                    placeholder="Pretraži po nazivu..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                    className="border rounded p-2 flex-1"
                />

                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Search
                </button>

                <select
                    value={categoryId || ""}
                    onChange={(e) => {
                        setCategoryId(e.target.value ? Number(e.target.value) : null);
                        setPage(0);
                    }}
                    className="border rounded p-2 w-full md:w-auto"
                >
                    <option value="">Sve kategorije</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {/* GRID RECEPATA */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl mx-auto px-5 py-6 place-items-stretch">
                {recipes.map((recipe) => (
                    <Link
                        key={recipe.id}
                        to={`/recipedetails/${recipe.id}`}
                        className="flex flex-col bg-[#BAE0FF] border border-gray-200 rounded-lg shadow-sm hover:bg-blue-300 hover:shadow-lg transition-transform hover:-translate-y-1"
                    >
                        <img
                            className="w-full h-48 object-cover rounded-t-lg"
                            src={`${import.meta.env.VITE_API_URL}/${recipe.imagePath}`}
                            alt={recipe.recipeName}
                        />
                        <div className="p-4 text-left">
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-black">
                                {recipe.recipeName}
                            </h5>
                            <p className="mb-2 font-normal text-black">
                                Autor: {recipe.user.name} {recipe.user.surname}
                            </p>
                            <p className="mb-2 font-normal text-black">
                                Vrijeme pripreme: {recipe.preparationTime}
                            </p>
                            <p className="mb-2 font-normal text-black">
                                Datum objave: {formatDate(recipe.creationDate)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* PAGINACIJA */}
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className={`p-2 rounded-full transition-colors ${
                        page === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:bg-blue-100"
                    }`}
                    aria-label="Prethodna stranica"
                >
                    <IoIosArrowBack size={24} />
                </button>

                <span className="text-black font-semibold">
                    Stranica {page + 1} od {totalPages}
                </span>

                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={page + 1 >= totalPages}
                    className={`p-2 rounded-full transition-colors ${
                        page + 1 >= totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:bg-blue-100"
                    }`}
                    aria-label="Sljedeća stranica"
                >
                    <IoIosArrowForward size={24} />
                </button>
            </div>

            {token && <FloatingActionButton actions={actions} />}
        </div>
    );
};

export default RecipeCard;
