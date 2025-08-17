import {Link, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../axios/api.ts";
import {useMyContext} from "../context/AuthContext.tsx";
import {IoMdAddCircle} from "react-icons/io";
import FloatingActionButton from "../utils/FloatingActionButton.tsx";

interface Recipe {
    id: number;
    recipeName: string;
    creationDate: string;
    imagePath: string;
    videoPath: string;
    preparationTime: string;
    components: null;
    category: null;
    user: {
        name: string;
        surname: string;
    }
}

const LandingPage = () => {
    const [recipes, setRecipes] = useState([]);
    const {token} = useMyContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await api.get("/recipes/public/frontpage");
                setRecipes(response.data.slice(response.data.length - 3, response.data.length)); // ograniči na 3 recepta
            } catch (error) {
                console.error("Greška prilikom dohvaćanja recepata:", error);
            }
        };

        fetchRecipes();
    }, []);

    const actions = [];

    if (token) {
        actions.push({
            label: "Dodaj recept",
            icon: <IoMdAddCircle />,
            color: "#4CAF50", // crvena
            textColor: "#fff",
            onClick: () => navigate("/addrecipe"), // definiraj ovu funkciju
        });
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="min-h-screen bg-[#FFF9F5] p-6">
            <div className="max-w-5xl mx-auto text-center py-10">
                <h1 className="text-5xl font-bold text-[#2D3748] mb-6">
                    Dobrodošli u <span className="text-[#E30C37]">Masterchef App</span>!
                </h1>
                <p className="text-lg text-[#4A5568] mb-4">
                    Masterchef App je vaša kulinarska oaza – otkrijte raznovrsne recepte, pronađite novu inspiraciju, učite kroz savjete drugih članova i postanite dio zajednice zaljubljenika u kuhanje.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center mb-10 pt-4">
                    <Link
                        to="/allrecipes"
                        className="px-6 py-3 bg-[#4056A1] text-white rounded-xl text-lg font-semibold shadow hover:bg-[#857dff] transition"
                    >
                        Pregledaj sve recepte
                    </Link>
                    {token && (
                        <Link
                            to="/addrecipe"
                            className="px-6 py-3 bg-[#4056A1] text-white rounded-xl text-lg font-semibold shadow hover:bg-[#857dff] transition"
                        >
                            Dodaj novi recept
                        </Link>
                    )}
                </div>
                {!token && (
                    <p className="text-lg text-[#4A5568] mb-8">
                        Pregledajte našu bogatu kolekciju recepata ili se pridružite zajednici – registrirajte se i podijelite vlastite kulinarske kreacije. Već ste član? Prijavite se i nastavite s istraživanjem!
                    </p>
                )}


                {!token && (
                    <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">

                        <Link
                            to="/signin"
                            className="px-6 py-3 bg-[#4056A1] text-white rounded-xl text-lg font-medium hover:bg-[#4A5568] transition"
                        >
                            Prijava
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-3 bg-[#4056A1] text-white rounded-xl text-lg font-medium hover:bg-[#4A5568] transition"
                        >
                            Registracija
                        </Link>
                    </div>
                )}

            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <h2 className="text-3xl font-bold text-[#2D3748] mb-6 text-center">
                    Istraži najnovije recepte iz naše zajednice
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe: Recipe) => (
                        <Link
                            key={recipe.id}
                            to={`/recipedetails/${recipe.id}`}
                            className="flex flex-col bg-[#BAE0FF] border border-gray-200 rounded-lg shadow-sm hover:bg-blue-300 hover:shadow-lg transition-transform hover:-translate-y-1"
                        >
                            <img
                                className="w-full h-48 object-cover rounded-t-lg"
                                src={`http://localhost:8080/api/${recipe.imagePath}`}
                                alt={recipe.recipeName}
                            />
                            <div className="p-4 text-left">
                                <h5 className="mb-2 text-2xl font-bold tracking-tight text-black">
                                    {recipe.recipeName}
                                </h5>
                                <p className="mb-1 text-black">
                                    Autor: {recipe.user.name} {recipe.user.surname}
                                </p>
                                <p className="mb-1 text-black">
                                    Vrijeme pripreme: {recipe.preparationTime}
                                </p>
                                <p className="text-black">
                                    Datum objave: {formatDate(recipe.creationDate)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            {token && (
                <FloatingActionButton actions={actions} />
            )}
        </div>
    );
};


export default LandingPage;