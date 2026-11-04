
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function FileDetails() {
    const { fileId } = useParams();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFileDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                `/files/details/${fileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setFile(response.data.file || response.data);
        } catch (error) {
            console.error("FILE DETAILS ERROR:", error);

            setFile(null);
            setError(
                error.response?.data?.message ||
                "Unable to load file details. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [fileId]);

    useEffect(() => {
        fetchFileDetails();
    }, [fetchFileDetails]);

    const formatBytes = (bytes) => {
        if (bytes == null || bytes === 0) return "0 Bytes";

        const units = ["Bytes", "KB", "MB", "GB", "TB"];
        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        return `${parseFloat(
            (bytes / Math.pow(1024, index)).toFixed(2)
        )} ${units[index]}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "-";

        return parsedDate.toLocaleString();
    };

    const getFileIcon = (mimeType = "") => {
        if (mimeType === "application/pdf") return "📕";
        if (mimeType.startsWith("image/")) return "🖼️";
        if (mimeType.startsWith("text/")) return "📄";

        if (
            mimeType.includes("word") ||
            mimeType.includes("document")
        ) {
            return "📝";
        }

        if (
            mimeType.includes("zip") ||
            mimeType.includes("compressed")
        ) {
            return "🗜️";
        }

        if (
            mimeType.includes("spreadsheet") ||
            mimeType.includes("excel")
        ) {
            return "📊";
        }

        return "📁";
    };

    if (loading) {
        return (
            <div className="file-details-page">
                <div className="file-details-state">
                    <div className="details-spinner"></div>
                    <h2>Loading file details</h2>
                    <p>Please wait while we retrieve your file information.</p>
                </div>
            </div>
        );
    }

    if (error || !file) {
        return (
            <div className="file-details-page">
                <div className="file-details-state">
                    <div className="details-state-icon">📂</div>
                    <h2>{error ? "Unable to load file" : "File not found"}</h2>
                    <p>
                        {error ||
                            "The requested file could not be found."}
                    </p>

                    <div className="details-state-actions">
                        <button
                            className="details-primary-btn"
                            onClick={fetchFileDetails}
                        >
                            Try Again
                        </button>

                        <button
                            className="details-secondary-btn"
                            onClick={() => navigate("/my-files")}
                        >
                            Back to My Files
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const details = [
        {
            label: "File Name",
            value: file.originalName || "-",
            icon: "📄"
        },
        {
            label: "File Type",
            value: file.mimeType || "-",
            icon: "🏷️"
        },
        {
            label: "File Size",
            value: formatBytes(file.size),
            icon: "💾"
        },
        {
            label: "Uploaded On",
            value: formatDate(file.createdAt),
            icon: "📅"
        },
        {
            label: "Updated On",
            value: formatDate(file.updatedAt),
            icon: "🔄"
        }
    ];

    return (
        <div className="file-details-page">
            <div className="file-details-container">

                <button
                    className="details-back-btn"
                    onClick={() => navigate("/my-files")}
                >
                    <span>←</span> Back to My Files
                </button>

                <div className="file-details-heading">
                    <div>
                        <span className="details-eyebrow">
                            FILE INFORMATION
                        </span>
                        <h1>File Details</h1>
                        <p>
                            View the information and properties of your file.
                        </p>
                    </div>
                </div>

                <section className="file-details-card">

                    <div className="details-file-header">
                        <div className="details-file-icon">
                            {getFileIcon(file.mimeType)}
                        </div>

                        <div className="details-file-heading">
                            <h2>{file.originalName || "Untitled file"}</h2>
                            <p>
                                {file.mimeType || "Unknown file type"}
                            </p>
                        </div>

                        <span className="details-file-status">
                            Available
                        </span>
                    </div>

                    <div className="details-section-heading">
                        <h3>File Properties</h3>
                        <p>Basic information about this file</p>
                    </div>

                    <div className="details-grid">
                        {details.map((item) => (
                            <div
                                className="details-info-item"
                                key={item.label}
                            >
                                <div className="details-info-icon">
                                    {item.icon}
                                </div>

                                <div className="details-info-content">
                                    <span>{item.label}</span>
                                    <strong>{item.value}</strong>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="details-id-section">
                        <div>
                            <span>FILE ID</span>
                            <p>{file._id || "-"}</p>
                        </div>
                    </div>

                    <div className="details-footer">
                        <span>FileFlow · File information</span>

                        <button
                            className="details-secondary-btn"
                            onClick={() => navigate("/my-files")}
                        >
                            Close
                        </button>
                    </div>

                </section>
            </div>
        </div>
    );
}

export default FileDetails;
