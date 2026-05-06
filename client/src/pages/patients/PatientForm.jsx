import { useState } from 'react';
import patientService from '../../services/patientService';

const steps = [
  { id: 1, title: 'Basic info' },
  { id: 2, title: 'Medical info' },
  { id: 3, title: 'Emergency contact' }
];

const PatientForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    chronicConditions: '',
    photo: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const nextStep = () => setStep((current) => Math.min(current + 1, steps.length));
  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.dateOfBirth || !formData.gender) {
      setError('Name, date of birth, and gender are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies.split(',').map((item) => item.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map((item) => item.trim()).filter(Boolean)
      };
      await patientService.createPatient(payload);
      setSuccess('Patient registered successfully.');
      setFormData({ name: '', dateOfBirth: '', gender: '', bloodGroup: '', phone: '', email: '', address: '', emergencyContact: '', allergies: '', chronicConditions: '', photo: '' });
      setStep(1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to register patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Patient registration</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">Add a new patient</h1>
          <p className="mt-3 text-[var(--text-secondary)]">Complete the registration in three quick steps. Your data is saved securely.</p>

          <div className="mt-8 flex items-center gap-3">
            {steps.map((item) => (
              <div key={item.id} className="flex-1">
                <div className={`mb-2 h-2 rounded-full ${step >= item.id ? 'bg-gradient-to-r from-indigo-500 to-sky-500' : 'bg-[var(--bg-secondary)] border border-[var(--border)]'}`}></div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Step {item.id}</p>
                <p className={`text-sm font-semibold ${step === item.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Quick tips</p>
          <ul className="mt-4 space-y-4 text-[var(--text-secondary)]">
            <li className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-4">Use valid patient info to ensure accurate records.</li>
            <li className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-4">Keep emergency contact details for faster care coordination.</li>
            <li className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-4">Add blood group and allergy information for safety alerts.</li>
          </ul>
        </aside>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Full name</span>
                  <input name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Patient full name" />
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Date of birth</span>
                  <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required className="input-field" />
                </label>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Gender</span>
                  <select name="gender" value={formData.gender} onChange={handleChange} required className="input-field">
                    <option value="">Choose gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Blood group</span>
                  <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field" placeholder="A+, O-, etc." />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Phone</span>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" type="tel" placeholder="+123 456 7890" />
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Email</span>
                  <input name="email" value={formData.email} onChange={handleChange} className="input-field" type="email" placeholder="patient@example.com" />
                </label>
              </div>
              <label className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-2 block">Address</span>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="input-field" placeholder="Patient address" />
              </label>
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Allergies</span>
                  <input name="allergies" value={formData.allergies} onChange={handleChange} className="input-field" placeholder="Comma-separated list" />
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  <span className="mb-2 block">Chronic conditions</span>
                  <input name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} className="input-field" placeholder="Comma-separated list" />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <label className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-2 block">Emergency contact</span>
                <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="input-field" placeholder="Contact name or phone" />
              </label>
              <label className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-2 block">Photo URL</span>
                <input name="photo" value={formData.photo} onChange={handleChange} className="input-field" placeholder="Optional image link" />
              </label>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Step {step} of {steps.length}</span>
              <span className="rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{steps.find((s) => s.id === step)?.title}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
              )}
              {step < steps.length ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  Continue
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Registering...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </div>

          {(error || success) && (
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-primary)]">
              {error ? <span className="text-danger">{error}</span> : <span className="text-success">{success}</span>}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
