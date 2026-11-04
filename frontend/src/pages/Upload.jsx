
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Upload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setFile(selectedFile);
            setProgress(0);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);

        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile) {
            setFile(droppedFile);
            setProgress(0);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "0 Bytes";

        const units = ["Bytes", "KB", "MB", "GB"];
        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file first.");
            return;
        }

        try {
            setUploading(true);
            setProgress(0);

            const token = localStorage.getItem("token");
            const formData = new FormData();

            formData.append("file", file);

            await api.post("/files/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (event) => {
                    if (event.total) {
                        const percentage = Math.round(
                            (event.loaded * 100) / event.total
                        );

                        setProgress(percentage);
                    }
                }
            });

            alert("File uploaded successfully!");
            navigate("/my-files");
        } catch (error) {
            console.error("UPLOAD ERROR:", error);

            alert(
                error.response?.data?.message ||
                "File upload failed. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        if (uploading) return;

        setFile(null);
        setProgress(0);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <main className="upload-page">
            <section className="upload-card">
                <div className="upload-heading">
                    <div className="upload-icon-large">📤</div>

                    <span className="dashboard-eyebrow">FILE MANAGER</span>
                    <h1>Upload a File</h1>

                    <p className="upload-subtitle">
                        Add your documents to FileFlow and manage them
                        from one place.
                    </p>
                </div>

                <form onSubmit={handleUpload}>
                    <label
                        className={`upload-area ${dragging ? "dragging" : ""}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!uploading) setDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setDragging(false);
                        }}
                        onDrop={handleDrop}
                    >
                        <div className="upload-area-icon">
                            <span>☁️</span>
                        </div>

                        <h3>Drag and drop your file here</h3>

                        <p>or click below to browse your computer</p>

                        <span className="browse-files-text">
                            Browse Files
                        </span>

                        <input
                            ref={inputRef}
                            type="file"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>

                    {file && (
                        <div className="selected-file">
                            <span className="selected-file-icon">📄</span>

                            <div className="selected-file-info">
                                <strong title={file.name}>
                                    {file.name}
                                </strong>

                                <p>{formatBytes(file.size)}</p>
                            </div>

                            <button
                                type="button"
                                className="remove-file-button"
                                onClick={removeFile}
                                disabled={uploading}
                                aria-label="Remove selected file"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {uploading && (
                        <div className="upload-progress-section">
                            <div className="progress-label">
                                <span>Uploading your file...</span>
                                <strong>{progress}%</strong>
                            </div>

                            <div
                                className="progress-track"
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="upload-button"
                        disabled={uploading || !file}
                    >
                        {uploading
                            ? "Uploading..."
                            : "↑ Upload File"}
                    </button>
                </form>

                <div className="upload-security-note">
                    <span>🔒</span>
                    Your files are uploaded to your personal storage.
                </div>

                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/my-files")}
                    disabled={uploading}
                >
                    ← Back to My Files
                </button>
            </section>
        </main>
    );
}

export default Upload;
