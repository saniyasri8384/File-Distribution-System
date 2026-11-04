
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyFiles() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");
    const [mimeType, setMimeType] = useState("");

    const navigate = useNavigate();

    const getConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchFiles = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/files/my-files",
                getConfig()
            );

            setFiles(response.data.files || []);
        } catch (error) {
            console.error("MY FILES ERROR:", error);
            alert(
                error.response?.data?.message ||
                "Unable to load your files."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleSearch = async () => {
        try {
            setLoading(true);

            const params = {};

            if (searchName.trim()) {
                params.name = searchName.trim();
            }

            if (mimeType) {
                params.mimeType = mimeType;
            }

            if (Object.keys(params).length === 0) {
                await fetchFiles();
                return;
            }

            const response = await api.get("/files/search", {
                params,
                ...getConfig()
            });

            setFiles(response.data.files || []);
        } catch (error) {
            console.error("SEARCH ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Search failed."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchName("");
        setMimeType("");
        fetchFiles();
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 Bytes";

        const units = ["Bytes", "KB", "MB", "GB", "TB"];
        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        return `${parseFloat(
            (bytes / Math.pow(1024, index)).toFixed(2)
        )} ${units[index]}`;
    };

    const getFileType = (mime) => {
        if (!mime) return "Unknown";

        const types = {
            "application/pdf": "PDF",
            "image/jpeg": "JPG",
            "image/png": "PNG",
            "image/gif": "GIF",
            "image/webp": "WEBP",
            "text/plain": "Text",
            "application/msword": "Word",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
            "application/vnd.ms-excel": "Excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
            "application/zip": "ZIP"
        };

        return types[mime] || mime.split("/").pop().toUpperCase();
    };

    const getFileIcon = (mime) => {
        if (!mime) return "📄";
        if (mime.startsWith("image/")) return "🖼️";
        if (mime === "application/pdf") return "📕";
        if (mime.includes("word")) return "📝";
        if (mime.includes("spreadsheet") || mime.includes("excel")) return "📊";
        if (mime.startsWith("text/")) return "📃";
        if (mime.includes("zip")) return "🗜️";

        return "📄";
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await api.get(
                `/files/download/${fileId}`,
                {
                    ...getConfig(),
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (error) {
            console.error("DOWNLOAD ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Download failed."
            );
        }
    };

    const handleDelete = async (fileId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this file?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(
                `/files/delete/${fileId}`,
                getConfig()
            );

            alert("File deleted successfully!");
            await fetchFiles();
        } catch (error) {
            console.error("DELETE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Delete failed."
            );
        }
    };

    const handleShare = (fileId) => {
        navigate(`/share/${fileId}`);
    };

    const handleDetails = (fileId) => {
        navigate(`/file-details/${fileId}`);
    };

    if (loading) {
        return (
            <div className="page-container files-loading">
                <div className="loading-spinner"></div>
                <p>Loading your files...</p>
            </div>
        );
    }

    return (
        <main className="page-container my-files-page">
            <section className="my-files-header">
                <div>
                    <span className="dashboard-eyebrow">FILE MANAGER</span>
                    <h1>My Files</h1>
                    <p>Manage, download and share your documents.</p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => navigate("/upload")}
                >
                    ＋ Upload File
                </button>
            </section>

            <section className="file-search-box">
                <div className="search-input-wrapper">
                    <span>⌕</span>
                    <input
                        type="text"
                        placeholder="Search by file name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />
                </div>

                <select
                    value={mimeType}
                    onChange={(e) => setMimeType(e.target.value)}
                >
                    <option value="">All File Types</option>
                    <option value="application/pdf">PDF</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="text/plain">Text</option>
                </select>

                <button
                    className="search-button"
                    onClick={handleSearch}
                >
                    Search
                </button>

                <button
                    className="clear-button"
                    onClick={handleClearSearch}
                >
                    Clear
                </button>
            </section>

            <section className="files-table-card">
                <div className="files-table-heading">
                    <div>
                        <h2>Your Documents</h2>
                        <p>
                            {files.length} {files.length === 1 ? "file" : "files"} found
                        </p>
                    </div>
                    <span className="files-count-badge">
                        {files.length} Total
                    </span>
                </div>

                {files.length === 0 ? (
                    <div className="empty-files-card">
                        <div className="empty-files-icon">📂</div>
                        <h2>No files found</h2>
                        <p>
                            Try changing your search or upload a file to get started.
                        </p>
                        <button
                            className="primary-button"
                            onClick={() => navigate("/upload")}
                        >
                            Upload File
                        </button>
                    </div>
                ) : (
                    <div className="files-table-wrapper">
                        <table className="modern-files-table">
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {files.map((file) => (
                                    <tr key={file._id}>
                                        <td>
                                            <div className="my-file-name">
                                                <span className="my-file-icon">
                                                    {getFileIcon(file.mimeType)}
                                                </span>
                                                <strong title={file.originalName}>
                                                    {file.originalName}
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="file-type-badge">
                                                {getFileType(file.mimeType)}
                                            </span>
                                        </td>

                                        <td>{formatBytes(file.size)}</td>

                                        <td>
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </td>

                                        <td>
                                            <div className="file-action-buttons">
                                                <button
                                                    className="file-action-btn download-action"
                                                    onClick={() =>
                                                        handleDownload(file._id, file.originalName)
                                                    }
                                                >
                                                    Download
                                                </button>

                                                <button
                                                    className="file-action-btn share-action"
                                                    onClick={() => handleShare(file._id)}
                                                >
                                                    Share
                                                </button>

                                                <button
                                                    className="file-action-btn details-action"
                                                    onClick={() => handleDetails(file._id)}
                                                >
                                                    Details
                                                </button>

                                                <button
                                                    className="file-action-btn delete-action"
                                                    onClick={() => handleDelete(file._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default MyFiles;
