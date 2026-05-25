import { useContext, useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Users, Calendar, UserPlus, Clock, FlaskConical, TestTube2, Receipt, Shield, Stethoscope, Menu, X } from 'lucide-react';
import Login from './pages/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthContext } from './context/AuthContext';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import ConsultationScreen from './pages/visits/ConsultationScreen';
import LabQueue from './pages/lab/LabQueue';
import ResultEntry from './pages/lab/ResultEntry';
import BillView from './pages/billing/BillView';
import PaymentForm from './pages/billing/PaymentForm';
import PatientPortal from './pages/portal/PatientPortal';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientProfile from './pages/patients/PatientProfile';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentForm from './pages/appointments/AppointmentForm';
import QueueDisplay from './pages/appointments/QueueDisplay';
import DoctorList from './pages/doctors/DoctorList';
import DoctorForm from './pages/doctors/DoctorForm';
import TestCatalogList from './pages/tests/TestCatalogList';
import TestCatalogForm from './pages/tests/TestCatalogForm';
import NotFound from './pages/NotFound';
import Sidebar from './components/layout/Sidebar';
import { navigateTo, subscribeNavigation } from './utils/navigation';

const getNavItems = (role) => {
  const adminItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Patients', path: '/patients', icon: <Users size={18} /> },
    { label: 'Doctors', path: '/doctors', icon: <Stethoscope size={18} /> },
    { label: 'Appointments', path: '/appointments', icon: <Calendar size={18} /> },
    { label: 'New Patient', path: '/patients/new', icon: <UserPlus size={18} /> },
    { label: 'Queue', path: '/appointments/queue', icon: <Clock size={18} /> },
    { label: 'Lab Queue', path: '/lab', icon: <FlaskConical size={18} /> },
    { label: 'Test Catalog', path: '/tests', icon: <TestTube2 size={18} /> },
    { label: 'Billing', path: '/billing', icon: <Receipt size={18} /> },
    { label: 'Patient Portal', path: '/portal', icon: <Shield size={18} /> }
  ];

  if (role === 'doctor') {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'Consultations', path: '/consultations', icon: <Stethoscope size={18} /> },
      { label: 'Lab Queue', path: '/lab', icon: <FlaskConical size={18} /> },
      { label: 'Billing', path: '/billing', icon: <Receipt size={18} /> },
      { label: 'Patient Portal', path: '/portal', icon: <Shield size={18} /> }
    ];
  }

  if (role === 'patient') {
    return [
      { label: 'My Portal', path: '/portal', icon: <Shield size={18} /> },
      { label: 'Lab Results', path: '/lab', icon: <FlaskConical size={18} /> },
      { label: 'Billing', path: '/billing', icon: <Receipt size={18} /> }
    ];
  }

  return adminItems;
};

function App() {
  const { user, logout } = useContext(AuthContext);
  const [path, setPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('careos_theme') === 'dark' ? 'dark' : 'light';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('careos_theme', theme);
  }, [theme]);

  useEffect(() => subscribeNavigation(setPath), []);

  useEffect(() => {
    const handleDocumentNavigation = (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/')) return;
      event.preventDefault();
      navigateTo(href);
      setSidebarOpen(false);
    };

    document.addEventListener('click', handleDocumentNavigation);
    return () => document.removeEventListener('click', handleDocumentNavigation);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const routeComponent = useMemo(() => {
    if (path === '/login') return <Login />;
    if (path === '/' || path === '/dashboard') return user?.role === 'doctor' ? <DoctorDashboard /> : <AdminDashboard />;
    if (path === '/consultations') return <ConsultationScreen />;
    if (path.startsWith('/consultation/')) return <ConsultationScreen />;
    if (path === '/lab') return <LabQueue />;
    if (path.startsWith('/lab/result')) return <ResultEntry />;
    if (path === '/billing') return <BillView />;
    if (path === '/billing/pay') return <PaymentForm />;
    if (path === '/portal') return <PatientPortal />;
    if (path === '/patients/new') return <PatientForm />;
    if (path === '/patients/profile') return <PatientProfile />;
    if (path === '/patients') return <PatientList />;
    if (path === '/appointments/new') return <AppointmentForm />;
    if (path === '/appointments/queue') return <QueueDisplay />;
    if (path === '/appointments') return <AppointmentList />;
    if (path === '/doctors/new') return <DoctorForm />;
    if (path === '/doctors') return <DoctorList />;
    if (path === '/tests/new') return <TestCatalogForm />;
    if (path === '/tests') return <TestCatalogList />;
    return <NotFound />;
  }, [path, user]);

  if (path === '/login') {
    return <Login />;
  }

  const navItems = getNavItems(user?.role);

  return (
    <ProtectedRoute>
      <div className="app-shell min-h-screen text-[var(--text-primary)] transition-colors duration-200">
        <Sidebar
          navItems={navItems}
          user={user}
          logout={logout}
          currentPath={path}
          theme={theme}
          toggleTheme={toggleTheme}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-h-screen px-4 py-5 transition-all lg:ml-72 lg:px-8 lg:py-6">
          {/* Mobile header bar */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg font-semibold text-[var(--text-primary)]">CareOS</span>
          </div>

          <div className="mx-auto max-w-[1500px]">
            {routeComponent}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default App;
