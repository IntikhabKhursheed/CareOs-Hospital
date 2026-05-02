import { useEffect, useState } from 'react';
import consultationService from '../../services/appointmentService';

const summaryCards = [
  { title: 'Patients waiting', value: '12' },
  { title: 'Today consultations', value: '8' },
  { title: 'Critical alerts', value: '2' },
  { title: 'Pending lab results', value: '5' }
];

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        const response = await consultationService.getAppointments({ page: 1, limit: 5 });
        setAppointments(response.data.appointments || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Doctor dashboard</h1>
          <p className="mt-2 text-slate-600">Track your patient load, consultation tasks, and lab alerts in one place.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{card.title}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming consultations</h2>
          <a href="/consultations" className="text-sm font-semibold text-primary hover:underline">Open consultation panel</a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-200">
                      <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-slate-200" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    </tr>
                  ))
                : appointments.map((item) => (
                    <tr key={item._id} className="border-b border-slate-200">
                      <td className="px-4 py-4">{item.patient?.name || 'Unknown'}</td>
                      <td className="px-4 py-4">{new Date(item.date).toLocaleString()}</td>
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

export default DoctorDashboard;
