import { useState } from 'react';
import patientService from '../../services/patientService';

const PatientForm = () => {
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
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to register patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl rounded-[40px] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Register patient</h1>
        <p className="mt-2 text-slate-600">Complete the patient registration details below.</p>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input name="name" value={formData.name} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Patient full name" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Date of birth</span>
              <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" required />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Gender</span>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" required>
                <option value="">Choose gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Blood group</span>
              <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="A+, O-, etc." />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Patient contact number" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input name="email" value={formData.email} onChange={handleChange} type="email" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Patient email" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Address</span>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Residential address" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Emergency contact</span>
              <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Contact name or phone" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Photo URL</span>
              <input name="photo" value={formData.photo} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Optional photo URL" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Allergies</span>
              <input name="allergies" value={formData.allergies} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Comma-separated list" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Chronic conditions</span>
              <input name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Comma-separated list" />
            </label>
          </div>
          {error && <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {success && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          <button type="submit" disabled={loading} className="rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50">
            {loading ? 'Saving patient...' : 'Register patient'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
