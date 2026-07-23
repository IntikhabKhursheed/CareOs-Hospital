import { useEffect, useState } from 'react';
import {
  Activity, CalendarDays, Stethoscope, ClipboardList,
  AlertTriangle, ShieldAlert, X, BrainCircuit, Wifi
} from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ToastContainer } from '../../components/ui/AlertToast';

/* ─── Static metrics ──────────────────────────────────────────────────── */
const metrics = [
  { title: 'Patients waiting',    value: '12', icon: <Activity size={20} />,      accent: 'bg-[#0EA5E9]' },
  { title: 'Today consultations', value: '8',  icon: <Stethoscope size={20} />,   accent: 'bg-[#14B8A6]' },
  { title: 'Critical alerts',     value: '2',  icon: <ClipboardList size={20} />, accent: 'bg-[#F59E0B]' },
  { title: 'Pending labs',        value: '5',  icon: <CalendarDays size={20} />,  accent: 'bg-[#6366F1]' },
];

/* ─── Mock real-time clinical alerts ──────────────────────────────────── */
const INITIAL_ALERTS = [
  {
    id: 1,
    severity: 'critical',
    mrn: 'MRN-2026-34283',
    message: 'Critical Potassium level (6.8 mEq/L) reported from Lab. Immediate clinical review required.',
    time: '2 min ago',
    department: 'Lab',
  },
  {
    id: 2,
    severity: 'warning',
    mrn: 'MRN-2026-14320',
    message: 'Penicillin allergy conflict detected in prescribed order. Awaiting physician override or substitution.',
    time: '8 min ago',
    department: 'Pharmacy',
  },
  {
    id: 3,
    severity: 'warning',
    mrn: 'MRN-2026-88712',
    message: 'Elevated HbA1c (9.4%). Diabetes management plan may require revision.',
    time: '15 min ago',
    department: 'Endocrinology',
  },
];

const SEVERITY_CONFIG = {
  critical: {
    badge: 'bg-red-100 text-red-700 border border-red-200',
    bar: 'bg-red-500',
    icon: <AlertTriangle size={15} className="text-red-600" />,
    label: 'Critical',
    ring: 'ring-1 ring-red-200',
    dot: 'bg-red-500 animate-pulse',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    bar: 'bg-amber-400',
    icon: <AlertTriangle size={15} className="text-amber-500" />,
    label: 'Warning',
    ring: 'ring-1 ring-amber-200',
    dot: 'bg-amber-400',
  },
};

/* ─── Sub-components ──────────────────────────────────────────────────── */
const ClinicalAlertRow = ({ alert, onDismiss }) => {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.warning;
  return (
    <div className={`relative flex items-start gap-3 rounded-xl bg-[var(--bg-secondary)] p-4 ${cfg.ring} transition hover:shadow-sm`}>
      {/* Left severity bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${cfg.bar}`} />

      {/* Icon */}
      <span className="mt-0.5 shrink-0">{cfg.icon}</span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cfg.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
            #{alert.mrn}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)]">{alert.department}</span>
        </div>
        <p className="mt-1.5 text-sm text-[var(--text-primary)] leading-snug">{alert.message}</p>
        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{alert.time}</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(alert.id)}
        title="Dismiss alert"
        className="shrink-0 rounded-lg p-1 text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      >
        <X size={14} />
      </button>
    </div>
  );
};

/* ─── Main Dashboard ──────────────────────────────────────────────────── */
const DoctorDashboard = () => {
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [alerts, setAlerts]               = useState(INITIAL_ALERTS);
  const [syncStatus, setSyncStatus]       = useState('connected');

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

  /* Simulate sync status flicker */
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('connected'), 1200);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount  = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Simulated WebSocket toast notifications */}
      <ToastContainer />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* ── Hero banner ─────────────────────────────────────── */}
        <section className="surface rounded-[1.5rem] p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-title">Doctor dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold">Your patient flow</h1>
              <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Review consultations, AI alerts, and the next cases in line.</p>
            </div>
            {/* Live sync badge */}
            <div className={`hidden sm:flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              syncStatus === 'connected'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              <Wifi size={15} className={syncStatus === 'syncing' ? 'animate-pulse' : ''} />
              {syncStatus === 'connected' ? 'Real-time sync active' : 'Syncing data…'}
            </div>
          </div>
        </section>

        {/* ── Metric cards ────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-4">
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

        {/* ── AI Clinical Alerts & Risk Assessment ────────────── */}
        <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-gradient-to-r from-red-50 via-amber-50 to-[var(--surface)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <BrainCircuit size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI Clinical Alerts & Risk Assessment</h2>
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">AI-powered risk signals from lab, pharmacy, and vitals streams</p>
              </div>
            </div>
            {/* Summary chips */}
            <div className="flex items-center gap-2 shrink-0">
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 border border-red-200">
                  <AlertTriangle size={12} />
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200">
                  <ShieldAlert size={12} />
                  {warningCount} Warning
                </span>
              )}
              {alerts.length === 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  ✓ All Clear
                </span>
              )}
            </div>
          </div>

          {/* Alert list */}
          <div className="p-6">
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <ClinicalAlertRow key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldAlert size={22} className="text-emerald-600" />
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">No active alerts</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">All patients are within safe clinical parameters.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Consultations + Actions ──────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-title">Upcoming consultations</p>
                <h2 className="mt-2 text-2xl font-semibold">Today&apos;s patient list</h2>
              </div>
              <a href="/consultations" className="btn-primary text-sm">Open consultation panel</a>
            </div>

            <div className="mt-8">
              <TableContainer>
                <DataTable>
                <TableHead>
                  <tr>
                    <TableHeader sortable sorted>Patient</TableHeader>
                    <TableHeader sortable>Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </tr>
                </TableHead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell><div className="h-4 w-28 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                          <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                          <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        </TableRow>
                      ))
                    : appointments.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-semibold text-[var(--text-primary)]">{item.patient?.name || 'Unknown'}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                          <TableCell className="text-[var(--text-primary)] capitalize">{item.status?.replace('_', ' ')}</TableCell>
                        </TableRow>
                      ))}
                </tbody>
              </DataTable>
              </TableContainer>
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
