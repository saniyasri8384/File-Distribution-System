
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedAction, setSelectedAction] = useState("ALL");

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/files/activity-logs",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLogs(
                Array.isArray(response.data.logs)
                    ? response.data.logs
                    : []
            );
        } catch (error) {
            console.error("ACTIVITY LOGS ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load activity logs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const actionOptions = [
        "ALL",
        "UPLOAD",
        "DOWNLOAD",
        "SHARE",
        "DELETE",
        "CHANGE_PERMISSION",
        "REVOKE_SHARE"
    ];

    const getActionIcon = (action) => {
        switch (action) {
            case "UPLOAD": return "⬆️";
            case "DOWNLOAD": return "⬇️";
            case "SHARE": return "🤝";
            case "DELETE": return "🗑️";
            case "CHANGE_PERMISSION": return "🔐";
            case "REVOKE_SHARE": return "🚫";
            default: return "📝";
        }
    };

    const getActionClass = (action) => {
        switch (action) {
            case "UPLOAD": return "activity-upload";
            case "DOWNLOAD": return "activity-download";
            case "SHARE": return "activity-share";
            case "DELETE": return "activity-delete";
            case "CHANGE_PERMISSION": return "activity-permission";
            case "REVOKE_SHARE": return "activity-revoke";
            default: return "activity-default";
        }
    };

    const formatAction = (action) => {
        return (action || "OTHER").replace(/_/g, " ");
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date unavailable";
        }

        return parsedDate.toLocaleString();
    };

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return logs.filter((log) => {
            const matchesAction =
                selectedAction === "ALL" ||
                log.action === selectedAction;

            const fileName = log.file?.originalName || "";
            const details = log.details || "";
            const action = formatAction(log.action);

            const matchesSearch =
                fileName.toLowerCase().includes(query) ||
                details.toLowerCase().includes(query) ||
                action.toLowerCase().includes(query);

            return matchesAction && matchesSearch;
        });
    }, [logs, search, selectedAction]);

    const actionCounts = useMemo(() => {
        return logs.reduce((counts, log) => {
            const action = log.action || "OTHER";
            counts[action] = (counts[action] || 0) + 1;
            return counts;
        }, {});
    }, [logs]);

    return (
        <main className="activity-page">
            <div className="activity-header">
                <div>
                    <span className="dashboard-eyebrow">
                        HISTORY & TRACKING
                    </span>

                    <h1>Activity Logs</h1>

                    <p>
                        Keep track of your file activity and sharing actions.
                    </p>
                </div>

                <button
                    className="activity-refresh-button"
                    onClick={fetchLogs}
                    disabled={loading}
                >
                    ↻ {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="activity-summary-grid">
                <div className="activity-summary-card">
                    <div className="activity-summary-icon">📋</div>
                    <div>
                        <strong>{logs.length}</strong>
                        <span>Total Activities</span>
                    </div>
                </div>

                <div className="activity-summary-card">
                    <div className="activity-summary-icon">⬆️</div>
                    <div>
                        <strong>{actionCounts.UPLOAD || 0}</strong>
                        <span>Uploads</span>
                    </div>
                </div>

                <div className="activity-summary-card">
                    <div className="activity-summary-icon">⬇️</div>
                    <div>
                        <strong>{actionCounts.DOWNLOAD || 0}</strong>
                        <span>Downloads</span>
                    </div>
                </div>

                <div className="activity-summary-card">
                    <div className="activity-summary-icon">🤝</div>
                    <div>
                        <strong>{actionCounts.SHARE || 0}</strong>
                        <span>Shares</span>
                    </div>
                </div>
            </div>

            <section className="activity-content-card">
                <div className="activity-toolbar">
                    <div>
                        <h2>Recent Activity</h2>
                        <p>
                            {filteredLogs.length} of {logs.length} activities
                        </p>
                    </div>

                    <div className="activity-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            placeholder="Search activities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="activity-filters">
                    {actionOptions.map((action) => (
                        <button
                            key={action}
                            className={`activity-filter ${
                                selectedAction === action ? "active" : ""
                            }`}
                            onClick={() => setSelectedAction(action)}
                        >
                            {action === "ALL"
                                ? "All"
                                : formatAction(action)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="activity-state">
                        <div className="loading-spinner"></div>
                        <p>Loading activity history...</p>
                    </div>
                ) : error ? (
                    <div className="activity-state">
                        <div className="activity-empty-icon">⚠️</div>
                        <h3>Couldn't load activities</h3>
                        <p>{error}</p>

                        <button
                            className="activity-retry-button"
                            onClick={fetchLogs}
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="activity-state">
                        <div className="activity-empty-icon">
                            {logs.length === 0 ? "📝" : "🔎"}
                        </div>

                        <h3>
                            {logs.length === 0
                                ? "No activity found"
                                : "No matching activities"}
                        </h3>

                        <p>
                            {logs.length === 0
                                ? "Your file activity will appear here."
                                : "Try changing your search or activity filter."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="activity-timeline">
                        {filteredLogs.map((log) => (
                            <article
                                className="activity-item"
                                key={log._id}
                            >
                                <div className={`activity-item-icon ${
                                    getActionClass(log.action)
                                }`}>
                                    {getActionIcon(log.action)}
                                </div>

                                <div className="activity-item-content">
                                    <div className="activity-item-top">
                                        <span className={`activity-badge ${
                                            getActionClass(log.action)
                                        }`}>
                                            {formatAction(log.action)}
                                        </span>

                                        <time className="activity-date">
                                            {formatDate(log.createdAt)}
                                        </time>
                                    </div>

                                    <h3>
                                        {log.file?.originalName ||
                                            "No file associated"}
                                    </h3>

                                    {log.details && (
                                        <p className="activity-details">
                                            {log.details}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default ActivityLogs;
