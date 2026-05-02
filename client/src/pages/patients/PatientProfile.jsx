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
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="animate-pulse rounded-3xl bg-white p-8 shadow-xl">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-3xl bg-slate-200" />
            <div className="h-24 rounded-3xl bg-slate-200" />
            <div className="h-24 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl rounded-[40px] bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Patient profile</h1>
            <p className="mt-2 text-slate-600">Review the patient record and clinical history.</p>
          </div>
        </div>
        {patient ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">MRH</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{patient.MRH}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Name</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{patient.name}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">DOB</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="mt-2 text-lg text-slate-900">{patient.phone || '—'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-2 text-lg text-slate-900">{patient.email || '—'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-semibold text-slate-900">Medical summary</h2>
              <p className="mt-3 text-slate-700">Allergies: {patient.allergies.length ? patient.allergies.join(', ') : 'None'}</p>
              <p className="mt-2 text-slate-700">Chronic conditions: {patient.chronicConditions.length ? patient.chronicConditions.join(', ') : 'None'}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Appointment history</h3>
                {history.appointments.length ? (
                  <ul className="mt-4 space-y-3">
                    {history.appointments.map((appointment) => (
                      <li key={appointment._id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                        <p className="font-medium text-slate-900">{new Date(appointment.date).toLocaleDateString()} • {appointment.timeSlot}</p>
                        <p className="text-sm text-slate-600">Status: {appointment.status.replace('_', ' ')}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-slate-600">No appointment records found.</p>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Visit records</h3>
                {history.visits.length ? (
                  <ul className="mt-4 space-y-3">
                    {history.visits.map((visit) => (
                      <li key={visit._id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                        <p className="font-medium text-slate-900">{new Date(visit.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-600">Complaint: {visit.chiefComplaint || 'N/A'}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-slate-600">No visit records found.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-600">Patient not found.</p>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
