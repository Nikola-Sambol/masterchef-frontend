import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <FaUtensils className="text-7xl text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6 text-center max-w-md">
                Izgleda da ono što ste tražili nije pronađeno.
                Možda je sadržaj obrisan ili premješten.
            </p>
            <button
                onClick={() => navigate("/")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow"
            >
                Vrati se na početnu stranicu
            </button>
        </div>
    );
};

export default NotFoundPage;
