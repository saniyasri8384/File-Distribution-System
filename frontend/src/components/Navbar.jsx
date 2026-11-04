
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        !isAuthenticated
    ) {
        return null;
    }

    const navLinks = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "My Files", path: "/my-files" },
        { name: "Upload", path: "/upload" },
        { name: "Shared Files", path: "/shared-files" },
        { name: "Shared By Me", path: "/shared-by-me" },
        { name: "Activity Logs", path: "/activity-logs" }
    ];

    return (
        <nav className="main-navbar">

            <div className="navbar-container">

                <NavLink to="/dashboard" className="navbar-brand">
                    <span className="navbar-logo">📁</span>
                    <span>
                        File<span className="brand-highlight">Flow</span>
                    </span>
                </NavLink>

                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `navbar-link ${isActive ? "active" : ""}`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                <button
                    className="navbar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;
