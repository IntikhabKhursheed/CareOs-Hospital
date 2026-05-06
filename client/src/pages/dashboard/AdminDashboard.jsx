import { useContext, useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, BedDouble, Sparkles, TrendingUp, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';
import aiService from '../../services/aiService';

const statCards = [
  { title: 'Patients Today', label: 'patientsToday', icon: <Users size={20} />, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { title: 'Appointments', label: 'appointments', icon: <Calendar size={20} />, iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  { title: 'Revenue', label: 'revenue', icon: <DollarSign size={20} />, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { title: 'Bed Occupancy', label: 'bedOccupancy', icon: <BedDouble size={20} />, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' }
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [kpis, setKpis] = useState({ patientsToday: 0, appointments: 0, revenue: 0, bedOccupancy: '72%' });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

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

  const handleGenerateWeeklyReport = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const response = await aiService.generateWeeklyReportV2();
      setAiResult(response.data?.report || response.message || JSON.stringify(response.data));
      setShowAiModal(true);
    } catch (error) {
      console.error(error);
      setAiResult('Failed to generate weekly report. Please try again.');
      setShowAiModal(true);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl space-y-6 px-2 py-6 sm:px-6 lg:px-8">
        <section className="surface rounded-[1.5rem] p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-title">Welcome back</p>
              <h1 className="mt-3 text-4xl font-semibold">Good to see you, {user?.name || 'Admin'}</h1>
              <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Your hospital operations snapshot and live appointment activity.</p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border)]">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Today</p>
              <p className="mt-2 text-3xl font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-200 bg-[var(--bg-card)] p-6 shadow-sm transition hover:shadow-md">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
                  {card.icon}
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">{card.title}</p>
                <p className="mt-1 text-[32px] font-bold text-[var(--text-primary)]">{loading ? '—' : card.label === 'revenue' ? `$${kpis[card.label]}` : kpis[card.label]}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp size={14} />
                  <span>+2.4% this week</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm border-l-4 border-l-indigo-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">AI Hospital Assistant</h3>
                <p className="text-sm text-[var(--text-secondary)]">Get instant AI analysis of your hospital operations</p>
              </div>
            </div>
            <button
              onClick={handleGenerateWeeklyReport}
              disabled={aiLoading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Weekly Report
                </>
              )}
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-title">Recent appointments</p>
                <h2 className="mt-2 text-2xl font-semibold">Today&apos;s schedule</h2>
              </div>
              <span className="rounded-full bg-[var(--bg-secondary)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Updated now</span>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[var(--text-secondary)]">
                <thead className="border-b border-[var(--border)] text-[var(--text-secondary)]">
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
                        <tr key={idx} className="border-b border-[var(--border)]">
                          <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200/60" /></td>
                          <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200/60" /></td>
                          <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200/60" /></td>
                          <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200/60" /></td>
                        </tr>
                      ))
                    : recentAppointments.map((item) => (
                        <tr key={item._id} className="border-b border-[var(--border)] hover:bg-[var(--sidebar-active)] transition">
                          <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">{item.patient?.name || 'Unknown'}</td>
                          <td className="px-4 py-4 text-[var(--text-secondary)]">{item.doctor?.name || 'Unknown'}</td>
                          <td className="px-4 py-4 text-[var(--text-secondary)]">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-4 text-[var(--text-primary)] capitalize">{item.status?.replace('_', ' ')}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="surface rounded-[1.5rem] p-8 shadow-sm">
            <div>
              <p className="section-title">Highlights</p>
              <h2 className="mt-2 text-2xl font-semibold">Recent activity</h2>
            </div>
            <div className="mt-8 space-y-4">
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">3 new patient registrations completed</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Lab queue now has 2 critical orders</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Billing export completed successfully</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">AI Weekly Report</h3>
              <button onClick={() => setShowAiModal(false)} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">{aiResult}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
