import {type JSX, useEffect, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios/api.ts";
import ModalWrapper from "../../utils/ModalWrapper.tsx";
import UpdateRecipeModal from "./UpdateRecipeModal.tsx";
import UpdateComponentsModal from "../component/UpdateComponentsModal.tsx";
import { FaEdit } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { RiDeleteBin6Fill } from "react-icons/ri";
import FloatingActionButton from "../../utils/FloatingActionButton.tsx";
import { useMyContext } from "../../context/AuthContext.tsx";
import toast from "react-hot-toast";
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
import { handleAxiosError } from "../../utils/ErrorHandler.ts";
import { handleRecipeDownloadPdf } from "../../utils/pdfHandler.ts";
import axios from "axios";

const RecipeDetails = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<RecipeDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => setIsDeleteModalOpen(false);
    const { token, isAdmin, currentUser } = useMyContext();
    const navigate = useNavigate();

    interface CategoryDTO {
        id: number;
        categoryName: string;
    }

    interface ComponentDTO {
        id: number;
        componentName: string;
        imagePath: string;
        ingredients: string;
        instruction: string;
    }

    interface UserDTO {
        name: string;
        surname: string;
        email: string;
    }

    interface RecipeDTO {
        id: number;
        recipeName: string;
        creationDate: string;
        imagePath: string;
        videoPath: string;
        preparationTime: string;
        components: ComponentDTO[];
        category: CategoryDTO;
        user: UserDTO;
    }

    // Akcije za toolbar (iznad recepta)
    const toolbarActions: {
        label: string;
        icon: JSX.Element;
        color: string;
        textColor: string;
        onClick: () => void;
    }[] = [];
    toolbarActions.push({
        label: "Izvezi u PDF",
        icon: <BsFillFileEarmarkPdfFill />,
        color: "#4CAF50",
        textColor: "#fff",
        onClick: () => handleRecipeDownloadPdf(id, navigate),
    });

    if ((token && currentUser && currentUser.email === recipe?.user.email) || isAdmin) {
        toolbarActions.push(
            {
                label: "Uredi recept",
                icon: <FaEdit />,
                color: "#FF9800",
                textColor: "#fff",
                onClick: () => setIsModalOpen(true),
            },
            {
                label: "Uredi komponente",
                icon: <FaEdit />,
                color: "#FF9800",
                textColor: "#fff",
                onClick: () => setIsSecondModalOpen(true),
            },
            {
                label: "Izbriši recept",
                icon: <RiDeleteBin6Fill />,
                color: "#E30C37",
                textColor: "#fff",
                onClick: () => openDeleteModal(),
            }

        );
    }

    // PDF akcija uvijek dostupna


    // FAB samo za "Dodaj recept"
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

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await api.get(`/recipes/public/${id}`);
                setRecipe(response.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response && err.response.status === 400) {
                    navigate("/*");
                } else {
                    const message = handleAxiosError(err);
                    toast.error(message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id, isModalOpen, isSecondModalOpen]);

    const confirmDelete = async () => {
        try {
            await api.delete(`/recipes/delete/${id}`);
            toast.success("Recept je uspješno izbrisan");
            navigate("/allrecipes");
        } catch {
            toast.error("Recept nije izbrisan");
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

    if (loading) return <p className="text-center mt-10">Učitavanje recepta...</p>;
    if (error || !recipe)
        return <p className="text-center mt-10 text-red-500">{error || "Recept nije pronađen."}</p>;

    return (
        <div className="min-h-screen bg-[#FCFAF9] p-6 md:p-12 pb-32">
            <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                {/* Toolbar s akcijama */}
                <div className="flex flex-wrap gap-3 p-4 border-b bg-gray-50 justify-start">
                    {toolbarActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="flex items-center gap-2 px-4 py-2 rounded shadow text-sm font-medium"
                            style={{ backgroundColor: action.color, color: action.textColor }}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Flex container za sliku i video */}
                <div className="flex flex-col md:flex-row gap-4 p-6">
                    <img
                        src={`http://localhost:8080/api/${recipe.imagePath}`}
                        alt={recipe.recipeName}
                        className="w-full md:w-2/5 h-auto object-cover rounded-md"
                        style={{ maxHeight: "300px" }}
                    />

                    {recipe.videoPath && (
                        <video
                            src={`http://localhost:8080/api/${recipe.videoPath}`}
                            controls
                            className="w-full md:w-3/5 rounded-md"
                            style={{ maxHeight: "300px", objectFit: "cover" }}
                        />
                    )}
                </div>

                {/* Detalji recepta */}
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.recipeName}</h1>
                    <p className="text-sm text-black mb-1">
                        Autor: {recipe.user.name} {recipe.user.surname}
                    </p>
                    <p className="text-sm text-black mb-1">Datum: {formatDate(recipe.creationDate)}</p>
                    <p className="text-sm text-black mb-1">Kategorija: {recipe.category?.categoryName}</p>
                    <p className="text-sm text-black mb-4">Vrijeme pripreme: {recipe.preparationTime}</p>

                    {recipe.components.map((comp) => (
                        <div key={comp.id} className="mb-8 border-t pt-6 mt-6 border-gray-200">
                            <h2 className="text-2xl font-semibold text-black mb-2">{comp.componentName}</h2>

                            {comp.imagePath && (
                                <img
                                    src={`http://localhost:8080/api/${comp.imagePath}`}
                                    alt={comp.componentName}
                                    className="w-full md:w-1/2 rounded-md object-cover mb-4"
                                />
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-medium text-black">Sastojci:</h3>
                                <p className="text-gray-800 whitespace-pre-line">{comp.ingredients}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-black">Upute:</h3>
                                <p className="text-gray-800 whitespace-pre-line">{comp.instruction}</p>
                            </div>
                        </div>
                    ))}

                    {isModalOpen && (
                        <ModalWrapper onClose={() => setIsModalOpen(false)}>
                            <UpdateRecipeModal id={Number(id)} onClose={() => setIsModalOpen(false)} />
                        </ModalWrapper>
                    )}

                    {isSecondModalOpen && (
                        <ModalWrapper onClose={() => setIsSecondModalOpen(false)}>
                            <UpdateComponentsModal onClose={() => setIsSecondModalOpen(false)} />
                        </ModalWrapper>
                    )}
                </div>
            </div>

            {/* FAB za Dodaj recept */}
            {fabActions.length > 0 && <FloatingActionButton actions={fabActions} />}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                        <h2 className="text-xl font-semibold mb-4 text-center">Potvrda brisanja</h2>
                        <p className="text-black mb-6 text-center">
                            Jeste li sigurni da želite izbrisati sljedeći recept:
                        </p>
                        <p className="text-black mb-6 text-center">{recipe.recipeName}</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={confirmDelete}
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

export default RecipeDetails;