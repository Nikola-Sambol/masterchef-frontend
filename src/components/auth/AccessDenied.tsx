import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import React from "react";

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-74px)] bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <div className="text-yellow-500 text-6xl mb-4 flex justify-center">
                    <FaExclamationTriangle />
                </div>
                <h1 className="text-3xl font-bold mb-2">Pristup odbijen</h1>
                <p className="text-gray-600 mb-6">
                    Nemate prava pristupa ovoj stranici.
                </p>
                <button
                    onClick={handleGoHome}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
                >
                    Natrag na početnu stranicu
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;