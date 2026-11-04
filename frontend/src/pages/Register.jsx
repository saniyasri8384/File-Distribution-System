
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (loading) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await api.post("/auth/register", {
                name,
                email,
                password
            });

            setSuccess(
                response.data.message ||
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err) {
            console.error("REGISTER ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
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
                    <div className="login-brand-logo">📁</div>

                    <h1>
                        File<span>Flow</span>
                    </h1>

                    <p className="login-brand-description">
                        A smarter way to store and share your files.
                    </p>

                    <div className="login-brand-features">
                        <div><span>✓</span> Create your personal workspace</div>
                        <div><span>✓</span> Share files with permissions</div>
                        <div><span>✓</span> Keep your files organized</div>
                    </div>
                </div>

                <div className="login-card register-card">

                    <div className="login-card-icon">✨</div>

                    <div className="login-card-heading">
                        <h2>Create Account</h2>
                        <p>
                            Join FileFlow and start managing your files.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="register-success" role="status">
                            <span>✓</span>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>

                        <div className="login-input-group">
                            <label htmlFor="register-name">
                                Full Name
                            </label>

                            <input
                                id="register-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError("");
                                }}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label htmlFor="register-email">
                                Email Address
                            </label>

                            <input
                                id="register-email"
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
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="login-password-wrapper">
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="new-password"
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
                            disabled={loading || !!success}
                        >
                            {loading ? (
                                <>
                                    <span className="login-button-spinner"></span>
                                    Creating Account...
                                </>
                            ) : success ? (
                                "Account Created ✓"
                            ) : (
                                <>
                                    Create Account <span>→</span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="login-divider">
                        <span></span>
                        <small>ALREADY REGISTERED?</small>
                        <span></span>
                    </div>

                    <p className="register-text">
                        Already have an account?
                        <Link to="/login"> Sign in</Link>
                    </p>

                    <p className="login-security-note">
                        🔒 Your account is protected by secure authentication.
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Register;
