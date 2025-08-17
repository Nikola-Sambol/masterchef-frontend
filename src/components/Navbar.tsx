import {useEffect, useRef, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {BiSolidFoodMenu} from "react-icons/bi";
import {FaRegUserCircle, FaSearch, FaSignInAlt, FaUserPlus} from "react-icons/fa";
import {RiAdminFill} from "react-icons/ri";
import {useMyContext} from "../context/AuthContext.tsx";
import {CgLogOut} from "react-icons/cg";
import {ImProfile} from "react-icons/im";
import {useLogout} from "../utils/Logout.ts";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const {token, currentUser, isAdmin, } = useMyContext();
    const logout = useLogout();

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (search.trim() !== "") {
            navigate(`/allrecipes?q=${encodeURIComponent(search.trim())}`);
            setSearch("");
            setMenuOpen(false); // ako se traži s mobitela
        }
    };



    // Zatvori user dropdown kad se klikne izvan njega
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#4056A1] text-white h-24 px-4 py-4 shadow-md">
            <div className="relative flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center gap-2 text-2xl font-bold">
                    <NavLink to="/">
                        <BiSolidFoodMenu className="text-5xl"/>
                    </NavLink>
                    <NavLink to="/" className="text-3xl hover:underline">
                        Masterchef
                    </NavLink>
                </div>

                {/* Središnji dio: search + link */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-4">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Pretraži recepte..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-1 rounded-full text-white placeholder-white bg-transparent border border-gray-100 focus:outline-none focus:ring-2 focus:ring-white w-64"
                        />
                        <button type="submit">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"/>
                        </button>
                    </form>

                    <NavLink
                        to="/allrecipes"
                        className={({isActive}) =>
                            `text-lg hover:underline ${isActive ? "font-semibold" : ""}`
                        }
                    >
                        Svi recepti
                    </NavLink>
                </div>

                {/* Desna strana: User ikona + dropdown */}
                <div className="flex items-center gap-4">
                    {currentUser && (
                        <h1>{currentUser.name} {currentUser.surname}</h1>
                    )}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="text-white text-3xl focus:outline-none"
                        >
                            <FaRegUserCircle/>
                        </button>

                        {/* Dropdown meni */}
                        {userMenuOpen && (
                            <div
                                className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg py-2 z-50">
                                {!token && (
                                    <div>
                                        <button
                                            onClick={() => {
                                                navigate("/signin");
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            <FaSignInAlt className="text-black"/>
                                            <span>Prijava</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate("/signup");
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            <FaUserPlus className="text-black"/>
                                            <span>Registracija</span>
                                        </button>
                                    </div>
                                )}
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate("/admin")}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <RiAdminFill/>
                                        <span>ADMIN</span>
                                    </button>
                                )}
                                {token && (
                                    <div>
                                        <button
                                            onClick={() => navigate("/useredit")}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            <ImProfile />
                                            <span>Moj Profil</span>
                                        </button>
                                        <button
                                            onClick={() => navigate("/alluserrecipes")}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            <BiSolidFoodMenu/>
                                            <span>Moji Recepti</span>
                                        </button>
                                        <button
                                            onClick={() => logout()}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            <CgLogOut className="text-black"/>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FloatingActionButton-style hamburger meni samo za mobitel */}
            {/* FloatingActionButton-style hamburger meni samo za mobitel */}
            <div className="md:hidden fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
                {/* Floating meni akcije */}
                {menuOpen && (
                    <div className="flex flex-col items-end mb-2 bg-white p-4 rounded-lg shadow-lg w-72">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full mb-3"
                        >
                            <input
                                type="text"
                                placeholder="Pretraži recepte..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-full text-black placeholder-gray-400 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4056A1]"
                            />
                            <button type="submit">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"/>
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                navigate("/allrecipes");
                                setMenuOpen(false);
                            }}
                            className="bg-[#5a6fc1] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#6d80e0] text-sm transition-all duration-200 w-full text-center"
                        >
                            Svi recepti
                        </button>
                    </div>
                )}

                {/* Glavni hamburger gumb */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-14 h-14 rounded-full bg-[#4056A1] text-white flex flex-col justify-center items-center gap-[4px] shadow-lg"
                >
                    <span className="w-6 h-0.5 bg-white"></span>
                    <span className="w-6 h-0.5 bg-white"></span>
                    <span className="w-6 h-0.5 bg-white"></span>
                </button>
            </div>

        </nav>
    );

};

export default Navbar;
