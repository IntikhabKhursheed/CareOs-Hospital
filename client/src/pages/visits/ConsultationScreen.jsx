import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronLeft, Sparkles, Stethoscope, Pill, Activity } from 'lucide-react';
import patientService from '../../services/patientService';
import aiService from '../../services/aiService';
import { navigateTo } from '../../utils/navigation';

const ConsultationScreen = () => {
  const patientId = window.location.pathname.split('/').pop();
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({ bp: '', temperature: '', pulse: '', oxygenSat: '', weight: '', sugarLevel: '' });

  const [noteLoading, setNoteLoading] = useState(false);
  const [noteResult, setNoteResult] = useState('');

  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState(null);

  const [drugInput, setDrugInput] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [drugLoading, setDrugLoading] = useState(false);
  const [drugResult, setDrugResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!patientId) return;
      try {
        const res = await patientService.getPatientById(patientId);
        setPatient(res.data);
      } catch (e) { console.error(e); }
      finally { setLoadingPatient(false); }
    };
    load();
  }, [patientId]);

  const handleGenerateNote = async () => {
    setNoteLoading(true);
    try {
      const res = await aiService.generateClinicalNote({
        chiefComplaint,
        symptoms,
        vitalSigns: vitals,
        patientHistory: { allergies: patient?.allergies || [], chronicConditions: patient?.chronicConditions || [] }
      });
      setNoteResult(res.data?.note || res.message || JSON.stringify(res.data));
    } catch (e) { console.error(e); setNoteResult('Failed to generate note.'); }
    finally { setNoteLoading(false); }
  };

  const handleDiagnosis = async () => {
    setDiagLoading(true);
    try {
      const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '';
      const res = await aiService.suggestDiagnosis({
        symptoms,
        vitalSigns: vitals,
        patientAge: age,
        patientGender: patient?.gender || '',
        conditions: patient?.chronicConditions || []
      });
      setDiagResult(res.data || res.message || JSON.stringify(res.data));
    } catch (e) { console.error(e); setDiagResult({ error: 'Failed to get diagnosis suggestions.' }); }
    finally { setDiagLoading(false); }
  };

  const addDrug = () => {
    if (!drugInput.trim()) return;
    setMedicines((prev) => [...prev, drugInput.trim()]);
    setDrugInput('');
  };

  const removeDrug = (idx) => setMedicines((prev) => prev.filter((_, i) => i !== idx));

  const handleDrugCheck = async () => {
    if (!medicines.length) return;
    setDrugLoading(true);
    try {
      const res = await aiService.checkDrugInteraction({ medicines });
      setDrugResult(res.data || res.message || JSON.stringify(res.data));
    } catch (e) { console.error(e); setDrugResult({ error: 'Failed to check interactions.' }); }
    finally { setDrugLoading(false); }
  };

  const hasWarnings = (patient?.allergies?.length || 0) > 0 || (patient?.chronicConditions?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <button onClick={() => navigateTo('/patients')} className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">
        <ChevronLeft size={16} /> Back to patients
      </button>

      {loadingPatient ? (
        <div className="space-y-4">
          <div className="h-24 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 animate-pulse"><div className="h-6 w-48 rounded bg-[var(--bg-secondary)]" /></div>
          <div className="grid gap-4 md:grid-cols-2"><div className="h-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" /><div className="h-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" /></div>
        </div>
      ) : patient ? (
        <>
          {/* Patient header */}
          <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{patient.name}</h1>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 font-medium">MRH: {patient.MRH || 'N/A'}</span>
                  <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1">{patient.gender || '—'}</span>
                  <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1">{patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() + ' yrs' : '—'}</span>
                  <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1">{patient.bloodGroup || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          {hasWarnings && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-800">
                {(patient.allergies?.length || 0) > 0 && <p><strong>Allergies:</strong> {patient.allergies.join(', ')}</p>}
                {(patient.chronicConditions?.length || 0) > 0 && <p className="mt-1"><strong>Chronic conditions:</strong> {patient.chronicConditions.join(', ')}</p>}
              </div>
            </div>
          )}

          {/* 2x2 Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Section 1 — Vitals */}
            <div className="rounded-xl border border-sky-200 bg-[var(--bg-card)] shadow-sm">
              <div className="flex items-center gap-2 rounded-t-xl bg-sky-50 px-4 py-3 border-b border-sky-200">
                <Activity size={18} className="text-sky-600" />
                <h2 className="text-sm font-semibold text-sky-700">Vitals & Chief Complaint</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">Chief Complaint</label>
                  <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-sky-400" placeholder="Enter chief complaint" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ k: 'bp', l: 'BP (mmHg)' }, { k: 'temperature', l: 'Temp (°C)' }, { k: 'pulse', l: 'Pulse (bpm)' }, { k: 'oxygenSat', l: 'SpO2 (%)' }, { k: 'weight', l: 'Weight (kg)' }, { k: 'sugarLevel', l: 'Sugar (mg/dL)' }].map(({ k, l }) => (
                    <div key={k}>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">{l}</label>
                      <input type="text" value={vitals[k]} onChange={(e) => setVitals((p) => ({ ...p, [k]: e.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-2 text-sm text-[var(--text-primary)] outline-none focus:border-sky-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2 — AI Clinical Note */}
            <div className="rounded-xl border border-indigo-200 bg-[var(--bg-card)] shadow-sm">
              <div className="flex items-center gap-2 rounded-t-xl bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                <Sparkles size={18} className="text-indigo-600" />
                <h2 className="text-sm font-semibold text-indigo-700">AI Clinical Note</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">Symptoms</label>
                  <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-400" placeholder="Describe symptoms" />
                </div>
                <button onClick={handleGenerateNote} disabled={noteLoading} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {noteLoading ? 'Generating...' : 'Generate Clinical Note with AI'}
                </button>
                {noteResult && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                    <textarea value={noteResult} onChange={(e) => setNoteResult(e.target.value)} rows={6} className="w-full bg-transparent text-sm text-slate-700 outline-none resize-y" />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3 — AI Diagnosis */}
            <div className="rounded-xl border border-emerald-200 bg-[var(--bg-card)] shadow-sm">
              <div className="flex items-center gap-2 rounded-t-xl bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                <Stethoscope size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-emerald-700">AI Diagnosis Suggestions</h2>
              </div>
              <div className="p-4 space-y-4">
                <button onClick={handleDiagnosis} disabled={diagLoading} className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                  {diagLoading ? 'Analyzing...' : 'Get AI Diagnosis Suggestions'}
                </button>
                {diagResult && (
                  <div className="space-y-3">
                    {diagResult.urgency && (
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${diagResult.urgency === 'high' ? 'bg-red-100 text-red-700' : diagResult.urgency === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        Urgency: {diagResult.urgency}
                      </span>
                    )}
                    {diagResult.differentialDiagnoses && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Differential Diagnoses</p>
                        <ul className="mt-1 space-y-1">
                          {diagResult.differentialDiagnoses.map((d, i) => (
                            <li key={i} className="text-sm text-slate-700">• {d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {diagResult.recommendedTests && (
                      <div className="flex flex-wrap gap-2">
                        {diagResult.recommendedTests.map((t, i) => (
                          <span key={i} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{t}</span>
                        ))}
                      </div>
                    )}
                    {typeof diagResult === 'string' && <p className="text-sm text-slate-700 whitespace-pre-wrap">{diagResult}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4 — Drug Interaction */}
            <div className="rounded-xl border border-rose-200 bg-[var(--bg-card)] shadow-sm">
              <div className="flex items-center gap-2 rounded-t-xl bg-rose-50 px-4 py-3 border-b border-rose-200">
                <Pill size={18} className="text-rose-600" />
                <h2 className="text-sm font-semibold text-rose-700">Drug Interaction Checker</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <input type="text" value={drugInput} onChange={(e) => setDrugInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDrug()} className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-rose-400" placeholder="Type medicine name" />
                  <button onClick={addDrug} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">Add</button>
                </div>
                {medicines.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medicines.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                        {m}
                        <button onClick={() => removeDrug(i)} className="ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button onClick={handleDrugCheck} disabled={drugLoading || !medicines.length} className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                  {drugLoading ? 'Checking...' : 'Check Drug Interactions'}
                </button>
                {drugResult && (
                  <div className={`rounded-lg border p-3 ${drugResult.safe || (drugResult.interactions && drugResult.interactions.length === 0) ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                    <p className={`text-sm font-medium ${drugResult.safe || (drugResult.interactions && drugResult.interactions.length === 0) ? 'text-emerald-700' : 'text-red-700'}`}>
                      {drugResult.safe || (drugResult.interactions && drugResult.interactions.length === 0) ? 'No interactions detected — safe to prescribe.' : 'Interactions detected!'}
                    </p>
                    {drugResult.interactions && drugResult.interactions.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {drugResult.interactions.map((inter, i) => (
                          <li key={i} className="text-sm text-red-700">• {inter}</li>
                        ))}
                      </ul>
                    )}
                    {typeof drugResult === 'string' && <p className="text-sm text-slate-700 whitespace-pre-wrap">{drugResult}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-6">
            <button onClick={() => navigateTo('/patients')} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Save Consultation
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center text-[var(--text-secondary)]">Patient not found.</div>
      )}
    </div>
  );
};

export default ConsultationScreen;
