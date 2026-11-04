
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mammoth from "mammoth";
import api from "../services/api";

function FileViewer() {
    const { fileId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fileUrl, setFileUrl] = useState(null);
    const [fileType, setFileType] = useState("");
    const [textContent, setTextContent] = useState("");
    const [docxHtml, setDocxHtml] = useState("");

    useEffect(() => {
        let cancelled = false;
        let objectUrl = null;

        const fetchFile = async () => {
            try {
                setLoading(true);
                setError("");
                setFileUrl(null);
                setFileType("");
                setTextContent("");
                setDocxHtml("");

                const token = localStorage.getItem("token");

                const response = await api.get(
                    `/files/view/${fileId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        responseType: "blob"
                    }
                );

                const blob = response.data;
                const type = blob.type || "";

                if (cancelled) return;

                setFileType(type);

                // DOCX preview
                if (
                    type ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ) {
                    const arrayBuffer = await blob.arrayBuffer();

                    const result = await mammoth.convertToHtml({
                        arrayBuffer
                    });

                    if (!cancelled) {
                        setDocxHtml(result.value);
                    }

                    return;
                }

                // Text preview
                if (type.startsWith("text/")) {
                    const text = await blob.text();

                    if (!cancelled) {
                        setTextContent(text);
                    }

                    return;
                }

                // PDF and image preview
                if (
                    type === "application/pdf" ||
                    type.startsWith("image/")
                ) {
                    objectUrl = window.URL.createObjectURL(blob);

                    if (!cancelled) {
                        setFileUrl(objectUrl);
                    }

                    return;
                }

                if (!cancelled) {
                    setError(
                        "Preview is not available for this file format."
                    );
                }

            } catch (err) {
                console.error("FILE VIEW ERROR:", err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to open this file. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchFile();

        return () => {
            cancelled = true;

            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fileId]);

    const getFileTypeLabel = () => {
        if (fileType === "application/pdf") return "PDF Document";
        if (fileType.startsWith("image/")) return "Image";
        if (fileType.startsWith("text/")) return "Text Document";

        if (
            fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            return "Word Document";
        }

        return "File Preview";
    };

    const renderPreview = () => {
        if (
            fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            return (
                <div className="viewer-document-content">
                    {docxHtml ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: docxHtml
                            }}
                        />
                    ) : (
                        <p className="viewer-empty-message">
                            This document contains no previewable content.
                        </p>
                    )}
                </div>
            );
        }

        if (fileType.startsWith("text/")) {
            return (
                <pre className="viewer-text-content">
                    {textContent || "This text file is empty."}
                </pre>
            );
        }

        if (fileType === "application/pdf" && fileUrl) {
            return (
                <iframe
                    src={fileUrl}
                    title="PDF Preview"
                    className="viewer-pdf-frame"
                />
            );
        }

        if (fileType.startsWith("image/") && fileUrl) {
            return (
                <div className="viewer-image-container">
                    <img
                        src={fileUrl}
                        alt="Shared file preview"
                        className="viewer-image"
                    />
                </div>
            );
        }

        return (
            <div className="viewer-empty-message">
                <div className="viewer-empty-icon">📄</div>
                <h3>Preview unavailable</h3>
                <p>
                    This file format cannot be displayed in the browser.
                </p>
            </div>
        );
    };

    return (
        <div className="file-viewer-page">
            <div className="file-viewer-container">

                <button
                    className="viewer-back-btn"
                    onClick={() => navigate("/shared-files")}
                >
                    <span>←</span> Back to Shared Files
                </button>

                <div className="viewer-heading">
                    <div>
                        <span className="viewer-eyebrow">
                            SHARED DOCUMENT
                        </span>
                        <h1>File Viewer</h1>
                        <p>
                            Preview your shared file securely.
                        </p>
                    </div>

                    <div className="viewer-type-badge">
                        <span>📄</span>
                        {getFileTypeLabel()}
                    </div>
                </div>

                <section className="viewer-card">
                    <div className="viewer-card-header">
                        <div>
                            <h2>Preview</h2>
                            <p>File content appears below</p>
                        </div>

                        <span className="viewer-preview-label">
                            <span className="viewer-status-dot"></span>
                            Preview
                        </span>
                    </div>

                    <div className="viewer-content">
                        {loading ? (
                            <div className="viewer-state">
                                <div className="viewer-spinner"></div>
                                <h3>Opening your file...</h3>
                                <p>Please wait while we prepare the preview.</p>
                            </div>
                        ) : error ? (
                            <div className="viewer-state">
                                <div className="viewer-error-icon">⚠️</div>
                                <h3>Unable to display file</h3>
                                <p>{error}</p>

                                <button
                                    className="viewer-primary-btn"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            renderPreview()
                        )}
                    </div>

                    <div className="viewer-card-footer">
                        <span>
                            FileFlow · Shared File Preview
                        </span>

                        <button
                            className="viewer-secondary-btn"
                            onClick={() => navigate("/shared-files")}
                        >
                            Close Viewer
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default FileViewer;
