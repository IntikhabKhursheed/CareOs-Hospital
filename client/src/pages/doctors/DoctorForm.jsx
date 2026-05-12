import { useState } from 'react';
import { navigateTo } from '../../utils/navigation';
import doctorService from '../../services/doctorService';

import { 
  User, Calendar, Phone, Mail, Stethoscope, CreditCard, Clock, 
  AlertCircle, ChevronRight, Check, 
  ArrowLeft, Loader2, CheckCircle2
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal', subtitle: 'Basic details', icon: User },
  { id: 2, title: 'Professional', subtitle: 'Medical info', icon: Stethoscope },
];

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200`}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, children, ...props }) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200`}
      >
        {children}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
        <ChevronRight size={14} className="rotate-90" />
      </div>
    </div>
  </div>
);

const AvailabilityCheckbox = ({ day, availability, onChange }) => {
  const dayAvailability = availability.find(a => a.day === day) || { day, isAvailable: false, startTime: '', endTime: '' };
  
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={dayAvailability.isAvailable}
            onChange={(e) => onChange(day, 'isAvailable', e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-[var(--border)] rounded focus:ring-indigo-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">{day}</span>
        </label>
      </div>
      {dayAvailability.isAvailable && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1">Start Time</label>
            <input
              type="time"
              value={dayAvailability.startTime}
              onChange={(e) => onChange(day, 'startTime', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1">End Time</label>
            <input
              type="time"
              value={dayAvailability.endTime}
              onChange={(e) => onChange(day, 'endTime', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function DoctorForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    pmdcNumber: '',
    department: '',
    specialization: '',
    consultationFee: '',
    availability: []
  });

  const update = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const updateAvailability = (day, field, value) => {
    setFormData(prev => {
      const availability = [...prev.availability];
      const existingIndex = availability.findIndex(a => a.day === day);
      
      if (existingIndex >= 0) {
        availability[existingIndex] = { ...availability[existingIndex], [field]: value };
      } else {
        availability.push({ day, [field]: value });
      }
      
      return { ...prev, availability };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.dateOfBirth || !formData.gender || !formData.pmdcNumber || !formData.department || !formData.specialization) {
      setError('All required fields must be completed.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await doctorService.createDoctor(formData);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setFormData({
      name: '', email: '', password: '', phone: '', gender: '', dateOfBirth: '',
      pmdcNumber: '', department: '', specialization: '', consultationFee: '', availability: []
    });
    setStep(1);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8">
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Doctor Registered</h2>
          <p className="text-[var(--text-secondary)] mb-8">The doctor account has been created successfully.</p>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--sidebar-active)] text-[var(--text-primary)] font-semibold rounded-xl transition-colors">
              Add Another
            </button>
            <button onClick={() => navigateTo('/doctors')} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
              View Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <button onClick={() => navigateTo('/doctors')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to doctors
          </button>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-1">New Doctor</p>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Register Doctor</h1>
              <p className="text-[var(--text-secondary)] mt-1.5">Complete both steps to create the doctor account</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-[var(--accent)]">Step {step} of 2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-[var(--bg-card)] border-2 border-[var(--border)]'}`}>
                    {isDone ? <Check size={18} className="text-white" strokeWidth={2.5} /> : <Icon size={18} className={isActive ? 'text-white' : 'text-[var(--text-secondary)]'} />}
                    {isActive && <div className="absolute inset-0 rounded-2xl bg-indigo-400 animate-ping opacity-20" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-bold leading-tight ${isActive ? 'text-[var(--text-primary)]' : isDone ? 'text-emerald-600' : 'text-[var(--text-secondary)]'}`}>{s.title}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{s.subtitle}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 ${step > s.id ? 'bg-emerald-400' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className={`px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]`}>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {step === 1 ? '👤 Personal Information' : '🩺 Professional Details'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {step === 1 ? "Doctor's basic identification and contact details" : 'Medical specialization and availability schedule'}
            </p>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <InputField label="Full Name *" name="name" value={formData.name} onChange={update} icon={User} placeholder="Enter doctor's full name" required />
                </div>
                <div className="col-span-2">
                  <InputField label="Email Address *" name="email" type="email" value={formData.email} onChange={update} icon={Mail} placeholder="doctor@example.com" required />
                </div>
                <div className="col-span-2">
                  <InputField label="Password *" name="password" type="password" value={formData.password} onChange={update} icon={Mail} placeholder="Enter secure password" required />
                </div>
                <div className="col-span-2">
                  <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={update} icon={Phone} placeholder="+92 300 1234567" />
                </div>
                <SelectField label="Gender *" name="gender" value={formData.gender} onChange={update} icon={User}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>
                <InputField label="Date of Birth *" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={update} icon={Calendar} required />
                <div className="col-span-2">
                  <InputField label="PMDC Number *" name="pmdcNumber" value={formData.pmdcNumber} onChange={update} icon={Stethoscope} placeholder="Enter PMDC registration number" required />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <SelectField label="Department *" name="department" value={formData.department} onChange={update} icon={Stethoscope}>
                  <option value="">Select department</option>
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
                </SelectField>

                <div className="col-span-2">
                  <InputField label="Specialization *" name="specialization" value={formData.specialization} onChange={update} icon={Stethoscope} placeholder="e.g. Cardiologist, Pediatrician, General Surgeon" required />
                </div>

                <InputField label="Consultation Fee (PKR)" name="consultationFee" type="number" value={formData.consultationFee} onChange={update} icon={CreditCard} placeholder="1500" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-[var(--text-secondary)]" />
                    <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em]">Weekly Availability</label>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <AvailabilityCheckbox
                        key={day}
                        day={day}
                        availability={formData.availability}
                        onChange={updateAvailability}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="px-8 py-5 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border-2 border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-semibold text-sm rounded-xl transition-all">
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <div className="flex gap-1.5">
                {steps.map(s => (
                  <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${step === s.id ? 'w-6 bg-indigo-600' : step > s.id ? 'w-3 bg-emerald-400' : 'w-3 bg-[var(--border)]'}`} />
                ))}
              </div>
            </div>
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-indigo-200 active:scale-95">
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {loading ? 'Registering...' : 'Register Doctor'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
