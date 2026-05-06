import { useEffect, useState } from 'react';
import { Activity, CalendarDays, Stethoscope, ClipboardList } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const metrics = [
  { title: 'Patients waiting', value: '12', icon: <Activity size={20} />, accent: 'bg-[#0EA5E9]' },
  { title: 'Today consultations', value: '8', icon: <Stethoscope size={20} />, accent: 'bg-[#14B8A6]' },
  { title: 'Critical alerts', value: '2', icon: <ClipboardList size={20} />, accent: 'bg-[#F59E0B]' },
  { title: 'Pending labs', value: '5', icon: <CalendarDays size={20} />, accent: 'bg-[#6366F1]' }
];

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        const response = await appointmentService.getAppointments({ page: 1, limit: 5 });
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="surface rounded-[1.5rem] p-8 shadow-sm">
          <p className="section-title">Doctor dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold">Your patient flow</h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Review consultations, alerts, and the next cases in line.</p>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {metrics.map((metric) => (
            <article key={metric.title} className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm transition hover:-translate-y-1">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl text-white ${metric.accent}`}>
                {metric.icon}
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">{metric.title}</p>
              <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-title">Upcoming consultations</p>
                <h2 className="mt-2 text-2xl font-semibold">Today&apos;s patient list</h2>
              </div>
              <a href="/consultations" className="btn-primary text-sm">Open consultation panel</a>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[var(--text-secondary)]">
                <thead className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <tr className="border-b border-[var(--border)]" key={idx}>
                          <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200/70" /></td>
                          <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200/70" /></td>
                          <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200/70" /></td>
                        </tr>
                      ))
                    : appointments.map((item) => (
                        <tr key={item._id} className="border-b border-[var(--border)] hover:bg-[var(--sidebar-active)] transition">
                          <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{item.patient?.name || 'Unknown'}</td>
                          <td className="px-4 py-4 text-[var(--text-secondary)]">{new Date(item.date).toLocaleString()}</td>
                          <td className="px-4 py-4 text-[var(--text-primary)] capitalize">{item.status?.replace('_', ' ')}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="surface rounded-[1.5rem] p-8 shadow-sm">
            <p className="section-title">Doctor actions</p>
            <h2 className="mt-2 text-2xl font-semibold">Focus areas</h2>
            <div className="mt-8 space-y-4">
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Review lab feedback</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">2 urgent reports</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Patient follow-ups</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">5 pending</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Medication review</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">3 charts due</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
