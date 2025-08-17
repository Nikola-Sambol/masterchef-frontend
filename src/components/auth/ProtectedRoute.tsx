import { useMyContext } from "../../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, adminPage }: { children: React.ReactNode; adminPage?: boolean }) => {
    const { token, isAdmin } = useMyContext();

    if (!token) {
        // provjera da li je logout bio namjeran
        const intentionalLogout = localStorage.getItem("LOGOUT_INTENT") === "true";

        if (!intentionalLogout) {
            toast.error("Niste prijavljeni. Prijavite se da biste mogli pristupiti ovoj stranici.");
            return <Navigate to="/signin" />;

        }

        // makni flag da se ne ponavlja
        localStorage.removeItem("LOGOUT_INTENT");
        return <Navigate to="/" />;
    }

    if (token && adminPage && !isAdmin) {
        return <Navigate to="/access-denied" />;
    }

    return children;
};

export default ProtectedRoute;
