
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ShareFile() {
    const { fileId } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [permission, setPermission] = useState("download");
    const [expiresAt, setExpiresAt] = useState("");
    const [sharing, setSharing] = useState(false);

    const handleShare = async (e) => {
        e.preventDefault();

        const recipientEmail = email.trim();

        if (!recipientEmail) {
            alert("Please enter the recipient's email.");
            return;
        }

        if (expiresAt && new Date(expiresAt) <= new Date()) {
            alert("Expiry date must be in the future.");
            return;
        }

        try {
            setSharing(true);

            const token = localStorage.getItem("token");

            await api.post(
                "/files/share",
                {
                    fileId,
                    email: recipientEmail,
                    permission,
                    expiresAt: expiresAt || null
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("File shared successfully!");
            navigate("/my-files");
        } catch (error) {
            console.error("SHARE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "File sharing failed. Please try again."
            );
        } finally {
            setSharing(false);
        }
    };

    return (
        <main className="share-page">
            <section className="share-card">
                <div className="share-heading">
                    <div className="share-icon-large">🤝</div>

                    <span className="dashboard-eyebrow">
                        FILE SHARING
                    </span>

                    <h1>Share a File</h1>

                    <p className="share-subtitle">
                        Give someone secure access to your document.
                    </p>
                </div>

                <form onSubmit={handleShare}>
                    <div className="share-input-group">
                        <label htmlFor="recipient-email">
                            Recipient's Email
                        </label>

                        <input
                            id="recipient-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={sharing}
                        />

                        <span className="share-field-hint">
                            Enter the registered email address of the recipient.
                        </span>
                    </div>

                    <div className="share-input-group">
                        <label htmlFor="permission">
                            Access Permission
                        </label>

                        <select
                            id="permission"
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            disabled={sharing}
                        >
                            <option value="download">
                                View and Download
                            </option>

                            <option value="view">
                                View Only
                            </option>
                        </select>
                    </div>

                    <div className="share-input-group">
                        <label htmlFor="expiry-date">
                            Access Expiry
                            <span className="optional-text">Optional</span>
                        </label>

                        <input
                            id="expiry-date"
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            disabled={sharing}
                        />

                        <span className="share-field-hint">
                            Leave empty if access should not have a scheduled expiry.
                        </span>
                    </div>

                    <div className={`permission-info ${
                        permission === "download"
                            ? "download-permission"
                            : "view-permission"
                    }`}>
                        <div className="permission-info-icon">
                            {permission === "download" ? "⬇️" : "👁️"}
                        </div>

                        <div>
                            <strong>
                                {permission === "download"
                                    ? "View and Download Access"
                                    : "View-Only Access"}
                            </strong>

                            <p>
                                {permission === "download"
                                    ? "The recipient can view and download the shared file."
                                    : "The recipient can view the file but cannot download it."
                                }
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="share-submit-button"
                        disabled={sharing}
                    >
                        {sharing ? "Sharing File..." : "🤝 Share File"}
                    </button>
                </form>

                <button
                    type="button"
                    className="share-back-button"
                    onClick={() => navigate("/my-files")}
                    disabled={sharing}
                >
                    ← Back to My Files
                </button>
            </section>
        </main>
    );
}

export default ShareFile;
