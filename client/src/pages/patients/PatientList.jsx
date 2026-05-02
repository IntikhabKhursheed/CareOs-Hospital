import { useEffect, useState } from 'react';
import patientService from '../../services/patientService';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getPatients({ search, gender, bloodGroup, page, limit });
      setPatients(response.data.patients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search, gender, bloodGroup, page]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Patient registry</h1>
          <p className="mt-2 text-slate-600">Search and manage patients across the hospital database.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search patients"
          className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none shadow-sm"
        />
        <select value={gender} onChange={(event) => setGender(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
          <option value="">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
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
      <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-4">MRH</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Blood group</th>
              <th className="px-4 py-4">Registered</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-200 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                  </tr>
                ))
              : patients.map((patient) => (
                  <tr key={patient._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">{patient.MRH}</td>
                    <td className="px-4 py-4">{patient.name}</td>
                    <td className="px-4 py-4">{patient.phone || '—'}</td>
                    <td className="px-4 py-4">{patient.bloodGroup || '—'}</td>
                    <td className="px-4 py-4">{new Date(patient.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm text-slate-600">Showing page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}</div>
        <div className="flex gap-3">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
          <button disabled={page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => setPage(page + 1)} className="rounded-3xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
