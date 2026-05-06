import { useEffect, useState } from 'react';
import patientService from '../../services/patientService';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState({ appointments: [], visits: [] });
  const [loading, setLoading] = useState(true);
  const id = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await patientService.getPatientById(id);
        const historyResponse = await patientService.getPatientHistory(id);
        setPatient(response.data);
        setHistory(historyResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="animate-pulse rounded-3xl bg-slate-900 p-8 shadow-2xl shadow-slate-950/30">
          <div className="h-8 w-56 rounded bg-slate-800" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-3xl bg-slate-800" />
            <div className="h-24 rounded-3xl bg-slate-800" />
            <div className="h-24 rounded-3xl bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="card-glass rounded-3xl border border-slate-800 p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Patient profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{patient?.name || 'Patient details'}</h1>
              <p className="mt-3 max-w-2xl text-slate-400">Complete clinical history, contact details and active care notes are displayed below.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
              <p className="font-semibold text-white">MRH</p>
              <p className="mt-2 text-xl text-slate-100">{patient?.MRH || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Date of birth</p>
              <p className="mt-3 text-xl font-semibold text-white">{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Phone</p>
              <p className="mt-3 text-xl font-semibold text-white">{patient?.phone || '—'}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Email</p>
              <p className="mt-3 text-xl font-semibold text-white">{patient?.email || '—'}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card-glass rounded-3xl border border-slate-800 p-6 shadow-2xl shadow-slate-950/20">
            <h2 className="text-lg font-semibold text-white">Medical summary</h2>
            <p className="mt-4 text-slate-400">Allergies</p>
            <p className="mt-2 text-slate-200">{patient?.allergies?.length ? patient.allergies.join(', ') : 'None'}</p>
            <p className="mt-4 text-slate-400">Chronic conditions</p>
            <p className="mt-2 text-slate-200">{patient?.chronicConditions?.length ? patient.chronicConditions.join(', ') : 'None'}</p>
          </div>

          <div className="lg:col-span-2 grid gap-6">
            <div className="card-glass rounded-3xl border border-slate-800 p-6 shadow-2xl shadow-slate-950/20">
              <h3 className="text-lg font-semibold text-white">Appointment history</h3>
              {history.appointments.length ? (
                <ul className="mt-4 space-y-4">
                  {history.appointments.map((appointment) => (
                    <li key={appointment._id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                      <p className="font-medium text-slate-100">{new Date(appointment.date).toLocaleDateString()} • {appointment.timeSlot}</p>
                      <p className="mt-1 text-sm text-slate-400">Status: {appointment.status.replace('_', ' ')}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-400">No appointment records found.</p>
              )}
            </div>

            <div className="card-glass rounded-3xl border border-slate-800 p-6 shadow-2xl shadow-slate-950/20">
              <h3 className="text-lg font-semibold text-white">Visit records</h3>
              {history.visits.length ? (
                <ul className="mt-4 space-y-4">
                  {history.visits.map((visit) => (
                    <li key={visit._id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                      <p className="font-medium text-slate-100">{new Date(visit.createdAt).toLocaleDateString()}</p>
                      <p className="mt-1 text-sm text-slate-400">Complaint: {visit.chiefComplaint || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-400">No visit records found.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientProfile;
