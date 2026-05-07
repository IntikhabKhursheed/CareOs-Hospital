import { useEffect, useRef, useState } from 'react';
import patientService from '../../services/patientService';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { navigateTo } from '../../utils/navigation';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);
  const latestRequestRef = useRef(0);

  const loadPatients = async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setLoading(true);
    try {
      const response = await patientService.getPatients({ search, gender, bloodGroup, page, limit });
      if (latestRequestRef.current !== requestId) return;
      setPatients(response.data.patients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      if (latestRequestRef.current !== requestId) return;
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await patientService.deletePatient(id);
      loadPatients();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search, gender, bloodGroup, page]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-title">Patient registry</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage patient records</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Search, filter, and review patient details from a unified premium dashboard.</p>
          </div>
          <a href="/patients/new" className="btn-primary inline-flex items-center justify-center">
            Add patient
          </a>
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patients"
                className="input-field"
              />
              <select value={gender} onChange={(event) => setGender(event.target.value)} className="input-field">
                <option value="">All genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="input-field">
                <option value="">All blood groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </section>

          <aside className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <p className="section-title">Overview</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Total patients</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.total || patients.length}</p>
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
                <TableHeader sortable sorted>MRH</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader sortable>Phone</TableHeader>
                <TableHeader>Blood group</TableHeader>
                <TableHeader sortable>Registered</TableHeader>
                <TableHeader align="right">Actions</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      <TableCell><div className="h-4 w-16 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      <TableCell align="right"><div className="ml-auto h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                    </TableRow>
                  ))
                : patients.map((patient) => (
                    <TableRow
                      key={patient._id}
                      interactive
                      className="group"
                      onClick={() => navigateTo(`/patients/profile?id=${patient._id}`)}
                    >
                      <TableCell className="font-semibold text-[var(--text-primary)]">{patient.MRH}</TableCell>
                      <TableCell className="text-[var(--text-primary)]">{patient.name}</TableCell>
                      <TableCell className="text-[var(--text-primary)]">{patient.phone || '—'}</TableCell>
                      <TableCell className="text-[var(--text-primary)]">{patient.bloodGroup || '—'}</TableCell>
                      <TableCell className="text-[var(--text-primary)]">{new Date(patient.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigateTo(`/patients/profile?id=${patient._id}`); }}
                            className="table-focusable inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(patient._id); }}
                            className="table-focusable inline-flex items-center rounded-md border border-red-300 bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigateTo(`/consultation/${patient._id}`); }}
                            className="table-focusable inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                          >
                            Consult
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

export default PatientList;
