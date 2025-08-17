import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios/api.ts";
import toast from "react-hot-toast";

interface ComponentInput {
    name: string;
    image: FileList;
    ingredients: { value: string }[];
    instructions: string;
}

const AddComponent = () => {
    const { id: recipeId } = useParams();
    const navigate = useNavigate();

    const [components, setComponents] = useState<ComponentInput[]>([]);
    const [showForm, setShowForm] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ComponentInput>({
        defaultValues: {
            name: "",
            image: undefined,
            ingredients: [{ value: "" }],
            instructions: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients",
    });

    const onAddComponent = (data: ComponentInput) => {
        setComponents(prev => [...prev, data]);
        reset(); // reset form
        setShowForm(false);
    };

    const onRemoveComponent = (index: number) => {
        setComponents(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmitAll = async () => {
        const formData = new FormData();

        components.forEach((component, index) => {
            formData.append(`components[${index}][name]`, component.name);
            formData.append(`components[${index}][instructions]`, component.instructions);

            component.ingredients.forEach((ingredient, i) => {
                formData.append(`components[${index}][ingredients][${i}]`, ingredient.value);
            });

            const file = component.image?.[0];
            if (file) {
                formData.append(`components[${index}][image]`, file);
                formData.append(`components[${index}][imageKey]`, file.name);
            }
        });

        try {
            await api.post(`/components/${recipeId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Uspješno dodane komponente!");
        } catch {
            toast.error("Greška prilikom slanja komponente.");
        } finally {
            navigate(`/recipedetails/${recipeId}`);
        }
    };

    return (
        <div className="flex justify-center bg-[#FCFAF9] min-h-screen">
            <div className="w-[80%] h-full grid lg:grid-cols-10 p-8">
                {/* Lijeva strana */}
                <div className="lg:col-span-3 bg-[#CECECE] p-4 flex flex-col items-start text-center rounded shadow">
                    <h2 className="text-4xl font-bold mb-2 self-center">Upute za unos</h2>
                    <img src="/images/recipeImage.png" alt="upute" width="150px" className="self-center" />
                    <h2 className="text-black text-3xl text-left mt-8 mb-4">
                        Unesite 1 ili više komponenti:
                    </h2>

                    <ul className="list-disc list-inside text-black text-lg text-left justify-self-start pb-10 md:text-xl lg:text-2xl">
                        <li>Naziv komponente (obavezno)</li>
                        <li>Slika komponente (opcionalno)</li>
                        <li>Sastojci (obavezan 1 sastojak)</li>
                        <li>Instrukcije (obavezno)</li>
                    </ul>
                </div>

                {/* Desna strana */}
                <div className="lg:col-span-7 bg-[#BAE0FF] p-4 rounded shadow flex flex-col justify-between min-h-[80vh]">
                    {components.length > 0 && (
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-center">Komponente</h2>
                            <ol className="list-decimal list-inside text-black text-lg text-left font-semibold justify-self-start pb-10 md:text-xl lg:text-3xl">
                                {components.map((component, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        {component.name}
                                        <button
                                            type="button"
                                            onClick={() => onRemoveComponent(index)}
                                            className="ml-4 bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                                        >
                                            Obriši
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {!showForm ? (
                        <div className="flex flex-col justify-start mb-8 text-lg md:text-xl lg:text-2xl px-10 self-start">
                            {components.length === 0 && (
                                <h2 className="text-black text-3xl mt-8 mb-4">
                                    Ovaj recept još nema komponenti.
                                </h2>
                            )}
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-green-500 hover:bg-green-700 max-w-[fit-content] text-white px-4 py-2 rounded-lg"
                            >
                                Dodaj Komponentu
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onAddComponent)}>
                            <h2 className="text-4xl font-bold mb-4 text-center">Unos Komponente</h2>

                            {/* Naziv */}
                            <div className="mb-8 text-lg md:text-xl lg:text-2xl px-10">
                                <label className="block mb-2">Naziv komponente</label>
                                <input
                                    {...register("name", { required: true, minLength: 3 })}
                                    className="w-full border border-black rounded px-3 py-2"
                                    placeholder="Unesi naziv"
                                />
                                {errors.name && <p className="text-red-600">Naziv mora biti dulji od 3 znaka</p>}
                            </div>

                            {/* Slika */}
                            <div className="mb-8 text-lg md:text-xl lg:text-2xl px-10">
                                <label className="block mb-2">Slika komponente (opcionalno)</label>
                                <input
                                    type="file"
                                    {...register("image")}
                                    className="w-full border border-black rounded px-3 py-2"
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                            </div>

                            {/* Sastojci */}
                            <div className="mb-8 text-lg md:text-xl lg:text-2xl px-10">
                                <h3 className="mb-2">Sastojci:</h3>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="mb-4 flex items-center gap-2">
                                        <input
                                            {...register(`ingredients.${index}.value`, { required: true })}
                                            className="w-full border border-black rounded px-3 py-2"
                                            placeholder={`Sastojak ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                                            disabled={fields.length === 1} // uvijek barem 1 sastojak
                                        >
                                            X
                                        </button>
                                        {errors.ingredients?.[index]?.value && (
                                            <p className="text-red-600">Naziv sastojka je obavezan</p>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => append({ value: "" })}
                                    className="bg-indigo-500 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mt-2"
                                >
                                    Dodaj Sastojak
                                </button>
                            </div>

                            {/* Instrukcije */}
                            <div className="mb-8 text-lg md:text-xl lg:text-2xl px-10">
                                <label className="block mb-2">Instrukcije</label>
                                <textarea
                                    {...register("instructions", { required: true, minLength: 10 })}
                                    className="w-full border border-black rounded px-3 py-2"
                                    placeholder="Upute"
                                />
                                {errors.instructions && (
                                    <p className="text-red-600">Instrukcije moraju biti dulje od 10 znakova</p>
                                )}
                            </div>

                            {/* Gumbi */}
                            <div className="flex justify-center mb-8 text-lg md:text-xl lg:text-2xl px-10">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 mx-4 py-2 rounded-lg"
                                >
                                    Spremi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-[#E30C37] hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Odustani
                                </button>
                            </div>
                        </form>
                    )}

                    {components.length > 0 && !showForm && (
                        <div className="mt-auto px-10 pt-4 text-lg md:text-xl lg:text-2xl flex justify-center">
                            <button
                                type="button"
                                onClick={onSubmitAll}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                            >
                                Spremi Komponente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddComponent;
