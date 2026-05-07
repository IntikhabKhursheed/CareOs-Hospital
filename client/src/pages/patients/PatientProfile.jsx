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
      <div className="min-h-screen bg-[var(--bg-primary)] p-8">
        <div className="animate-pulse rounded-xl bg-[var(--bg-card)] p-8 shadow-sm border border-[var(--border)]">
          <div className="h-8 w-56 rounded bg-[var(--bg-secondary)]" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-[var(--bg-secondary)]" />
            <div className="h-24 rounded-xl bg-[var(--bg-secondary)]" />
            <div className="h-24 rounded-xl bg-[var(--bg-secondary)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Patient profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">{patient?.name || 'Patient details'}</h1>
              <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Complete clinical history, contact details and active care notes are displayed below.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">MRH</p>
              <p className="mt-2 text-xl text-[var(--text-primary)]">{patient?.MRH || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Date of birth</p>
              <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Phone</p>
              <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{patient?.phone || '—'}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Email</p>
              <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{patient?.email || '—'}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Medical summary</h2>
            <p className="mt-4 text-[var(--text-secondary)]">Allergies</p>
            <p className="mt-2 text-[var(--text-primary)]">{patient?.allergies?.length ? patient.allergies.join(', ') : 'None'}</p>
            <p className="mt-4 text-[var(--text-secondary)]">Chronic conditions</p>
            <p className="mt-2 text-[var(--text-primary)]">{patient?.chronicConditions?.length ? patient.chronicConditions.join(', ') : 'None'}</p>
          </div>

          <div className="lg:col-span-2 grid gap-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Appointment history</h3>
              {history.appointments.length ? (
                <ul className="mt-4 space-y-4">
                  {history.appointments.map((appointment) => (
                    <li key={appointment._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="font-medium text-[var(--text-primary)]">{new Date(appointment.date).toLocaleDateString()} • {appointment.timeSlot}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Status: {appointment.status.replace('_', ' ')}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[var(--text-secondary)]">No appointment records found.</p>
              )}
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Visit records</h3>
              {history.visits.length ? (
                <ul className="mt-4 space-y-4">
                  {history.visits.map((visit) => (
                    <li key={visit._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="font-medium text-[var(--text-primary)]">{new Date(visit.createdAt).toLocaleDateString()}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Complaint: {visit.chiefComplaint || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[var(--text-secondary)]">No visit records found.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientProfile;
