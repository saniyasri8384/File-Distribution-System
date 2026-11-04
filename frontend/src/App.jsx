
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyFiles from "./pages/MyFiles";
import Upload from "./pages/Upload";
import ShareFile from "./pages/ShareFile";
import SharedFiles from "./pages/SharedFiles";
import SharedByMe from "./pages/SharedByMe";
import ActivityLogs from "./pages/ActivityLogs";
import FileDetails from "./pages/FileDetails";
import FileViewer from "./pages/FileViewer";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function HomeRedirect() {
    const { isAuthenticated } = useAuth();

    return (
        <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
        />
    );
}

function NotFound() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="not-found-page">
            <div className="not-found-card">
                <span className="not-found-icon">🔍</span>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>
                    Sorry, the page you are looking for doesn't exist.
                </p>

                <button
                    onClick={() =>
                        window.location.assign(
                            isAuthenticated ? "/dashboard" : "/login"
                        )
                    }
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
}

function AppRoutes() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<HomeRedirect />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-files"
                    element={
                        <ProtectedRoute>
                            <MyFiles />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <Upload />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/share/:fileId"
                    element={
                        <ProtectedRoute>
                            <ShareFile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/shared-files"
                    element={
                        <ProtectedRoute>
                            <SharedFiles />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/shared-by-me"
                    element={
                        <ProtectedRoute>
                            <SharedByMe />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/activity-logs"
                    element={
                        <ProtectedRoute>
                            <ActivityLogs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/file-details/:fileId"
                    element={
                        <ProtectedRoute>
                            <FileDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/view/:fileId"
                    element={
                        <ProtectedRoute>
                            <FileViewer />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
