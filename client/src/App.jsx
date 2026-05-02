import { useContext } from 'react';
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
import NotFound from './pages/NotFound';

const getNavItems = (role) => {
  const base = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Patients', path: '/patients' },
    { label: 'Appointments', path: '/appointments' }
  ];

  if (role === 'doctor') {
    return [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Consultations', path: '/consultations' },
      { label: 'Lab queue', path: '/lab' },
      { label: 'Billing', path: '/billing' },
      { label: 'Patient portal', path: '/portal' }
    ];
  }

  if (role === 'patient') {
    return [
      { label: 'My portal', path: '/portal' },
      { label: 'Lab results', path: '/lab' },
      { label: 'Billing', path: '/billing' }
    ];
  }

  return [
    ...base,
    { label: 'New patient', path: '/patients/new' },
    { label: 'Queue', path: '/appointments/queue' },
    { label: 'Lab queue', path: '/lab' },
    { label: 'Billing', path: '/billing' },
    { label: 'Patient portal', path: '/portal' }
  ];
};

function App() {
  const { user, logout } = useContext(AuthContext);
  const path = window.location.pathname;

  const routeComponent = () => {
    if (path === '/login') return <Login />;
    if (path === '/dashboard') return user?.role === 'doctor' ? <DoctorDashboard /> : <AdminDashboard />;
    if (path === '/consultations') return <ConsultationScreen />;
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
    return <NotFound />;
  };

  if (path === '/login') {
    return <Login />;
  }

  const navItems = getNavItems(user?.role);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">CareOS</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Hospital management hub</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {navItems.map((item) => (
                <a key={item.path} href={item.path} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-primary hover:text-white">
                  {item.label}
                </a>
              ))}
              <button onClick={logout} className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900">Sign out</button>
            </div>
          </div>
        </header>
        <main>{routeComponent()}</main>
      </div>
    </ProtectedRoute>
  );
}

export default App;
