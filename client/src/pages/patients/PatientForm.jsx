import { useState } from 'react';
import { navigateTo } from '../../utils/navigation';

import { 
  User, Calendar, Phone, Mail, MapPin, Heart, 
  AlertCircle, Users, ChevronRight, Check, 
  ArrowLeft, Loader2, CheckCircle2
} from 'lucide-react';
import patientService from '../../services/patientService';

const steps = [
  { id: 1, title: 'Personal', subtitle: 'Basic details', icon: User },
  { id: 2, title: 'Medical', subtitle: 'Health history', icon: Heart },
  { id: 3, title: 'Emergency', subtitle: 'Contact info', icon: Users },
];

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200`}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, children, ...props }) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200`}
      >
        {children}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronRight size={14} className="rotate-90" />
      </div>
    </div>
  </div>
);

const TextareaField = ({ label, icon: Icon, ...props }) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200 resize-none`}
      />
    </div>
  </div>
);

export default function PatientForm() {
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', dateOfBirth: '', gender: '', bloodGroup: '',
    phone: '', email: '', address: '',
    allergies: '', chronicConditions: '',
    emergencyContact: '', emergencyPhone: '', emergencyRelationship: '',
  });

  const update = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.name || !formData.dateOfBirth || !formData.gender) {
      setError('Name, date of birth, and gender are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await patientService.createPatient({
        ...formData,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setFormData({ name:'',dateOfBirth:'',gender:'',bloodGroup:'',phone:'',email:'',address:'',allergies:'',chronicConditions:'',emergencyContact:'',emergencyPhone:'',emergencyRelationship:'' });
    setStep(1);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Registered</h2>
          <p className="text-slate-500 mb-8">The patient record has been created successfully.</p>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
              Add Another
            </button>
            <button onClick={() => navigateTo('/patients')} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
              View Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900 p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <button onClick={() => navigateTo('/patients')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to patients
          </button>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">New Patient</p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Register Patient</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5">Complete all three steps to create the record</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-indigo-600">Step {step} of 3</span>
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
                  <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'}`}>
                    {isDone ? <Check size={18} className="text-white" strokeWidth={2.5} /> : <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />}
                    {isActive && <div className="absolute inset-0 rounded-2xl bg-indigo-400 animate-ping opacity-20" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-bold leading-tight ${isActive ? 'text-slate-900 dark:text-white' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{s.title}</p>
                    <p className="text-[11px] text-slate-400">{s.subtitle}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className={`px-8 py-5 border-b border-slate-100 dark:border-slate-700 ${step === 1 ? 'bg-gradient-to-r from-indigo-50 to-purple-50/50' : step === 2 ? 'bg-gradient-to-r from-rose-50 to-orange-50/50' : 'bg-gradient-to-r from-emerald-50 to-teal-50/50'}`}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {step === 1 ? '👤 Personal Information' : step === 2 ? '🏥 Medical History' : '🆘 Emergency Contact'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 1 ? "Patient's basic identification and contact details" : step === 2 ? 'Allergies, conditions, and medical background' : 'Who to contact in case of emergency'}
            </p>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <InputField label="Full Name *" name="name" value={formData.name} onChange={update} icon={User} placeholder="Enter patient's full name" required />
                </div>
                <InputField label="Date of Birth *" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={update} icon={Calendar} required />
                <SelectField label="Gender *" name="gender" value={formData.gender} onChange={update} icon={User}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>
                <div className="col-span-2">
                  <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={update} icon={Heart}>
                    <option value="">Select blood group</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </SelectField>
                </div>
                <div className="col-span-2">
                  <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={update} icon={Phone} placeholder="+92 300 1234567" />
                </div>
                <div className="col-span-2">
                  <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={update} icon={Mail} placeholder="patient@example.com" />
                </div>
                <div className="col-span-2">
                  <TextareaField label="Residential Address" name="address" value={formData.address} onChange={update} icon={MapPin} placeholder="Street, City, Province" rows={3} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">Enter multiple items separated by commas.</p>
                </div>
                <TextareaField label="Known Allergies" name="allergies" value={formData.allergies} onChange={update} icon={AlertCircle} placeholder="Penicillin, Sulfa drugs, Latex..." rows={4} />
                <TextareaField label="Chronic Conditions" name="chronicConditions" value={formData.chronicConditions} onChange={update} icon={Heart} placeholder="Diabetes, Hypertension, Asthma..." rows={4} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
                  <Users size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700">This person will be contacted in medical emergencies.</p>
                </div>
                <InputField label="Contact Full Name" name="emergencyContact" value={formData.emergencyContact} onChange={update} icon={User} placeholder="Emergency contact's full name" />
                <InputField label="Contact Phone" name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={update} icon={Phone} placeholder="+92 300 1234567" />
                <SelectField label="Relationship" name="emergencyRelationship" value={formData.emergencyRelationship} onChange={update} icon={Users}>
                  <option value="">Select relationship</option>
                  {['Spouse','Parent','Child','Sibling','Friend','Guardian','Other'].map(r => <option key={r} value={r}>{r}</option>)}
                </SelectField>
              </div>
            )}

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all">
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <div className="flex gap-1.5">
                {steps.map(s => (
                  <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${step === s.id ? 'w-6 bg-indigo-600' : step > s.id ? 'w-3 bg-emerald-400' : 'w-3 bg-slate-200 dark:bg-slate-600'}`} />
                ))}
              </div>
            </div>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-indigo-200 active:scale-95">
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {loading ? 'Registering...' : 'Register Patient'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
