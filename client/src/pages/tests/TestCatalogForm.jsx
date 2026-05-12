import { useState, useEffect } from 'react';
import { navigateTo } from '../../utils/navigation';
import testService from '../../services/testService';

import {
  FlaskConical, ArrowLeft, Loader2, CheckCircle2,
  AlertCircle, Plus, X, Clock
} from 'lucide-react';

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
        <ArrowLeft size={14} className="rotate-90" />
      </div>
    </div>
  </div>
);

const ParameterRow = ({ parameter, index, onChange, onRemove }) => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <InputField
        label="Parameter Name"
        value={parameter.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        placeholder="e.g., Hemoglobin"
      />
      <InputField
        label="Unit"
        value={parameter.unit}
        onChange={(e) => onChange(index, 'unit', e.target.value)}
        placeholder="e.g., g/dL"
      />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <InputField
        label="Normal Range (Male)"
        value={parameter.normalRangeMale}
        onChange={(e) => onChange(index, 'normalRangeMale', e.target.value)}
        placeholder="e.g., 13.5-17.5"
      />
      <InputField
        label="Normal Range (Female)"
        value={parameter.normalRangeFemale}
        onChange={(e) => onChange(index, 'normalRangeFemale', e.target.value)}
        placeholder="e.g., 12.0-16.0"
      />
      <InputField
        label="Normal Range (Child)"
        value={parameter.normalRangeChild}
        onChange={(e) => onChange(index, 'normalRangeChild', e.target.value)}
        placeholder="e.g., 11.0-16.0"
      />
    </div>
    <button
      onClick={() => onRemove(index)}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
    >
      <X size={16} />
      Remove Parameter
    </button>
  </div>
);

export default function TestCatalogForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    testCode: '',
    testName: '',
    category: '',
    department: 'Laboratory',
    sampleType: 'None',
    price: '',
    turnaroundHours: 4,
    preparationInstructions: '',
    parameters: []
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('id');
    if (testId) {
      setIsEditing(true);
      setLoading(true);
      testService.getTestById(testId)
        .then(res => {
          const test = res.data;
          setFormData({
            testCode: test.testCode || '',
            testName: test.testName || '',
            category: test.category || '',
            department: test.department || 'Laboratory',
            sampleType: test.sampleType || 'None',
            price: test.price || '',
            turnaroundHours: test.turnaroundHours || 4,
            preparationInstructions: test.preparationInstructions || '',
            parameters: test.parameters || []
          });
        })
        .catch(err => {
          setError(err?.response?.data?.message || 'Failed to load test');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const update = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const updateParameter = (index, field, value) => {
    setFormData(p => ({
      ...p,
      parameters: p.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const addParameter = () => {
    setFormData(p => ({
      ...p,
      parameters: [...p.parameters, {
        name: '',
        unit: '',
        normalRangeMale: '',
        normalRangeFemale: '',
        normalRangeChild: ''
      }]
    }));
  };

  const removeParameter = (index) => {
    setFormData(p => ({
      ...p,
      parameters: p.parameters.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.testCode || !formData.testName || !formData.category || !formData.price) {
      setError('Test Code, Name, Category, and Price are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await testService.updateTest(new URLSearchParams(window.location.search).get('id'), formData);
      } else {
        await testService.createTest(formData);
      }
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8">
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {isEditing ? 'Test Updated' : 'Test Created'}
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            The test has been {isEditing ? 'updated' : 'created'} successfully.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => { setSuccess(false); window.location.href = '/tests/new'; }} 
              className="flex-1 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--sidebar-active)] text-[var(--text-primary)] font-semibold rounded-xl transition-colors"
            >
              Add Another
            </button>
            <button 
              onClick={() => navigateTo('/tests')} 
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              View Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigateTo('/tests')}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to tests
          </button>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                {isEditing ? 'Edit Test' : 'New Test'}
              </p>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                {isEditing ? 'Update Test Details' : 'Create New Test'}
              </h1>
              <p className="text-[var(--text-secondary)] mt-1.5">
                {isEditing ? 'Modify test information and parameters' : 'Add a new laboratory test to the catalog'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-indigo-600">Active</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                  <FlaskConical size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Test Information</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Basic test details and pricing</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <InputField
                  label="Test Code"
                  name="testCode"
                  value={formData.testCode}
                  onChange={update}
                  placeholder="e.g., CBC"
                  required
                />
                <InputField
                  label="Test Name"
                  name="testName"
                  value={formData.testName}
                  onChange={update}
                  placeholder="e.g., Complete Blood Count"
                  required
                />
                <SelectField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={update}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Serology">Serology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Urine">Urine</option>
                  <option value="Stool">Stool</option>
                </SelectField>
                <SelectField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={update}
                >
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Cardiology">Cardiology</option>
                </SelectField>
                <SelectField
                  label="Sample Type"
                  name="sampleType"
                  value={formData.sampleType}
                  onChange={update}
                >
                  <option value="None">None</option>
                  <option value="Blood">Blood</option>
                  <option value="Urine">Urine</option>
                  <option value="Stool">Stool</option>
                  <option value="Sputum">Sputum</option>
                  <option value="Swab">Swab</option>
                  <option value="Tissue">Tissue</option>
                </SelectField>
                <div className="relative">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                    Price (PKR)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                      <span className="text-sm font-medium">₨</span>
                    </div>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={update}
                      placeholder="1500"
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                    Turnaround Hours
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                      <Clock size={15} />
                    </div>
                    <input
                      name="turnaroundHours"
                      type="number"
                      value={formData.turnaroundHours}
                      onChange={update}
                      placeholder="4"
                      min="1"
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Preparation Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em] mb-2">
                  Preparation Instructions
                </label>
                <textarea
                  name="preparationInstructions"
                  value={formData.preparationInstructions}
                  onChange={update}
                  placeholder="Enter any special instructions for patients..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] hover:border-slate-300 transition-all duration-200 resize-none"
                />
              </div>

              {/* Parameters Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.08em]">
                    Test Parameters
                  </label>
                  <button
                    type="button"
                    onClick={addParameter}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Add Parameter
                  </button>
                </div>

                {formData.parameters.map((parameter, index) => (
                  <ParameterRow
                    key={index}
                    parameter={parameter}
                    index={index}
                    onChange={updateParameter}
                    onRemove={removeParameter}
                  />
                ))}

                {formData.parameters.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
                    No parameters added. Click "Add Parameter" to include test reference ranges.
                  </div>
                )}
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
                <FlaskConical size={13} className="text-indigo-500" />
                <span>
                  {isEditing ? 'Changes will be saved immediately' : 'Test will be available for booking'}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-indigo-200 active:scale-95 disabled:opacity-60"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {loading ? 'Saving...' : (isEditing ? 'Update Test' : 'Create Test')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
