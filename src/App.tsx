import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import Layout from "@/src/Layout";
import HomePage from "@/src/pages/HomePage";
import PlayersPage from "@/src/pages/PlayersPage";
import RoundsPage from "@/src/pages/RoundsPage";
import RoundDetailPage from "@/src/pages/RoundDetailPage";
import RoundReportPage from "@/src/pages/RoundReportPage";
import ClosureReportPage from "@/src/pages/ClosureReportPage";
import DrawsPage from "@/src/pages/DrawsPage";
import DrawDetailPage from "@/src/pages/DrawDetailPage";
import DrawResultsPage from "@/src/pages/DrawResultsPage";
import PrizesPage from "@/src/pages/PrizesPage";
import PrizesDetailPage from "@/src/pages/PrizesDetailPage";
import BackupPage from "@/src/pages/BackupPage";
import LoginPage from "@/src/pages/LoginPage";
import SignUpPage from "@/src/pages/SignUpPage";
import NotFoundPage from "@/src/pages/NotFoundPage";

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
