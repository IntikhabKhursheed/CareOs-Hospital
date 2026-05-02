import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';

const DashboardCard = ({ title, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{title}</p>
    <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [kpis, setKpis] = useState({ patientsToday: 0, appointments: 0, revenue: 0, bedOccupancy: '0%' });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const patientsResponse = await patientService.getPatients({ page: 1, limit: 5 });
        const appointmentsResponse = await appointmentService.getAppointments({ page: 1, limit: 5 });
        setKpis({
          patientsToday: patientsResponse.data.patients.length,
          appointments: appointmentsResponse.data.appointments.length,
          revenue: 0,
          bedOccupancy: '72%'
        });
        setRecentAppointments(appointmentsResponse.data.appointments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  useEffect(() => {
    const handleNewAppointment = (event) => {
      const appointment = event.detail;
      setRecentAppointments((prev) => [appointment, ...prev].slice(0, 5));
      setKpis((prev) => ({ ...prev, appointments: prev.appointments + 1 }));
    };
    window.addEventListener('new_appointment', handleNewAppointment);
    return () => window.removeEventListener('new_appointment', handleNewAppointment);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Welcome back, {user?.name}. Overview of hospital performance and queue updates.</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        <DashboardCard title="Patients today" value={loading ? '—' : kpis.patientsToday} />
        <DashboardCard title="Appointments" value={loading ? '—' : kpis.appointments} />
        <DashboardCard title="Revenue" value={loading ? '—' : `$${kpis.revenue}`} />
        <DashboardCard title="Bed occupancy" value={loading ? '—' : kpis.bedOccupancy} />
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Recent appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-200">
                      <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    </tr>
                  ))
                : recentAppointments.map((item) => (
                    <tr key={item._id} className="border-b border-slate-200">
                      <td className="px-4 py-4">{item.patient?.name || 'Unknown'}</td>
                      <td className="px-4 py-4">{item.doctor?.name || 'Unknown'}</td>
                      <td className="px-4 py-4">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-4 py-4 capitalize">{item.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
