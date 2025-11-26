import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const wallet = useAnchorWallet();

    if (!wallet) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};
