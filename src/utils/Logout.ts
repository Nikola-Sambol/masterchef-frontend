import { useMyContext } from "../context/AuthContext"; // prilagodi putanju
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const { setToken, setCurrentUser, setIsAdmin } = useMyContext();
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("USER");
        localStorage.removeItem("JWT_TOKEN");
        localStorage.removeItem("IS_ADMIN");

        // označimo da je user svjesno kliknuo logout
        localStorage.setItem("LOGOUT_INTENT", "true");

        setToken(null);
        setCurrentUser(null);
        setIsAdmin(false);

        navigate("/");
    };

    return logout;
};
