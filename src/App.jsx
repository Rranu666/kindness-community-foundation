import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import ScrollToggleButton from '@/components/ScrollToggleButton'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ErrorBoundary from './lib/ErrorBoundary';
import { AuthProvider } from '@/lib/AuthContext';
import VolunteerDashboard from './pages/VolunteerDashboard';
import TeamPortal from './pages/TeamPortal';
import TeamPortalLanding from './pages/TeamPortalLanding';
import Analytics from './pages/Analytics';
import KindnessConnect from './pages/KindnessConnect';
import GivingDashboard from './pages/GivingDashboard';
import Blog from './pages/Blog';
import KindWaveAppPage from './pages/KindWaveAppPage';
import Login from './pages/Login';
import Contact from './pages/Contact';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/VolunteerDashboard" element={
        <LayoutWrapper currentPageName="VolunteerDashboard">
          <VolunteerDashboard />
        </LayoutWrapper>
      } />
      <Route path="/TeamPortalLanding" element={<TeamPortalLanding />} />
      <Route path="/TeamPortal" element={<TeamPortal />} />
      <Route path="/servekindness" element={<KindnessConnect />} />
      <Route path="/KindnessConnect" element={<KindnessConnect />} />
      <Route path="/GivingDashboard" element={<GivingDashboard />} />
      <Route path="/Blog" element={<Blog />} />
      <Route path="/KindWaveApp" element={<KindWaveAppPage />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/Analytics" element={
        <LayoutWrapper currentPageName="Analytics">
          <Analytics />
        </LayoutWrapper>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <ScrollToggleButton />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
