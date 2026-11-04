import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Sidebar() {

    const { logout } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUser(response.data.user);

        } catch (error) {

            console.log("USER DETAILS ERROR:", error);

        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="sidebar">

            {/* Logo */}

            <div className="sidebar-logo">

                <div className="sidebar-logo-icon">
                    📁
                </div>

                <div>
                    <h2>FileHub</h2>
                    <span>File Management</span>
                </div>

            </div>


            {/* User Profile */}

            <div className="sidebar-user">

                <div className="user-avatar">
                    {user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : "U"}
                </div>

                <div className="user-info">

                    <strong>
                        {user?.name || "User"}
                    </strong>

                    <span>
                        {user?.email || "Loading..."}
                    </span>

                </div>

            </div>


            {/* Menu */}

            <div className="sidebar-menu">

                <p className="menu-title">
                    MAIN
                </p>

                <NavLink
                    to="/dashboard"
                    className="sidebar-link"
                >
                    📊
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/my-files"
                    className="sidebar-link"
                >
                    📁
                    <span>My Files</span>
                </NavLink>

                <NavLink
                    to="/upload"
                    className="sidebar-link"
                >
                    ⬆️
                    <span>Upload File</span>
                </NavLink>


                <p className="menu-title">
                    SHARING
                </p>

                <NavLink
                    to="/shared-files"
                    className="sidebar-link"
                >
                    🤝
                    <span>Shared With Me</span>
                </NavLink>

                <NavLink
                    to="/shared-by-me"
                    className="sidebar-link"
                >
                    📤
                    <span>Shared By Me</span>
                </NavLink>


                <p className="menu-title">
                    ACTIVITY
                </p>

                <NavLink
                    to="/activity-logs"
                    className="sidebar-link"
                >
                    📝
                    <span>Activity Logs</span>
                </NavLink>

            </div>


            {/* Logout */}

            <div className="sidebar-bottom">

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;