import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from 'sonner';

import RequireAdmin from '@/components/layout/RequireAdmin';
import AdminShell from '@/components/layout/AdminShell';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Content from '@/pages/Content';
import KindWaveAdmin from '@/pages/KindWave';
import Seo from '@/pages/Seo';
import Languages from '@/pages/Languages';
import Marketing from '@/pages/Marketing';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAdmin />}>
              <Route element={<AdminShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route path="/users"      element={<Users />} />
                <Route path="/content"    element={<Content />} />
                <Route path="/kindwave"   element={<KindWaveAdmin />} />
                <Route path="/seo"        element={<Seo />} />
                <Route path="/languages"  element={<Languages />} />
                <Route path="/marketing"  element={<Marketing />} />
                <Route path="/analytics"  element={<Analytics />} />
                <Route path="/settings"   element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}
