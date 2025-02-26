// Import required dependencies and components
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Breadcrumb from './components/Breadcrumb';
import Home from './pages/Home';
import Auth from './pages/Auth.tsx';
import JobPostings from './pages/JobPostings';
import SubmitPosting from './pages/SubmitPosting';
import StudentApply from './pages/StudentApply';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import Help from './pages/Help';
import EmployerDashboard from './pages/EmployerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MyPostings from './pages/MyPostings';
import EmployerApplications from './pages/EmployerApplications';
import JudgesAccess from './pages/JudgesAccess';
import { ROLES } from './config/firebase';

// Component to handle page transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="pt-32 w-full">
            {/* Breadcrumb navigation */}
            <Breadcrumb />
            
            {/* Page content with transitions */}
            <PageTransition>
              <div className="w-full px-4">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/jobs" element={<JobPostings />} />
                  <Route path="/judges-access" element={<JudgesAccess />} />

                  {/* Protected routes for all authenticated users */}
                  <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.EMPLOYER, ROLES.ADMIN]} />}>
                    <Route path="/settings" element={<Settings />} />
                  </Route>

                  {/* Protected student routes */}
                  <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
                    <Route path="/job/:jobId/apply" element={<StudentApply />} />
                    <Route path="/my-applications" element={<StudentDashboard />} />
                  </Route>
                  
                  {/* Protected employer routes */}
                  <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} />}>
                    <Route path="/submit-posting" element={<SubmitPosting />} />
                    <Route path="/my-postings" element={<MyPostings />} />
                    <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                    <Route path="/employer/applications" element={<EmployerApplications />} />
                  </Route>
                  
                  {/* Protected admin routes */}
                  <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                  </Route>
                </Routes>
              </div>
            </PageTransition>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
