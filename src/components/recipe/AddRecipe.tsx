import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import type {SubmitHandler, FieldValues} from "react-hook-form";


import api from "../../axios/api.ts";
import { handleAxiosError } from "../../utils/ErrorHandler.ts";

// ------------------------------------
// TYPES
// ------------------------------------
interface Category {
    id: number;
    categoryName: string;
}

interface OptionType {
    value: number;
    label: string;
}

// ------------------------------------
// COMPONENT
// ------------------------------------
const AddRecipe = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({ mode: "onSubmit" });

    const navigate: NavigateFunction = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const options: OptionType[] = categories.map((category) => ({
        value: category.id,
        label: category.categoryName,
    }));

    // ------------------------------------
    // FETCH CATEGORIES
    // ------------------------------------
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("categories/public");
                setCategories(response.data);
            } catch {
                toast.error("Kategorije se nisu mogle dohvatiti.");
            }
        };

        // const downloadPdf = async () => {
        //     try {
        //         const response = await api.get("/api/pdf", {
        //             responseType: "blob",
        //             headers: {
        //                 Accept: "application/pdf",
        //             },
        //         });
        //
        //         const blob = new Blob([response.data], { type: "application/pdf" });
        //         const url = window.URL.createObjectURL(blob);
        //         const link = document.createElement("a");
        //         link.href = url;
        //         link.setAttribute("download", "recept_6.pdf");
        //         document.body.appendChild(link);
        //         link.click();
        //         link.remove();
        //     } catch (error) {
        //         console.error("Greška kod preuzimanja PDF-a:", error);
        //     }
        // };

        fetchCategories();
        // downloadPdf();
    }, []);

    // ------------------------------------
    // TOAST
    // ------------------------------------
    const RecipeSuccessToast = ({ name, imageUrl }: { name: string; imageUrl: string }) => (
        <div className="flex items-center space-x-4 p-4 bg-white shadow-lg rounded-lg border border-green-500">
            <img
                src={imageUrl}
                alt="Slika recepta"
                className="w-16 h-16 object-cover rounded border border-gray-300"
            />
            <div className="text-left">
                <p className="text-lg font-semibold text-green-700">Recept "{name}" je uspješno kreiran!</p>
                <p className="text-sm text-black">Sada možete dodati komponente.</p>
            </div>
        </div>
    );

    // ------------------------------------
    // FORM SUBMIT
    // ------------------------------------
    interface RecipeFormData {
        name: string;
        preparationTime: string;
        image: FileList;
        video?: FileList;
        category?: number;
    }


    const onSubmit = async (data: RecipeFormData) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("preparationTime", data.preparationTime);
        formData.append("image", data.image[0]);

        if (data.video && data.video.length > 0) {
            formData.append("video", data.video[0]);
        } else {
            formData.append("video", new Blob([], { type: "application/octet-stream" }));
        }

        if (data.category) {
            formData.append("category", data.category.toString());
        }

        try {
            const response = await api.post("recipes", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            navigate(`/recipe/${response.data}/addcomponent`);
            toast.custom(() =>
                <RecipeSuccessToast name={data.name} imageUrl={imagePreview ?? "/fallback-image.jpg"} />
            );
        } catch (error) {
            const msg = handleAxiosError(error);
            toast.error(msg);
        }
    };

    // ------------------------------------
    // RENDER
    // ------------------------------------
    return (
        <div className="flex justify-center bg-[#FCFAF9] min-h-screen">
            <div className="w-[80%] h-full grid lg:grid-cols-10 p-8">
                {/* LEFT INSTRUCTIONS PANEL */}
                <div className="lg:col-span-3 bg-[#CECECE] p-4 flex flex-col items-start text-center rounded shadow">
                    <h2 className="text-4xl font-bold mb-2 self-center">Upute za unos</h2>
                    <img src="/images/recipeImage.png" alt="upute" width="150px" className="self-center" />
                    <h2 className="text-black text-3xl text-left mt-8 mb-4">
                        Unesite sljedeće podatke:
                    </h2>
                    <ul className="list-disc list-inside text-gray-700 text-lg text-left md:text-xl lg:text-2xl">
                        <li>Naziv recepta (obavezno)</li>
                        <li>Slika recepta (obavezno)</li>
                        <li>Video (opcionalno)</li>
                        <li>Vrijeme pripreme (obavezno)</li>
                        <li>Kategorija recepta (obavezno)</li>
                    </ul>
                </div>

                {/* RIGHT FORM PANEL */}
                <div className="lg:col-span-7 bg-[#BAE0FF] p-4 rounded shadow">
                    <h2 className="text-4xl font-bold mb-4 text-center">Unos recepta</h2>
                    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} encType="multipart/form-data">
                        {/* Name */}
                        <FormSection label="Naziv recepta" error={errors.name?.message as string | undefined}>
                            <input
                                type="text"
                                id="name"
                                className="w-full border border-black rounded px-3 py-2"
                                placeholder="Unesi naziv"
                                {...register("name", {
                                    required: "Naziv je obavezan",
                                })}
                            />
                        </FormSection>

                        {/* Image */}
                        <FormSection label="Slika recepta" error={errors.image?.message as string | undefined}>
                            <input
                                type="file"
                                id="image"
                                accept="image/png, image/jpeg, image/jpg"
                                className="w-full border border-black rounded px-3 py-2"
                                {...register("image", {
                                    required: "Slika je obavezna",
                                    onChange: (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setImagePreview(URL.createObjectURL(file));
                                    },
                                })}
                            />
                        </FormSection>

                        {/* Video */}
                        <FormSection label="Video pripreme recepta">
                            <input
                                type="file"
                                id="video"
                                accept="video/mp4, video/webm"
                                className="w-full border border-black rounded px-3 py-2"
                                {...register("video")}
                            />
                        </FormSection>

                        {/* Preparation Time */}
                        <FormSection label="Vrijeme pripreme" error={errors.preparationTime?.message as string | undefined}>
                            <input
                                type="text"
                                id="preparationTime"
                                className="w-full border border-black rounded px-3 py-2"
                                placeholder="Unesi vrijeme pripreme"
                                {...register("preparationTime", { required: "Vrijeme pripreme je obavezno" })}
                            />
                        </FormSection>

                        {/* Category */}
                        <FormSection label="Odaberite kategoriju" error={errors.category?.message as string | undefined}>
                            <Controller
                                control={control}
                                name="category"
                                rules={{ required: "Kategorija je obavezna" }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={options}
                                        value={options.find(opt => opt.value === field.value) || null}
                                        onChange={(option) => field.onChange(option?.value)}
                                        placeholder="Pretraži ili odaberi..."
                                        isClearable
                                        styles={{
                                            container: (base) => ({ ...base, width: "40%", marginBottom: "1rem" }),
                                            control: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isFocused ? "white" : "rgba(255, 255, 255, 0.1)",
                                                borderColor: "black",
                                                borderWidth: "2px",
                                                borderRadius: "0.5rem",
                                                boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
                                                padding: "2px",
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isFocused ? "#E5E5E5" : "white",
                                                color: "black",
                                                padding: "10px",
                                                fontSize: "1.125rem",
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                color: "black",
                                                fontSize: "1.125rem",
                                            }),
                                            placeholder: (base) => ({
                                                ...base,
                                                color: "black",
                                                fontSize: "1.125rem",
                                            }),
                                            input: (base) => ({ ...base, fontSize: "1.125rem", color: "black" }),
                                            dropdownIndicator: (base) => ({ ...base, color: "black" }),
                                            indicatorSeparator: () => ({ display: "none" }),
                                        }}
                                    />
                                )}
                            />
                        </FormSection>

                        {/* Submit Button */}
                        <div className="flex justify-center mb-8 text-lg md:text-xl lg:text-2xl px-10">
                            <button type="submit" className="bg-[#4CAF50] hover:bg-green-500 text-white px-4 py-2 rounded-lg">
                                Spremi recept
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ------------------------------------
// FORM SECTION HELPER COMPONENT
// ------------------------------------
const FormSection = ({
                         label,
                         children,
                         error,
                     }: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) => (
    <div className="mb-8 text-lg md:text-xl lg:text-2xl px-10">
        <label className="block mb-2">{label}</label>
        {children}
        {error && <p className="text-red-500">{error}</p>}
    </div>
);

export default AddRecipe;