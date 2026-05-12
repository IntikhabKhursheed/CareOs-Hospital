import { useEffect, useRef, useState } from 'react';
import doctorService from '../../services/doctorService';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { navigateTo } from '../../utils/navigation';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);
  const latestRequestRef = useRef(0);

  const loadDoctors = async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setLoading(true);
    try {
      const response = await doctorService.getDoctors({ search, department, page, limit });
      if (latestRequestRef.current !== requestId) return;
      setDoctors(response.data.doctors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      if (latestRequestRef.current !== requestId) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [search, department, page]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-title">Doctor directory</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage medical staff</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Search, filter, and review doctor profiles from a unified premium dashboard.</p>
          </div>
          <button onClick={() => navigateTo('/doctors/new')} className="btn-primary inline-flex items-center justify-center">
            Add Doctor
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search doctors by name, email, or phone"
                className="input-field"
              />
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="input-field">
                <option value="">All departments</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Surgery">Surgery</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="ENT">ENT</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Neurology">Neurology</option>
                <option value="Urology">Urology</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </section>

          <aside className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <p className="section-title">Overview</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Total doctors</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.total || doctors.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Current page</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.page}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6">
          <TableContainer>
            <DataTable>
              <TableHead>
                <tr>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Specialization</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-40 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell align="right"><div className="ml-auto h-4 w-32 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      </TableRow>
                    ))
                  : doctors.map((doctor) => (
                      <TableRow
                        key={doctor._id}
                        interactive
                        className="group"
                        onClick={() => navigateTo(`/doctors/profile?id=${doctor._id}`)}
                      >
                        <TableCell className="font-semibold text-[var(--text-primary)]">
                          {doctor.user?.name || '—'}
                        </TableCell>
                        <TableCell className="text-[var(--text-primary)]">{doctor.specialization || '—'}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">{doctor.department || '—'}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">{doctor.user?.phone || '—'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            doctor.user?.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {doctor.user?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigateTo(`/doctors/profile?id=${doctor._id}`); }}
                              className="table-focusable inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigateTo(`/doctors/edit?id=${doctor._id}`); }}
                              className="table-focusable inline-flex items-center rounded-md border border-blue-300 bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </tbody>
            </DataTable>
          </TableContainer>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[var(--text-secondary)]">Page {pagination.page} of {Math.max(Math.ceil(pagination.total / pagination.limit), 1)}</div>
          <div className="flex flex-wrap gap-3">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(page - 1)} 
              className="rounded-3xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)] transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--sidebar-active)]"
            >
              Previous
            </button>
            <button 
              disabled={page >= Math.ceil(pagination.total / pagination.limit)} 
              onClick={() => setPage(page + 1)} 
              className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
