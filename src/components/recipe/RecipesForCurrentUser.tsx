import {useEffect, useState} from "react";
import api from "../../axios/api.ts";
import {Link, useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import FloatingActionButton from "../../utils/FloatingActionButton.tsx";
import {useMyContext} from "../../context/AuthContext.tsx";
import {IoMdAddCircle} from "react-icons/io";

const RecipesForCurrentUser = () => {

    type ComponentDTO = {
        id: number;
        componentName: string;
        imagePath: string;
        ingredients: string;
        instruction: string[];
    };

    type CategoryDTO = {
        id: number;
        categoryName: string;
    };

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
        components: ComponentDTO[];
        category: CategoryDTO;
        user: UserDTO;
    };

    const [recipes, setRecipes] = useState<Recipe[]>([]); // Stanje za recepte
    const [loading, setLoading] = useState(false); // Stanje za učitavanje
    const [error] = useState(null); // Za pohranu grešaka, ako ih ima
    const fabActions = [];
    const {token} = useMyContext();
    const navigate = useNavigate();

    if (token) {
        fabActions.push({
            label: "Dodaj recept",
            icon: <IoMdAddCircle />,
            color: "#4CAF50",
            textColor: "#fff",
            onClick: () => navigate("/addrecipe"),
        });
    }
    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true); // Postavi loading na true
            try {
                // API poziv za recepte
                const response = await api.get("/recipes/user"); // Zamijeni "/api/recipes" stvarnom adresom API-ja
                setRecipes(response.data);// Postavi recepte u stanje
            } catch {
                toast.error("Greška pri dohvaćanju recepta za korisnika.")// Uhvatiti i postaviti grešku
            } finally {
                setLoading(false); // Nakon završetka postavi loading na false
            }
        };

        fetchRecipes(); // Pozovi funkciju za dohvaćanje recepata

    }, []); // Prazan dependency array -> izvršava se samo jednom kod mountanja komponente

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mjeseci su 0-indeksirani
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    if (loading) return <p>Učitavanje recepata...</p>;
    if (error) return <p>Greška: {error}</p>;


    return (
        <div className="w-full">
            <div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl mx-auto px-5 py-6 place-items-stretch">
                {recipes.map((recipe) => (

                    <Link
                        key={recipe.id}
                        to={`/recipedetails/${recipe.id}`}
                        className="flex flex-col bg-[#BAE0FF] border border-gray-200 rounded-lg shadow-sm hover:bg-blue-300 hover:shadow-lg transition-transform hover:-translate-y-1"                    >
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
            {fabActions.length > 0 && <FloatingActionButton actions={fabActions} />}
        </div>
    );


}

export default RecipesForCurrentUser;