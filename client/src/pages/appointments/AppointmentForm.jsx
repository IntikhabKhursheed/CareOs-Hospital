import { useEffect, useState } from 'react';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    timeSlot: '',
    type: 'new',
    branch: '',
    chiefComplaint: ''
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const patientResponse = await patientService.getPatients({ page: 1, limit: 100 });
        setPatients(patientResponse.data.patients || []);
      } catch (e) {
        console.error(e);
      }
      try {
        const apptResponse = await appointmentService.getAppointments({ page: 1, limit: 100 });
        const seen = new Map();
        (apptResponse.data.appointments || []).forEach((a) => {
          if (a.doctor?._id && !seen.has(a.doctor._id)) {
            seen.set(a.doctor._id, a.doctor);
          }
        });
        setDoctors(Array.from(seen.values()));
      } catch (e) {
        console.error(e);
      }
    };
    loadOptions();
  }, []);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.patient || !formData.doctor || !formData.date || !formData.timeSlot) {
      setError('Patient, doctor, date, and time slot are required.');
      return;
    }
    if (!isValidObjectId(formData.patient)) {
      setError('Patient must be a valid patient selection.');
      return;
    }
    if (!isValidObjectId(formData.doctor)) {
      setError('Doctor must be a valid 24-character ObjectId.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await appointmentService.createAppointment(formData);
      setSuccess('Appointment created successfully.');
      setFormData({ patient: '', doctor: '', date: '', timeSlot: '', type: 'new', branch: '', chiefComplaint: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="surface rounded-[1.5rem] p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-title">Appointment scheduling</p>
              <h1 className="mt-3 text-4xl font-semibold">Book a new visit</h1>
              <p className="mt-3 text-[var(--text-secondary)]">Create a curated appointment with patient and doctor details in one go.</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">Pro tip</p>
              <p className="mt-2 text-[var(--text-secondary)]">Use patient and doctor IDs from the registry to avoid mismatches.</p>
            </div>
          </div>
        </section>

        <form className="surface mt-6 rounded-[1.5rem] border border-[var(--border)] p-8 shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Patient</span>
              <select name="patient" value={formData.patient} onChange={handleChange} required className="input-field">
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.MRH})</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Doctor</span>
              {doctors.length > 0 ? (
                <select name="doctor" value={formData.doctor} onChange={handleChange} required className="input-field">
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} {d.specialization ? `(${d.specialization})` : ''}</option>
                  ))}
                </select>
              ) : (
                <input name="doctor" value={formData.doctor} onChange={handleChange} required className="input-field" placeholder="Paste 24-char doctor ObjectId" />
              )}
            </label>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Date</span>
              <input name="date" type="date" value={formData.date} onChange={handleChange} required className="input-field" />
            </label>
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Time slot</span>
              <input name="timeSlot" value={formData.timeSlot} onChange={handleChange} required className="input-field" placeholder="09:00 AM" />
            </label>
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Type</span>
              <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                <option value="new">New</option>
                <option value="followup">Follow-up</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Branch</span>
              <input name="branch" value={formData.branch} onChange={handleChange} className="input-field" placeholder="Clinic branch" />
            </label>
            <label className="block text-sm text-[var(--text-primary)]">
              <span className="mb-2 block">Chief complaint</span>
              <textarea name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} rows="3" className="input-field" placeholder="Describe patient complaint" />
            </label>
          </div>

          {error && <div className="mt-6 rounded-[1.5rem] bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</div>}
          {success && <div className="mt-6 rounded-[1.5rem] bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{success}</div>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-secondary)]">All fields marked required must be completed before saving.</p>
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? 'Scheduling...' : 'Create appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
