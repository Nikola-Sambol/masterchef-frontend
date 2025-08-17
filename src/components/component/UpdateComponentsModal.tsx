import { useEffect, useState } from "react";
import api from "../../axios/api.ts";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaRegSadTear } from "react-icons/fa";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";

interface ComponentData {
    id: number;
    componentName: string;
    image: File | null;
    imagePath: string | null;
    ingredients: string;
    instruction: string;
    ingredientsArray: string[];
    deleteImage?: boolean;
}

interface Props {
    onClose: () => void;
}

const UpdateComponentsModal = ({ onClose }: Props) => {
    const { id: recipeId } = useParams();
    const navigate = useNavigate();
    const [components, setComponents] = useState<ComponentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const {  handleSubmit } = useForm();

    useEffect(() => {
        const fetchComponents = async () => {
            try {
                const res = await api.get(`/components/public/${recipeId}`);
                const data = Array.isArray(res.data) ? res.data : [res.data];

                const formatted = data.map((comp: ComponentData) => ({
                    ...comp,
                    image: null,
                    deleteImage: false,
                    ingredientsArray: comp.ingredients
                        ? comp.ingredients.split(",").map((i: string) => i.trim()).filter(Boolean)
                        : [],
                }));

                setComponents(formatted);
            } catch {
                toast.error("Greška pri dohvaćanju komponenti.");
            } finally {
                setLoading(false);
            }
        };

        fetchComponents();
    }, [recipeId]);

    const handleInputChange = (index: number, field: keyof ComponentData, value: string) => {
        const updated = [...components];
        (updated[index][field] as string) = value;
        setComponents(updated);
    };

    const handleIngredientChange = (compIndex: number, ingrIndex: number, value: string) => {
        const updated = [...components];
        updated[compIndex].ingredientsArray[ingrIndex] = value;
        updated[compIndex].ingredients = updated[compIndex].ingredientsArray.join(", ");
        setComponents(updated);
    };

    const handleAddIngredient = (compIndex: number) => {
        const updated = [...components];
        updated[compIndex].ingredientsArray.push("");
        setComponents(updated);
    };

    const handleRemoveIngredient = (compIndex: number, ingrIndex: number) => {
        if (components[compIndex].ingredientsArray.length === 1) {
            toast.error("Komponenta mora imati barem jedan sastojak.");
            return;
        }
        const updated = [...components];
        updated[compIndex].ingredientsArray.splice(ingrIndex, 1);
        updated[compIndex].ingredients = updated[compIndex].ingredientsArray.join(", ");
        setComponents(updated);
    };

    const handleFileChange = (index: number, file: File | null) => {
        const updated = [...components];
        updated[index].image = file;
        updated[index].deleteImage = false;
        setComponents(updated);
    };

    const handleRemoveImage = (index: number) => {
        const updated = [...components];
        updated[index].imagePath = null;
        updated[index].deleteImage = true;
        updated[index].image = null;
        setComponents(updated);
    };

    const handleRemoveComponent = async (index: number) => {
        if (components.length === 1) {
            toast.error("Mora postojati barem jedna komponenta.");
            return;
        }

        const compId = components[index].id;

        try {
            await api.delete(`/components/delete/${compId}`);
            const updated = [...components];
            updated.splice(index, 1);
            setComponents(updated);
            toast.success("Komponenta uspješno uklonjena!");
        } catch (err) {
            toast.error("Greška pri brisanju komponente.");
            console.error(err);
        }
    };

    const handleAddComponent = () => {
        const newComponent: ComponentData = {
            id: Date.now(),
            componentName: "",
            image: null,
            imagePath: null,
            ingredients: "",
            instruction: "",
            ingredientsArray: [""],
            deleteImage: false
        };
        setComponents([...components, newComponent]);
    };

    const validateComponents = () => {
        const newErrors: { [key: string]: string } = {};
        components.forEach((comp, ci) => {
            if (!comp.componentName.trim()) newErrors[`name-${ci}`] = "Naziv komponente je obavezan.";
            if (!comp.instruction.trim()) newErrors[`instr-${ci}`] = "Instrukcije su obavezne.";
            else if (comp.instruction.trim().length < 10) {
                newErrors[`instr-${ci}`] = "Instrukcije moraju imati minimalno 10 znakova.";
            }
            comp.ingredientsArray.forEach((ingr, ii) => {
                if (!ingr.trim()) newErrors[`ingr-${ci}-${ii}`] = "Sastojak je obavezan.";
            });
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async () => {
        if (!validateComponents()) {
            toast.error("Popunite sve obavezne podatke.");
            return;
        }

        const formData = new FormData();
        components.forEach((comp, index) => {
            formData.append(`components[${index}][name]`, comp.componentName);
            formData.append(`components[${index}][instructions]`, comp.instruction);
            comp.ingredientsArray.forEach((ing, i) =>
                formData.append(`components[${index}][ingredients][${i}]`, ing)
            );
            if (comp.image) {
                formData.append(`components[${index}][image]`, comp.image);
                formData.append(`components[${index}][imageKey]`, comp.image.name);
            } else if (comp.deleteImage) {
                formData.append(`components[${index}][imageKey]`, "true");
            }
            if (comp.deleteImage) {
                formData.append(`components[${index}][deleteImage]`, "true");
            }
        });

        try {
            await api.post(`/components/update/${recipeId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Komponente uspješno ažurirane!");
            onClose();
        } catch {
            toast.error("Greška prilikom ažuriranja komponenti.");
        }
    };

    if (loading) return <div>Učitavanje...</div>;

    if (!components.length) {
        return (
            <div className="p-8 text-center">
                <FaRegSadTear className="text-6xl text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">Izgleda da ovaj recept još nema nijednu komponentu.</p>
                <button
                    onClick={() => navigate(`/recipe/${recipeId}/addcomponent`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow"
                >
                    Dodaj komponentu
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Ažuriraj Komponente</h2>
            {components.map((comp, compIndex) => (
                <div key={comp.id} className="mb-10 border-b pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block font-semibold">Naziv komponente</label>
                        <button
                            type="button"
                            onClick={() => handleRemoveComponent(compIndex)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Ukloni komponentu
                        </button>
                    </div>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        value={comp.componentName}
                        onChange={(e) => handleInputChange(compIndex, "componentName", e.target.value)}
                    />
                    {errors[`name-${compIndex}`] && (
                        <p className="text-red-500 text-sm mb-3">{errors[`name-${compIndex}`]}</p>
                    )}

                    <label className="block font-semibold mb-1">Slika (opcionalno)</label>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => handleFileChange(compIndex, e.target.files?.[0] || null)}
                        className="mb-2"
                    />
                    {comp.imagePath && !comp.deleteImage && (
                        <div className="mb-4">
                            <img
                                src={`data:image/png;base64,${comp.imagePath}`}
                                alt="Trenutna slika"
                                className="w-32 h-auto rounded mb-2"
                            />
                            <button
                                type="button"
                                className="bg-red-500 text-white px-3 py-1 rounded"
                                onClick={() => handleRemoveImage(compIndex)}
                            >
                                Obriši sliku
                            </button>
                        </div>
                    )}
                    {comp.deleteImage && <p className="text-red-600 mb-4">Slika će biti obrisana.</p>}

                    <label className="block font-semibold mb-1">Sastojci</label>
                    {comp.ingredientsArray.map((ingr, ingrIndex) => (
                        <div key={ingrIndex} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={ingr}
                                onChange={(e) => handleIngredientChange(compIndex, ingrIndex, e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                            />
                            {errors[`ingr-${compIndex}-${ingrIndex}`] && (
                                <p className="text-red-500 text-sm mb-3">{errors[`ingr-${compIndex}-${ingrIndex}`]}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemoveIngredient(compIndex, ingrIndex)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                -
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddIngredient(compIndex)}
                        className="bg-green-500 text-white px-3 py-1 rounded mb-4"
                    >
                        Dodaj sastojak
                    </button>

                    <label className="block font-semibold mb-1">Instrukcije</label>
                    <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={comp.instruction}
                        onChange={(e) => handleInputChange(compIndex, "instruction", e.target.value)}
                    />
                    {errors[`instr-${compIndex}`] && (
                        <p className="text-red-500 text-sm mb-3">{errors[`instr-${compIndex}`]}</p>
                    )}
                </div>
            ))}

            <div className="flex justify-between items-center mt-6">
                <button
                    type="button"
                    onClick={handleAddComponent}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Dodaj novu komponentu
                </button>
                <div className="flex gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                        Odustani
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Spremi komponente
                    </button>
                </div>
            </div>
        </form>
    );
};

export default UpdateComponentsModal;