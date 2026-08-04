// JQube — Outer Layout (TSX)

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function OuterLayout() {
    const { pathname } = useLocation();

    const hideNavbar = ["/login", "/register"].includes(pathname);
    const hideFooter = ["/login", "/register"].includes(pathname);

    return (
        <>
            {!hideNavbar && <Navbar />}

            <main className="min-h-screen">
                <Outlet />
            </main>

            {!hideFooter && <Footer />}
        </>
    );
}