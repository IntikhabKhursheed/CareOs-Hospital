import { useContext, useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, BedDouble, Sparkles, TrendingUp, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';
import aiService from '../../services/aiService';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

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

  const formatReport = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
      .replace(/^\* (.+)$/gm, '<li class="flex items-start gap-2 text-sm" style="color:var(--text-secondary)"><span style="color:var(--accent)" class="mt-1">•</span><span>$1</span></li>')
      .replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-2 my-3">$&</ul>')
      .split('\n\n')
      .map(para => para.startsWith('<') ? para :
        `<p class="text-sm leading-relaxed mb-3" style="color:var(--text-secondary)">${para}</p>`)
      .join('');
  };

  const handleGenerateWeeklyReport = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const response = await aiService.generateWeeklyReport({
        weeklyStats: {
          opdCount: 10,
          ipdCount: 3,
          revenue: 50000,
          labTests: 15,
          topDiagnoses: ["Fever", "Hypertension", "Diabetes"]
        }
      });
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
              <div key={card.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm transition hover:shadow-md">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
                  {card.icon}
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">{card.title}</p>
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

            <div className="mt-8">
              <TableContainer>
                <DataTable>
                <TableHead>
                  <tr>
                    <TableHeader sortable sorted>Patient</TableHeader>
                    <TableHeader sortable>Doctor</TableHeader>
                    <TableHeader sortable>Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </tr>
                </TableHead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                          <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                          <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                          <TableCell><div className="h-4 w-28 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        </TableRow>
                      ))
                    : recentAppointments.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-semibold text-[var(--text-primary)]">{item.patient?.name || 'Unknown'}</TableCell>
                          <TableCell>{item.doctor?.name || 'Unknown'}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-[var(--text-primary)] capitalize">{item.status?.replace('_', ' ')}</TableCell>
                        </TableRow>
                      ))}
                </tbody>
              </DataTable>
              </TableContainer>
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
          <div className="w-full max-w-2xl rounded-xl bg-[var(--bg-card)] shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={20} className="text-white" />
                  <h3 className="text-lg font-bold text-white">AI Weekly Report</h3>
                </div>
                <p className="text-indigo-100 text-sm">Generated by Grok AI · {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>
            {/* Body */}
            <div className="max-h-[500px] overflow-y-auto p-6">
              <div
                dangerouslySetInnerHTML={{ __html: formatReport(aiResult) }}
                className="prose prose-sm max-w-none"
              />
            </div>
            {/* Footer */}
            <div className="bg-[var(--bg-secondary)] border-t border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Codnocrats Innovating Solutions</span>
              <button
                onClick={() => {
                  const w = window.open('', '_blank');
                  w.document.write(`
                    <html>
                      <head>
                        <title>Weekly Report</title>
                        <style>
                          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #334155; }
                          h1 { color: #1e1b4b; font-size: 24px; margin-bottom: 8px; }
                          .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
                          strong { color: #0f172a; }
                          ul { padding-left: 0; list-style: none; margin: 12px 0; }
                          li { margin-bottom: 6px; }
                          .dot { color: #4f46e5; margin-right: 8px; }
                          p { line-height: 1.6; margin: 0 0 12px 0; }
                        </style>
                      </head>
                      <body>
                        <h1>AI Weekly Report</h1>
                        <p class="meta">Generated by Grok AI · ${new Date().toLocaleDateString()}</p>
                        ${formatReport(aiResult)}
                      </body>
                    </html>
                  `);
                  w.document.close();
                  w.focus();
                  setTimeout(() => w.print(), 250);
                }}
                className="px-4 py-2 text-sm font-medium text-indigo-600 border border-[var(--border)] rounded-lg hover:bg-[var(--sidebar-active)] transition"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
