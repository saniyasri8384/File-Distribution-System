
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (loading) return;

        try {
            setLoading(true);
            setError("");

            const response = await api.post("/auth/login", {
                email,
                password
            });

            if (!response.data.token) {
                throw new Error("Login response did not contain a token.");
            }

            login(response.data.token);
            navigate("/dashboard");

        } catch (err) {
            console.error("LOGIN ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-background-shape login-shape-one"></div>
            <div className="login-background-shape login-shape-two"></div>
            <div className="login-background-shape login-shape-three"></div>

            <div className="login-layout">

                <div className="login-brand-section">
                    <div className="login-brand-logo">
                        📁
                    </div>

                    <h1>
                        File<span>Flow</span>
                    </h1>

                    <p className="login-brand-description">
                        Your files. Your space. Your control.
                    </p>

                    <div className="login-brand-features">
                        <div>
                            <span>✓</span>
                            Secure file storage
                        </div>
                        <div>
                            <span>✓</span>
                            Easy file sharing
                        </div>
                        <div>
                            <span>✓</span>
                            Manage everything in one place
                        </div>
                    </div>
                </div>

                <div className="login-card">

                    <div className="login-card-icon">👋</div>

                    <div className="login-card-heading">
                        <h2>Welcome Back</h2>
                        <p>
                            Sign in to continue to your FileFlow account.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        <div className="login-input-group">
                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <div className="login-password-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="login-button-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <span>→</span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="login-divider">
                        <span></span>
                        <small>NEW TO FILEFLOW?</small>
                        <span></span>
                    </div>

                    <p className="register-text">
                        Don't have an account?
                        <Link to="/register"> Create an account</Link>
                    </p>

                    <p className="login-security-note">
                        🔒 Your account is protected by secure authentication.
                    </p>

                </div>
            </div>

        </div>
    );
}

export default Login;
