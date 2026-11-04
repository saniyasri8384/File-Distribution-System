
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function SharedFiles() {
    const [sharedFiles, setSharedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);

    const navigate = useNavigate();

    const fetchSharedFiles = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/files/shared-with-me",
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

            setSharedFiles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("SHARED FILES ERROR:", error);
            setError(
                error.response?.data?.message ||
                "Unable to load shared files. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSharedFiles();
    }, [fetchSharedFiles]);

    const handleDownload = async (fileId, fileName) => {
        try {
            setDownloadingId(fileId);

            const token = localStorage.getItem("token");

            const response = await api.get(
                `/files/download/${fileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName || "shared-file";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("SHARED DOWNLOAD ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Download failed. You may not have download permission."
            );
        } finally {
            setDownloadingId(null);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === undefined || bytes === null) return "—";
        if (bytes === 0) return "0 Bytes";

        const units = ["Bytes", "KB", "MB", "GB"];
        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

        return parsedDate.toLocaleString();
    };

    const getFileIcon = (file) => {
        const type = file?.mimeType || "";
        const name = file?.originalName || "";

        if (type.includes("pdf") || name.endsWith(".pdf")) return "📕";
        if (type.includes("image")) return "🖼️";
        if (type.includes("video")) return "🎬";
        if (type.includes("audio")) return "🎵";
        if (type.includes("word") || name.endsWith(".docx")) return "📝";
        if (type.includes("spreadsheet") || name.endsWith(".xlsx")) return "📊";

        return "📄";
    };

    return (
        <main className="shared-files-page">
            <div className="shared-files-header">
                <div>
                    <span className="dashboard-eyebrow">
                        FILE ACCESS
                    </span>

                    <h1>Shared With Me</h1>

                    <p>
                        Files that other users have shared with you.
                    </p>
                </div>

                <button
                    className="shared-refresh-button"
                    onClick={fetchSharedFiles}
                    disabled={loading}
                >
                    ↻ {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="shared-files-summary">
                <div className="shared-summary-icon">📂</div>

                <div>
                    <strong>{sharedFiles.length}</strong>
                    <span>Shared {sharedFiles.length === 1 ? "file" : "files"}</span>
                </div>
            </div>

            {loading ? (
                <div className="shared-state-card">
                    <div className="loading-spinner"></div>
                    <p>Loading shared files...</p>
                </div>
            ) : error ? (
                <div className="shared-state-card">
                    <div className="shared-empty-icon">⚠️</div>
                    <h3>Couldn't load shared files</h3>
                    <p>{error}</p>

                    <button
                        className="shared-primary-button"
                        onClick={fetchSharedFiles}
                    >
                        Try Again
                    </button>
                </div>
            ) : sharedFiles.length === 0 ? (
                <div className="shared-state-card">
                    <div className="shared-empty-icon">📭</div>
                    <h3>No shared files yet</h3>
                    <p>
                        When someone shares a file with you, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="shared-files-grid">
                    {sharedFiles.map((share) => {
                        const file = share.file;
                        const fileId = file?._id;
                        const canDownload = share.permission === "download";

                        return (
                            <article
                                className="shared-file-card"
                                key={share._id}
                            >
                                <div className="shared-file-card-top">
                                    <div className="shared-file-icon">
                                        {getFileIcon(file)}
                                    </div>

                                    <span className={`shared-permission-badge ${
                                        canDownload ? "permission-download" : "permission-view"
                                    }`}>
                                        {canDownload ? "Download access" : "View only"}
                                    </span>
                                </div>

                                <h3 className="shared-file-name">
                                    {file?.originalName || "Unknown file"}
                                </h3>

                                <div className="shared-file-details">
                                    <div>
                                        <span>Shared by</span>
                                        <strong>
                                            {share.sharedBy?.email ||
                                                share.sharedBy?.name ||
                                                "Unknown user"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>File size</span>
                                        <strong>{formatBytes(file?.size)}</strong>
                                    </div>

                                    <div>
                                        <span>Expires</span>
                                        <strong>
                                            {share.expiresAt
                                                ? formatDate(share.expiresAt)
                                                : "No expiry"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="shared-file-actions">
                                    <button
                                        className="shared-view-button"
                                        disabled={!fileId}
                                        onClick={() =>
                                            navigate(`/view/${fileId}`)
                                        }
                                    >
                                        👁 View
                                    </button>

                                    {canDownload && (
                                        <button
                                            className="shared-download-button"
                                            disabled={!fileId || downloadingId === fileId}
                                            onClick={() =>
                                                handleDownload(
                                                    fileId,
                                                    file?.originalName
                                                )
                                            }
                                        >
                                            {downloadingId === fileId
                                                ? "Downloading..."
                                                : "⬇ Download"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default SharedFiles;
