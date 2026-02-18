import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import Layout from "@/Layout";
import HomePage from "@/pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";
import RoundsPage from "@/pages/RoundsPage";
import RoundDetailPage from "@/pages/RoundDetailPage";
import RoundReportPage from "@/pages/RoundReportPage";
import ClosureReportPage from "@/pages/ClosureReportPage";
import DrawsPage from "@/pages/DrawsPage";
import DrawDetailPage from "@/pages/DrawDetailPage";
import DrawResultsPage from "@/pages/DrawResultsPage";
import PrizesPage from "@/pages/PrizesPage";
import PrizesDetailPage from "@/pages/PrizesDetailPage";
import BackupPage from "@/pages/BackupPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/rounds" element={<RoundsPage />} />
          <Route path="/rounds/:id" element={<RoundDetailPage />} />
          <Route path="/rounds/:id/report" element={<RoundReportPage />} />
          <Route path="/rounds/:id/closure" element={<ClosureReportPage />} />
          <Route path="/draws" element={<DrawsPage />} />
          <Route path="/draws/:id" element={<DrawDetailPage />} />
          <Route path="/draws/:roundId/results/:drawId" element={<DrawResultsPage />} />
          <Route path="/prizes" element={<PrizesPage />} />
          <Route path="/prizes/:id" element={<PrizesDetailPage />} />
          <Route path="/backup" element={<BackupPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
