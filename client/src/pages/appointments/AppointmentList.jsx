import { useEffect, useState } from 'react';
import appointmentService from '../../services/appointmentService';

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Appointment queue</h1>
          <p className="mt-2 text-slate-600">Track scheduled appointments and manage their statuses.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none shadow-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="checked_in">Checked in</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
          <option value="">All types</option>
          <option value="new">New</option>
          <option value="followup">Follow-up</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-4">Patient</th>
              <th className="px-4 py-4">Doctor</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Type</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-200 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                  </tr>
                ))
              : appointments.map((item) => (
                  <tr key={item._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-4">{item.patient?.name || 'Unknown'}</td>
                    <td className="px-4 py-4">{item.doctor?.name || 'Unknown'}</td>
                    <td className="px-4 py-4">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 capitalize">{item.status.replace('_', ' ')}</td>
                    <td className="px-4 py-4 capitalize">{item.type}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm text-slate-600">Showing page {pagination.page} of {Math.max(Math.ceil(pagination.total / pagination.limit), 1)}</div>
        <div className="flex gap-3">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
          <button disabled={page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => setPage(page + 1)} className="rounded-3xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;
