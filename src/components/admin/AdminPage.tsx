import { useState } from "react";
import { FaUsers, FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BiSolidCategoryAlt } from "react-icons/bi";

const AdminPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const isRootAdminPage = location.pathname === "/admin";

    return (
        <div className="flex min-h-screen bg-[#FCFAF9]">
            {/* Sidebar */}
            <div
                className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 transition-transform duration-200 ease-in-out 
                    ${sidebarOpen ? "block" : "hidden"} 
                    md:block`}
            >
                <div className="flex justify-between items-center px-4">
                    <h2 className="text-2xl font-semibold">Admin Panel</h2>
                    <button
                        className="md:hidden text-2xl"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <IoMdClose />
                    </button>
                </div>
                <nav className="mt-6">
                    <Link
                        to="users"
                        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            <FaUsers /> <span>Svi korisnici</span>
                        </div>
                    </Link>
                    <Link
                        to="categories"
                        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            <BiSolidCategoryAlt /> <span>Kategorije Recepata</span>
                        </div>
                    </Link>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 md:p-8">
                {/* Sidebar toggle button on small screens */}
                <button
                    className="md:hidden mb-4 text-xl"
                    onClick={() => setSidebarOpen(true)}
                >
                    <FaBars />
                </button>

                {isRootAdminPage ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">👋 Dobrodošli u Admin Panel</h1>
                        <p className="text-lg text-gray-600 max-w-xl">
                            Ovdje možete upravljati korisnicima, kategorijama recepata i ostalim postavkama sustava.
                            Koristite izbornik s lijeve strane za navigaciju.
                        </p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
};

export default AdminPage;
