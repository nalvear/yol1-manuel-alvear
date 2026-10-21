import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider } from './context/AuthProvider';
import { LoginPage } from './pages/LoginPage';
import { ScorePage } from './pages/ScorePage';
import { ProtectedRoute, PublicOnlyRoute } from './routes/guards';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/score" element={<ScorePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/score" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
