
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const [statistics, setStatistics] = useState({
        totalFiles: 0,
        totalStorage: 0,
        totalDownloads: 0
    });

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const [statsResponse, filesResponse] = await Promise.all([
                api.get("/files/statistics", config),
                api.get("/files/my-files", config)
            ]);

            setStatistics(statsResponse.data.statistics || {
                totalFiles: 0,
                totalStorage: 0,
                totalDownloads: 0
            });

            setFiles(filesResponse.data.files || []);
        } catch (error) {
            console.error("DASHBOARD ERROR:", error);
            setError("Unable to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="page-container dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Preparing your dashboard...</p>
            </div>
        );
    }

    return (
        <main className="page-container dashboard-page">
            <section className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">OVERVIEW</span>
                    <h1>Welcome back!</h1>
                    <p>Manage your files and shared documents in one place.</p>
                </div>

                <Link to="/upload" className="primary-link">
                    <span>＋</span> Upload File
                </Link>
            </section>

            {error && (
                <div className="dashboard-error" role="alert">
                    {error}
                    <button onClick={fetchDashboardData}>Retry</button>
                </div>
            )}

            <section className="stats-grid">
                <article className="stat-card">
                    <div className="stat-icon stat-icon-files">📁</div>
                    <div className="stat-content">
                        <p className="stat-title">Total Files</p>
                        <h2>{statistics.totalFiles ?? 0}</h2>
                        <span className="stat-caption">Files in your storage</span>
                    </div>
                </article>

                <article className="stat-card">
                    <div className="stat-icon stat-icon-storage">💾</div>
                    <div className="stat-content">
                        <p className="stat-title">Storage Used</p>
                        <h2>{formatBytes(statistics.totalStorage)}</h2>
                        <span className="stat-caption">Total uploaded file size</span>
                    </div>
                </article>

                <article className="stat-card">
                    <div className="stat-icon stat-icon-downloads">⬇️</div>
                    <div className="stat-content">
                        <p className="stat-title">Total Downloads</p>
                        <h2>{statistics.totalDownloads ?? 0}</h2>
                        <span className="stat-caption">Recorded downloads</span>
                    </div>
                </article>
            </section>

            <section className="quick-actions-section">
                <div className="section-heading">
                    <div>
                        <h2>Quick Actions</h2>
                        <p>Jump straight to what you need.</p>
                    </div>
                </div>

                <div className="quick-actions-grid">
                    <Link to="/upload" className="quick-action-card">
                        <div className="quick-action-icon upload-icon">⬆️</div>
                        <div>
                            <h3>Upload File</h3>
                            <p>Add a new file to your storage</p>
                        </div>
                        <span className="action-arrow">→</span>
                    </Link>

                    <Link to="/my-files" className="quick-action-card">
                        <div className="quick-action-icon files-icon">📁</div>
                        <div>
                            <h3>My Files</h3>
                            <p>View and manage your files</p>
                        </div>
                        <span className="action-arrow">→</span>
                    </Link>

                    <Link to="/shared-files" className="quick-action-card">
                        <div className="quick-action-icon shared-icon">🤝</div>
                        <div>
                            <h3>Shared Files</h3>
                            <p>Access files shared with you</p>
                        </div>
                        <span className="action-arrow">→</span>
                    </Link>
                </div>
            </section>

            <section className="files-section">
                <div className="section-header">
                    <div>
                        <h2>Recent Files</h2>
                        <p>Your latest uploaded documents</p>
                    </div>

                    <Link to="/my-files" className="view-all-link">
                        View All →
                    </Link>
                </div>

                {files.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No files uploaded yet</h3>
                        <p>Upload your first file to get started.</p>
                        <Link to="/upload" className="primary-link">
                            Upload File
                        </Link>
                    </div>
                ) : (
                    <div className="recent-files">
                        {files.slice(0, 5).map((file) => (
                            <div className="file-row" key={file._id}>
                                <div className="file-info">
                                    <div className="file-icon">📄</div>
                                    <div className="file-text">
                                        <strong>{file.originalName}</strong>
                                        <p>
                                            {formatBytes(file.size)}
                                            {" · "}
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    to={`/file-details/${file._id}`}
                                    className="details-link"
                                >
                                    Details →
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Dashboard;
