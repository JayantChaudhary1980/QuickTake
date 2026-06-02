import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashBoardPage";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import AnalysisDetailsPage from "./pages/AnalysisDetailsPage";
import LiveCapturePage from "./pages/LiveCapturePage";
import PublicAnalysisPage from "./pages/PublicAnalysisPage";
import HistoryPage from "./pages/HistoryPage";
import YoutubeAnalysisPage from "./pages/YoutubeAnalysisPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
          } 
        />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
          } 
        />
        <Route
          path="/analysis/new/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis/new/live"
          element={
            <ProtectedRoute>
              <LiveCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis/:id"
          element={
            <ProtectedRoute>
              <AnalysisDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:id" element={<PublicAnalysisPage />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/youtube"
          element={
            <ProtectedRoute>
              <YoutubeAnalysisPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
