import { useState } from 'react';
import appointmentService from '../../services/appointmentService';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.patient || !formData.doctor || !formData.date || !formData.timeSlot) {
      setError('Patient, doctor, date and time slot are required.');
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl rounded-[40px] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Schedule appointment</h1>
        <p className="mt-2 text-slate-600">Enter the appointment details to create a patient visit slot.</p>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Patient ID</span>
              <input name="patient" value={formData.patient} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Patient ObjectId" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Doctor ID</span>
              <input name="doctor" value={formData.doctor} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Doctor ObjectId" required />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input name="date" value={formData.date} onChange={handleChange} type="date" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Time slot</span>
              <input name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="09:00 AM" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Type</span>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                <option value="new">New</option>
                <option value="followup">Follow-up</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Branch</span>
            <input name="branch" value={formData.branch} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Clinic branch name" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Chief complaint</span>
            <textarea name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} rows="3" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Patient complaint details" />
          </label>
          {error && <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {success && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          <button type="submit" disabled={loading} className="rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50">
            {loading ? 'Scheduling...' : 'Create appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
