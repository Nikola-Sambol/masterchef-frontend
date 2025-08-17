// src/components/UpdateRecipeModal.tsx
import { useEffect, useState } from "react";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";
import api from "../../axios/api.ts";
import toast from "react-hot-toast";

interface Props {
    id: number;
    onClose: () => void;
}

const UpdateRecipeModal = ({ id, onClose }: Props) => {
    interface Category {
        id: number;
        categoryName: string;
    }

    interface Recipe {
        recipeName: string;
        preparationTime: string;
        category: Category;
        image: string;   // base64
        video?: string;  // base64
    }

    interface OptionType {
        value: number;
        label: string;
    }

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category>();
    const [deleteVideo, setDeleteVideo] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recipeRes, catRes] = await Promise.all([
                    api.get(`recipes/public/${id}`),
                    api.get("categories/public"),
                ]);

                setRecipe(recipeRes.data);
                setCategories(catRes.data);

                setValue("name", recipeRes.data.recipeName);
                setValue("preparationTime", recipeRes.data.preparationTime);

                const categoryFromRecipe = catRes.data.find(
                    (cat: Category) => cat.categoryName === recipeRes.data.category?.categoryName
                );

                if (categoryFromRecipe) {
                    setSelectedCategory(categoryFromRecipe);
                }
            } catch {
                toast.error("Greška pri dohvaćanju podataka.");
            }
        };

        fetchData();
    }, [id, setValue]);

    interface SubmitFormData {
        name: string;
        preparationTime: string;
        image: FileList;
        video: FileList;
    }

    const onSubmit = async (data: SubmitFormData) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("preparationTime", data.preparationTime);

        if (data.image && data.image[0]) {
            formData.append("image", data.image[0]);
        }

        if (data.video && data.video[0]) {
            formData.append("video", data.video[0]);
        }

        if (selectedCategory) {
            formData.append("category", selectedCategory.id.toString());
        }

        if (deleteVideo) {
            formData.append("deleteVideo", "true");
        }

        try {
            await api.post(`recipes/update/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Recept uspješno ažuriran!");
            onClose();
        } catch {
            toast.error("Greška prilikom ažuriranja.");
        }
    };

    if (!recipe) return <div>Učitavanje...</div>;

    const options: OptionType[] = categories.map((cat) => ({
        value: cat.id,
        label: cat.categoryName,
    }));

    return (
        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
            <h2 className="text-2xl font-semibold mb-4">Ažuriraj Recept</h2>

            <label className="block mb-2 font-semibold">Naziv recepta</label>
            <input
                type="text"
                {...register("name", {
                    required: "Naziv je obavezan.",
                    minLength: {
                        value: 3,
                        message: "Naziv mora imati najmanje 3 karaktera!",
                    },
                })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
            />
            {errors.name && (
                <p className="text-red-500 text-sm mb-3">
                    {errors.name.message?.toString()}
                </p>
            )}

            <label className="block mb-2 font-semibold">Nova slika (opcionalno)</label>
            <input
                type="file"
                {...register("image")}
                className="mb-4"
                accept="image/png, image/jpeg, image/jpg"
            />
            {recipe.image && (
                <img
                    src={`data:image/png;base64,${recipe.image}`}
                    alt="Trenutna slika"
                    className="w-32 h-auto rounded mb-4"
                />
            )}

            <label className="block mb-2 font-semibold">Video pripreme (opcionalno)</label>
            <input
                type="file"
                {...register("video")}
                className="mb-2"
                accept="video/mp4, video/webm"
            />
            {recipe.video && !deleteVideo && (
                <div className="mb-4">
                    <video controls className="w-64 h-40 rounded mb-2">
                        <source src={`data:video/mp4;base64,${recipe.video}`} />
                    </video>
                    <button
                        type="button"
                        onClick={() => setDeleteVideo(true)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                        Obriši video
                    </button>
                </div>
            )}
            {deleteVideo && <p className="text-red-600 mb-4">Video će biti obrisan.</p>}

            <label className="block mb-2 font-semibold">Vrijeme pripreme</label>
            <input
                type="text"
                {...register("preparationTime", {
                    required: "Vrijeme pripreme je obavezno.",
                    minLength: {
                        value: 2,
                        message: "Vrijeme pripreme mora imati najmanje 2 karaktera!",
                    },
                })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
            />
            {errors.preparationTime && (
                <p className="text-red-500 text-sm mb-3">
                    {errors.preparationTime.message?.toString()}
                </p>
            )}

            <label className="block mb-2 font-semibold">Kategorija</label>
            <Select
                options={options}
                value={
                    selectedCategory
                        ? options.find((opt) => opt.value === selectedCategory.id)
                        : null
                }
                onChange={(opt) => {
                    const selected = categories.find((c) => c.id === opt?.value);
                    if (selected) setSelectedCategory(selected);
                }}
                className="mb-6"
            />

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Odustani
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Spremi
                </button>
            </div>
        </form>
    );
};

export default UpdateRecipeModal;
