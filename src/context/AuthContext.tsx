import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "../axios/api.ts";
import toast from "react-hot-toast";

type User = {
    id: number;
    email: string;
    role: string[];
    enabled: boolean;
    name: string;
    surname: string;
    // možeš dodati ostala polja koja koristiš iz usera
};

type AuthContextType = {
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    currentUser: User | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    isAdmin: boolean;
    setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ContextProviderProps = {
    children: ReactNode;
};

export const ContextProvider = ({ children }: ContextProviderProps) => {
    // get token and isAdmin from localStorage (parsed properly)
    const storedToken = localStorage.getItem("JWT_TOKEN");
    const getToken = storedToken ? storedToken : null;

    const storedIsAdmin = localStorage.getItem("IS_ADMIN");
    const isAdminStored = storedIsAdmin === "true";

    const [token, setToken] = useState<string | null>(getToken);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(isAdminStored);

    const fetchUser = async () => {
        const userString = localStorage.getItem("USER");
        const user: User | null = userString ? JSON.parse(userString) : null;

        if (user?.email) {
            try {
                const { data } = await api.get<User>("/auth/user");
                setCurrentUser(data);

                if (data.role.includes("ROLE_ADMIN")) {
                    localStorage.setItem("IS_ADMIN", "true");
                    setIsAdmin(true);
                } else {
                    localStorage.removeItem("IS_ADMIN");
                    setIsAdmin(false);
                }
            } catch {
                toast.error("Error fetching current user");
            }
        }
    };

    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                token,
                setToken,
                currentUser,
                setCurrentUser,
                isAdmin,
                setIsAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook za lakši pristup contextu s provjerom da nije undefined
export const useMyContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useMyContext must be used within a ContextProvider");
    }
    return context;
};