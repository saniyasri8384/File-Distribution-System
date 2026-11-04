
import { useEffect, useState } from "react";
import api from "../services/api";

function SharedByMe() {
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [revokingId, setRevokingId] = useState(null);

    const fetchShares = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/files/shared-by-me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                response.data.shares ||
                response.data.files ||
                [];

            setShares(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("SHARED BY ME ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load your shared files. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShares();
    }, []);

    const handlePermissionChange = async (shareId, newPermission) => {
        const share = shares.find((item) => item._id === shareId);

        if (!share || share.permission === newPermission) return;

        const confirmed = window.confirm(
            `Change this user's access to ${
                newPermission === "download" ? "View and Download" : "View Only"
            }?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(shareId);

            const token = localStorage.getItem("token");

            await api.patch(
                `/files/change-permission/${shareId}`,
                {
                    permission: newPermission
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchShares();
            alert("Permission changed successfully!");
        } catch (error) {
            console.error("PERMISSION ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to change permission."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRevoke = async (shareId) => {
        const confirmed = window.confirm(
            "Are you sure you want to revoke this share? The recipient will lose access to this file."
        );

        if (!confirmed) return;

        try {
            setRevokingId(shareId);

            const token = localStorage.getItem("token");

            await api.delete(
                `/files/revoke-share/${shareId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchShares();
            alert("Share revoked successfully!");
        } catch (error) {
            console.error("REVOKE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to revoke share."
            );
        } finally {
            setRevokingId(null);
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType === "application/pdf") return "📕";
        if (mimeType?.startsWith("image/")) return "🖼️";
        if (mimeType?.startsWith("video/")) return "🎬";
        if (mimeType?.startsWith("audio/")) return "🎵";
        if (mimeType?.startsWith("text/")) return "📄";
        if (mimeType?.includes("spreadsheet")) return "📊";
        if (mimeType?.includes("word")) return "📝";

        return "📁";
    };

    const formatDate = (date) => {
        if (!date) return "No expiry";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

        return parsedDate.toLocaleString();
    };

    const filteredShares = shares.filter((share) => {
        const fileName = share.file?.originalName || "";
        const recipient =
            share.sharedWith?.email ||
            share.sharedWith?.name ||
            "";

        const query = search.trim().toLowerCase();

        return (
            fileName.toLowerCase().includes(query) ||
            recipient.toLowerCase().includes(query)
        );
    });

    return (
        <main className="shared-by-me-page">
            <div className="shared-by-me-header">
                <div>
                    <span className="dashboard-eyebrow">
                        ACCESS MANAGEMENT
                    </span>

                    <h1>Shared By Me</h1>

                    <p>
                        Manage permissions and access to the files you've shared.
                    </p>
                </div>

                <button
                    className="shared-by-me-refresh"
                    onClick={fetchShares}
                    disabled={loading}
                >
                    ↻ {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="shared-by-me-stats">
                <div className="shared-by-me-stat-icon">📤</div>
                <div>
                    <strong>{shares.length}</strong>
                    <span>Total active shares</span>
                </div>
            </div>

            <div className="shared-by-me-toolbar">
                <div className="shared-by-me-search">
                    <span>⌕</span>
                    <input
                        type="search"
                        placeholder="Search by file name or recipient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <span className="shared-by-me-count">
                    {filteredShares.length} result
                    {filteredShares.length !== 1 ? "s" : ""}
                </span>
            </div>

            {loading ? (
                <div className="shared-by-me-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your shared files...</p>
                </div>
            ) : error ? (
                <div className="shared-by-me-state">
                    <div className="shared-by-me-empty-icon">⚠️</div>
                    <h3>Unable to load shares</h3>
                    <p>{error}</p>
                    <button
                        className="shared-by-me-primary-button"
                        onClick={fetchShares}
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredShares.length === 0 ? (
                <div className="shared-by-me-state">
                    <div className="shared-by-me-empty-icon">
                        {shares.length === 0 ? "📤" : "🔎"}
                    </div>

                    <h3>
                        {shares.length === 0
                            ? "No shared files yet"
                            : "No matching shares"}
                    </h3>

                    <p>
                        {shares.length === 0
                            ? "Files you share with other users will appear here."
                            : "Try searching with a different filename or email address."
                        }
                    </p>
                </div>
            ) : (
                <div className="shared-by-me-table-card">
                    <div className="shared-by-me-table-wrapper">
                        <table className="shared-by-me-table">
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Shared With</th>
                                    <th>Permission</th>
                                    <th>Expiry</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredShares.map((share) => {
                                    const file = share.file;
                                    const user = share.sharedWith;

                                    return (
                                        <tr key={share._id}>
                                            <td>
                                                <div className="shared-by-me-file">
                                                    <div className="shared-by-me-file-icon">
                                                        {getFileIcon(file?.mimeType)}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {file?.originalName || "Unknown file"}
                                                        </strong>
                                                        <span>
                                                            {file?.mimeType || "File type unavailable"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="shared-by-me-recipient">
                                                {user?.email ||
                                                    user?.name ||
                                                    "Unknown user"}
                                            </td>

                                            <td>
                                                <select
                                                    className="shared-by-me-permission"
                                                    value={share.permission || "view"}
                                                    disabled={
                                                        updatingId === share._id ||
                                                        revokingId === share._id
                                                    }
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            share._id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="download">
                                                        View & Download
                                                    </option>

                                                    <option value="view">
                                                        View Only
                                                    </option>
                                                </select>

                                                {updatingId === share._id && (
                                                    <span className="shared-by-me-inline-status">
                                                        Updating...
                                                    </span>
                                                )}
                                            </td>

                                            <td className="shared-by-me-expiry">
                                                {formatDate(share.expiresAt)}
                                            </td>

                                            <td>
                                                <button
                                                    className="shared-by-me-revoke"
                                                    disabled={
                                                        revokingId === share._id ||
                                                        updatingId === share._id
                                                    }
                                                    onClick={() =>
                                                        handleRevoke(share._id)
                                                    }
                                                >
                                                    {revokingId === share._id
                                                        ? "Revoking..."
                                                        : "Revoke"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}

export default SharedByMe;
