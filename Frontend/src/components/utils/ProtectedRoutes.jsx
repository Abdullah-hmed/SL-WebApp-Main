import { Outlet, Navigate } from "react-router-dom";
import { isAuthenticated } from "./authUtils";

const ProtectedRoutes = () => {
    const isUserAuthenticated = isAuthenticated();
    return isUserAuthenticated ? <Outlet /> : <Navigate to="/auth" />;
}

export default ProtectedRoutes;