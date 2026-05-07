import { useEffect, useState } from 'react';
import appointmentService from '../../services/appointmentService';

const statusStyles = {
  scheduled: 'bg-sky-500/15 text-sky-600',
  checked_in: 'bg-emerald-500/15 text-emerald-600',
  in_progress: 'bg-amber-500/15 text-amber-600',
  completed: 'bg-teal-500/15 text-teal-600',
  cancelled: 'bg-rose-500/15 text-rose-600',
  no_show: 'bg-slate-500/15 text-slate-500'
};

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getAppointments({ search, status, type, page, limit });
      setAppointments(response.data.appointments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [search, status, type, page]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-title">Appointment queue</p>
            <h1 className="mt-3 text-4xl font-semibold">Monitor today&apos;s schedule</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Filter appointments, review statuses, and keep the care flow moving.</p>
          </div>
          <a href="/appointments/new" className="btn-primary inline-flex items-center justify-center">
            New appointment
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-3">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients or doctors" className="input-dark" />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-dark">
                <option value="">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="checked_in">Checked in</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No show</option>
              </select>
              <select value={type} onChange={(event) => setType(event.target.value)} className="input-dark">
                <option value="">All types</option>
                <option value="new">New</option>
                <option value="followup">Follow-up</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </section>

          <section className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <p className="section-title">Today&apos;s overview</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Total appointments</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.total || appointments.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Current page</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.page}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-secondary)] p-1 shadow-sm">
          <table className="min-w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="border-b border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Type</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-[var(--border)]">
                      <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></td>
                      <td className="px-5 py-5"><div className="h-4 w-28 rounded bg-[var(--bg-secondary)]/60" /></td>
                      <td className="px-5 py-5"><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></td>
                      <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></td>
                      <td className="px-5 py-5"><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></td>
                    </tr>
                  ))
                : appointments.map((item) => (
                    <tr key={item._id} className="border-b border-[var(--border)] hover:bg-[var(--sidebar-active)] transition">
                      <td className="px-5 py-5 font-semibold text-[var(--text-primary)]">{item.patient?.name || 'Unknown'}</td>
                      <td className="px-5 py-5 text-[var(--text-secondary)]">{item.doctor?.name || 'Unknown'}</td>
                      <td className="px-5 py-5 text-[var(--text-secondary)]">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-5 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-5 capitalize text-[var(--text-secondary)]">{item.type}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[var(--text-secondary)]">Page {pagination.page} of {Math.max(Math.ceil(pagination.total / pagination.limit), 1)}</div>
          <div className="flex flex-wrap gap-3">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-3xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)] transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--sidebar-active)]">
              Previous
            </button>
            <button disabled={page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => setPage(page + 1)} className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;
