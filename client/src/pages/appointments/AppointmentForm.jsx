import { useState, useEffect } from 'react';
import { navigateTo } from '../../utils/navigation';

import {
  Calendar, Clock, User, MapPin, MessageSquare,
  Stethoscope, ArrowLeft, Loader2, CheckCircle2,
  AlertCircle, ChevronRight, Zap
} from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';
import doctorService from '../../services/doctorService';

const typeConfig = {
  new: { label: 'New Visit', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  followup: { label: 'Follow-up', color: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

export default function AppointmentForm() {
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedType, setSelectedType] = useState('new');

  const [formData, setFormData] = useState({
    patient: '', doctor: '', date: '', timeSlot: '09:00',
    type: 'new', branch: '', chiefComplaint: '',
  });

  useEffect(() => {
    patientService.getPatients({ limit: 100 })
      .then(res => setPatients(res.data?.patients || res.data?.data?.patients || []))
      .catch(() => {});
    doctorService.getDoctors({ limit: 100 })
      .then(res => setDoctors(res.data?.doctors || []))
      .catch(() => {});
  }, []);

  const update = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === 'type') setSelectedType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.date) {
      setError('Patient and date are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      if (!payload.doctor || payload.doctor.trim() === '') {
        delete payload.doctor;
      }
      await appointmentService.createAppointment(payload);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create appointment.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8">
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-sky-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Appointment Booked</h2>
          <p className="text-[var(--text-secondary)] mb-8">The appointment has been scheduled successfully.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setFormData({ patient:'', doctor:'', date:'', timeSlot:'09:00', type:'new', branch:'', chiefComplaint:'' }); }}
              className="flex-1 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--sidebar-active)] text-[var(--text-primary)] font-semibold rounded-xl transition-colors"
            >
              Book Another
            </button>
            <button
              onClick={() => navigateTo('/appointments')}
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-colors"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigateTo('/appointments')}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to appointments
          </button>
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">New Appointment</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Book a Visit</h1>
          <p className="text-[var(--text-secondary)] mt-1.5">Schedule a consultation for your patient</p>
        </div>

        {/* Appointment Type Selector */}
        <div className="mb-6">
          <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-3">Appointment Type</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(typeConfig).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setSelectedType(key); setFormData(p => ({ ...p, type: key })); }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                  selectedType === key
                    ? `${val.color} border-current shadow-sm scale-[1.02]`
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${selectedType === key ? val.dot : 'bg-slate-300'}`} />
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-600 rounded-2xl flex items-center justify-center">
                  <Stethoscope size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Appointment Details</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Fill in the consultation information</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-5">

              {/* Patient Select */}
              <div className="group">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                  Patient *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors pointer-events-none">
                    <User size={15} />
                  </div>
                  <select
                    name="patient" value={formData.patient} onChange={update} required
                    className="w-full pl-10 pr-10 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] appearance-none cursor-pointer focus:outline-none focus:border-sky-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)] hover:border-slate-300 transition-all duration-200"
                  >
                    <option value="">Select a patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name} — {p.MRH}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Doctor Select */}
              <div className="group">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                  Assign Doctor
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors pointer-events-none">
                    <Stethoscope size={15} />
                  </div>
                  <select
                    name="doctor" value={formData.doctor} onChange={update}
                    className="w-full pl-10 pr-10 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] appearance-none cursor-pointer focus:outline-none focus:border-sky-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)] hover:border-slate-300 transition-all duration-200"
                  >
                    <option value="">Select a doctor (optional)</option>
                    {doctors.length > 0
                      ? doctors.map(d => (
                          <option key={d._id} value={d._id}>
                            Dr. {d.user?.name || 'Unknown'}{d.specialization ? ` — ${d.specialization}` : ''}{d.department ? ` (${d.department})` : ''}
                          </option>
                        ))
                      : <option disabled>No doctors found — add doctors first</option>
                    }
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
                {doctors.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-500">No doctors registered yet. You can assign one later.</p>
                )}
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors pointer-events-none">
                      <Calendar size={15} />
                    </div>
                    <input
                      name="date" type="date" value={formData.date} onChange={update} required
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-sky-500 focus:bg-[var(--bg-card)] hover:border-slate-300 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                    Time Slot
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors pointer-events-none">
                      <Clock size={15} />
                    </div>
                    <input
                      name="timeSlot" type="time" value={formData.timeSlot} onChange={update}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-sky-500 focus:bg-[var(--bg-card)] hover:border-slate-300 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div className="group">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                  Branch / Location
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors pointer-events-none">
                    <MapPin size={15} />
                  </div>
                  <input
                    name="branch" value={formData.branch} onChange={update}
                    placeholder="e.g. Main Clinic, Islamabad Branch"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal focus:outline-none focus:border-sky-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)] hover:border-slate-300 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="group">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                  Chief Complaint
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors pointer-events-none">
                    <MessageSquare size={15} />
                  </div>
                  <textarea
                    name="chiefComplaint" value={formData.chiefComplaint} onChange={update}
                    placeholder="Describe the patient's main reason for this visit..."
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal focus:outline-none focus:border-sky-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)] hover:border-slate-300 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Zap size={13} className="text-amber-500" />
                <span>Patient will be notified automatically</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-sky-200 active:scale-95 disabled:opacity-60"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
