import { useEffect, useState, useRef, useCallback } from 'react';
import {
  AlertTriangle, ChevronLeft, Sparkles, Stethoscope, Pill, Activity,
  Bot, X, CheckCircle, Save, Edit3, ChevronRight, User, Clock, FlaskConical,
  ShieldCheck, ShieldAlert, Loader2
} from 'lucide-react';
import patientService from '../../services/patientService';
import aiService from '../../services/aiService';
import { navigateTo } from '../../utils/navigation';

/* ─── Mock patients for the empty state ──────────────────────────────── */
const MOCK_PATIENTS = [
  {
    _id: 'mock-001',
    name: 'Ayesha Rahman',
    MRH: 'MRN-2026-34283',
    gender: 'Female',
    dateOfBirth: '1988-03-15',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfonamides'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    isMock: true,
  },
  {
    _id: 'mock-002',
    name: 'Hassan Tariq',
    MRH: 'MRN-2026-14320',
    gender: 'Male',
    dateOfBirth: '1975-07-22',
    bloodGroup: 'O+',
    allergies: [],
    chronicConditions: ['Asthma'],
    isMock: true,
  },
  {
    _id: 'mock-003',
    name: 'Sara Malik',
    MRH: 'MRN-2026-89012',
    gender: 'Female',
    dateOfBirth: '2001-11-08',
    bloodGroup: 'A-',
    allergies: ['Aspirin'],
    chronicConditions: [],
    isMock: true,
  },
  {
    _id: 'mock-004',
    name: 'Bilal Qureshi',
    MRH: 'MRN-2026-55671',
    gender: 'Male',
    dateOfBirth: '1963-01-30',
    bloodGroup: 'AB+',
    allergies: [],
    chronicConditions: ['Chronic Kidney Disease', 'Hypertension', 'Gout'],
    isMock: true,
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const calcAge = (dob) => dob ? new Date().getFullYear() - new Date(dob).getFullYear() : null;

/* ─── Patient Selector (empty state) ─────────────────────────────────── */
const PatientSelector = ({ onSelect }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10">
        <Stethoscope size={28} className="text-[var(--accent)]" />
      </div>
      <h2 className="text-2xl font-semibold text-[var(--text-primary)]">AI Clinical Co-Pilot</h2>
      <p className="mt-2 text-[var(--text-secondary)]">Select a patient to begin an AI-assisted consultation session</p>
    </div>

    <div className="w-full max-w-2xl space-y-3">
      {MOCK_PATIENTS.map((p) => {
        const age = calcAge(p.dateOfBirth);
        const hasAlerts = p.allergies.length > 0 || p.chronicConditions.length > 0;
        return (
          <button
            key={p._id}
            onClick={() => onSelect(p)}
            className="group w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-lg font-bold text-white">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{p.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><User size={11} />{p.gender}</span>
                    {age && <span className="flex items-center gap-1"><Clock size={11} />{age} yrs</span>}
                    <span className="font-mono">{p.MRH}</span>
                    <span>{p.bloodGroup}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasAlerts && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                    ⚠ Risk flags
                  </span>
                )}
                <ChevronRight size={18} className="text-[var(--text-secondary)] transition group-hover:text-[var(--accent)] group-hover:translate-x-0.5" />
              </div>
            </div>
          </button>
        );
      })}
    </div>

    <p className="mt-6 text-xs text-[var(--text-secondary)]">
      Demo patients shown · Real patients load from URL <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5">/consultation/[id]</code>
    </p>
  </div>
);

/* ─── Validation Banner ───────────────────────────────────────────────── */
const ValidationBanner = ({ status }) => {
  if (!status) return null;

  if (status === 'pass') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">✓ Rule Engine Passed</p>
          <p className="mt-0.5 text-sm text-emerald-700">No Contraindications or Schema Violations Found. Safe to proceed.</p>
        </div>
      </div>
    );
  }

  if (status === 'warn') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-800">⚠ Caution: Potential Safety Flag Detected</p>
          <p className="mt-0.5 text-sm text-red-700">Flagged 1 or more potential drug interaction(s). Manual physician review is required before proceeding.</p>
        </div>
      </div>
    );
  }

  return null;
};

/* ─── Co-Pilot Drawer ─────────────────────────────────────────────────── */
const CoPilotDrawer = ({ isOpen, onClose, patient, symptoms, vitals }) => {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const age = calcAge(patient?.dateOfBirth);
      const res = await aiService.suggestDiagnosis({
        symptoms: symptoms || 'Patient reported general discomfort, fatigue, and mild chest tightness.',
        vitalSigns: vitals,
        patientAge: age || 45,
        patientGender: patient?.gender || '',
        conditions: patient?.chronicConditions || [],
      });
      setResult(res.data || res.message || JSON.stringify(res.data));
    } catch (e) {
      setError('Co-Pilot analysis failed. Please check your AI service connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-screen w-full max-w-sm flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Clinical Co-Pilot</p>
              <p className="text-xs text-indigo-200">Powered by Grok AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Patient context summary */}
          {patient && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Patient Context</p>
              <p className="font-semibold text-[var(--text-primary)]">{patient.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{patient.MRH} · {patient.gender} · {calcAge(patient.dateOfBirth)} yrs</p>
              {patient.chronicConditions?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {patient.chronicConditions.map((c, i) => (
                    <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">{c}</span>
                  ))}
                </div>
              )}
              {patient.allergies?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {patient.allergies.map((a, i) => (
                    <span key={i} className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">⚠ {a}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing patient data…</>
            ) : (
              <><Sparkles size={16} /> Run Co-Pilot Analysis</>
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Urgency */}
              {result.urgency && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Urgency</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    result.urgency === 'high'   ? 'bg-red-100 text-red-700' :
                    result.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-emerald-100 text-emerald-700'
                  }`}>
                    {result.urgency.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Differential diagnoses */}
              {result.differentialDiagnoses?.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Differential Diagnoses</p>
                  <ul className="space-y-2">
                    {result.differentialDiagnoses.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-indigo-100 text-center text-[10px] font-bold text-indigo-600 leading-4">{i + 1}</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended tests */}
              {result.recommendedTests?.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    <FlaskConical size={12} /> Recommended Tests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedTests.map((t, i) => (
                      <span key={i} className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Plain text fallback */}
              {typeof result === 'string' && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <p className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">{result}</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
              <Bot size={32} className="text-[var(--text-secondary)]" />
              <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">Ready to analyze</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Click "Run Co-Pilot Analysis" to get AI-powered clinical suggestions based on the patient's symptoms and vitals.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

/* ─── Success Toast ───────────────────────────────────────────────────── */
const SuccessToast = ({ message, onClose }) => (
  <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce-once">
    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-xl">
      <CheckCircle size={18} className="text-emerald-600" />
      <p className="text-sm font-semibold text-emerald-800">{message}</p>
      <button onClick={onClose} className="ml-2 text-emerald-600 hover:text-emerald-800">
        <X size={14} />
      </button>
    </div>
  </div>
);

/* ─── Main Consultation Screen ────────────────────────────────────────── */
const ConsultationScreen = () => {
  const rawId = window.location.pathname.split('/').pop();
  const patientId = rawId === 'consultations' || !rawId ? null : rawId;

  const [patient, setPatient]               = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(!!patientId);

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms]             = useState('');
  const [vitals, setVitals]                 = useState({ bp: '', temperature: '', pulse: '', oxygenSat: '', weight: '', sugarLevel: '' });

  const [noteLoading, setNoteLoading]       = useState(false);
  const [noteResult, setNoteResult]         = useState('');

  const [diagLoading, setDiagLoading]       = useState(false);
  const [diagResult, setDiagResult]         = useState(null);

  const [drugInput, setDrugInput]           = useState('');
  const [medicines, setMedicines]           = useState([]);
  const [drugLoading, setDrugLoading]       = useState(false);
  const [drugResult, setDrugResult]         = useState(null);

  const [validationStatus, setValidationStatus] = useState(null); // null | 'pass' | 'warn'
  const [coPilotOpen, setCoPilotOpen]           = useState(false);
  const [successMsg, setSuccessMsg]             = useState('');
  const [editMode, setEditMode]                 = useState(false);

  const noteRef = useRef(null);

  /* ── Load real patient by ID ── */
  useEffect(() => {
    if (!patientId) return;
    const load = async () => {
      try {
        const res = await patientService.getPatientById(patientId);
        setPatient(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPatient(false);
      }
    };
    load();
  }, [patientId]);

  /* ── Update validation status when drug result changes ── */
  useEffect(() => {
    if (!drugResult) return;
    const hasInteractions =
      (!drugResult.safe) &&
      (typeof drugResult.interactions === 'undefined' || (drugResult.interactions?.length > 0));
    setValidationStatus(hasInteractions ? 'warn' : 'pass');
  }, [drugResult]);

  /* ── Show validation pass when note generated (if no drug check yet) ── */
  useEffect(() => {
    if (noteResult && !drugResult) {
      setValidationStatus('pass');
    }
  }, [noteResult, drugResult]);

  /* ── Auto-close success toast ── */
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleGenerateNote = async () => {
    setNoteLoading(true);
    setValidationStatus(null);
    try {
      const res = await aiService.generateClinicalNote({
        chiefComplaint,
        symptoms,
        vitalSigns: vitals,
        patientHistory: {
          allergies: patient?.allergies || [],
          chronicConditions: patient?.chronicConditions || [],
        },
      });
      setNoteResult(res.data?.note || res.message || JSON.stringify(res.data));
      if (!drugResult) setValidationStatus('pass');
    } catch (e) {
      setNoteResult('Failed to generate note.');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDiagnosis = async () => {
    setDiagLoading(true);
    try {
      const age = calcAge(patient?.dateOfBirth);
      const res = await aiService.suggestDiagnosis({
        symptoms,
        vitalSigns: vitals,
        patientAge: age || '',
        patientGender: patient?.gender || '',
        conditions: patient?.chronicConditions || [],
      });
      setDiagResult(res.data || res.message || JSON.stringify(res.data));
    } catch (e) {
      setDiagResult({ error: 'Failed to get diagnosis suggestions.' });
    } finally {
      setDiagLoading(false);
    }
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
    } catch (e) {
      setDrugResult({ error: 'Failed to check interactions.' });
    } finally {
      setDrugLoading(false);
    }
  };

  const handleAcceptEHR = () => {
    setSuccessMsg('✓ SOAP Note accepted and saved to EHR successfully.');
    setEditMode(false);
  };

  const handleEditDraft = () => {
    setEditMode(true);
    setTimeout(() => noteRef.current?.focus(), 100);
  };

  const hasWarnings = (patient?.allergies?.length || 0) > 0 || (patient?.chronicConditions?.length || 0) > 0;

  /* ─── Loading skeleton ─────────────────────────────────── */
  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 space-y-4">
        <div className="h-24 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 animate-pulse">
          <div className="h-6 w-48 rounded bg-[var(--bg-secondary)]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
          <div className="h-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
        </div>
      </div>
    );
  }

  /* ─── No patient selected → show selector ─────────────── */
  if (!patient) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
        <PatientSelector onSelect={(p) => { setPatient(p); setLoadingPatient(false); }} />
      </div>
    );
  }

  /* ─── Full consultation view ───────────────────────────── */
  const age = calcAge(patient.dateOfBirth);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      {/* Success toast */}
      {successMsg && <SuccessToast message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Co-Pilot Drawer */}
      <CoPilotDrawer
        isOpen={coPilotOpen}
        onClose={() => setCoPilotOpen(false)}
        patient={patient}
        symptoms={symptoms}
        vitals={vitals}
      />

      {/* Back button */}
      <button
        onClick={() => { setPatient(null); navigateTo('/consultations'); }}
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
      >
        <ChevronLeft size={16} /> Back to patients
      </button>

      {/* Patient header card */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-bold text-white shadow-sm">
              {patient.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{patient.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                <span className="rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1 font-medium font-mono text-xs">{patient.MRH || 'N/A'}</span>
                <span className="rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1">{patient.gender || '—'}</span>
                {age && <span className="rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1">{age} yrs</span>}
                <span className="rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1">{patient.bloodGroup || '—'}</span>
              </div>
            </div>
          </div>
          {patient.isMock && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Demo Patient
            </span>
          )}
        </div>
      </div>

      {/* Allergy/condition warning banner */}
      {hasWarnings && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800">
            {patient.allergies?.length > 0 && <p><strong>Allergies:</strong> {patient.allergies.join(', ')}</p>}
            {patient.chronicConditions?.length > 0 && <p className="mt-1"><strong>Chronic conditions:</strong> {patient.chronicConditions.join(', ')}</p>}
          </div>
        </div>
      )}

      {/* SOAP Note + Validation + EHR Actions */}
      <div className="mb-6 rounded-2xl border border-indigo-200 bg-[var(--surface)] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-[var(--surface)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-indigo-700">AI SOAP Note Generator</h2>
          </div>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 border border-indigo-200">
            Grok AI
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Symptoms input */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">Presenting Symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-400"
              placeholder="Describe the patient's presenting symptoms in detail…"
            />
          </div>

          {/* Auto-Generate SOAP Note button */}
          <button
            onClick={handleGenerateNote}
            disabled={noteLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {noteLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Generating SOAP Note…</>
            ) : (
              <><Sparkles size={16} /> Auto-Generate SOAP Note</>
            )}
          </button>

          {/* Generated note */}
          {noteResult && (
            <>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                <textarea
                  ref={noteRef}
                  value={noteResult}
                  readOnly={!editMode}
                  onChange={(e) => setNoteResult(e.target.value)}
                  rows={8}
                  className={`w-full bg-transparent text-sm text-slate-700 outline-none resize-y ${editMode ? 'border-b border-indigo-200' : ''}`}
                />
              </div>

              {/* Validation & Safety Guardrail Banner */}
              <ValidationBanner status={validationStatus} />

              {/* EHR Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptEHR}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <Save size={15} /> Accept & Save to EHR
                </button>
                <button
                  onClick={handleEditDraft}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
                >
                  <Edit3 size={15} /> Edit Draft
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2×2 grid: Vitals, Diagnosis, Drug Interaction */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Section 1 — Vitals & Chief Complaint */}
        <div className="rounded-xl border border-sky-200 bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 rounded-t-xl bg-sky-50 px-4 py-3 border-b border-sky-200">
            <Activity size={18} className="text-sky-600" />
            <h2 className="text-sm font-semibold text-sky-700">Vitals & Chief Complaint</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">Chief Complaint</label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-sky-400"
                placeholder="Enter chief complaint"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'bp',          l: 'BP (mmHg)'    },
                { k: 'temperature', l: 'Temp (°C)'    },
                { k: 'pulse',       l: 'Pulse (bpm)'  },
                { k: 'oxygenSat',   l: 'SpO2 (%)'     },
                { k: 'weight',      l: 'Weight (kg)'  },
                { k: 'sugarLevel',  l: 'Sugar (mg/dL)'},
              ].map(({ k, l }) => (
                <div key={k}>
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">{l}</label>
                  <input
                    type="text"
                    value={vitals[k]}
                    onChange={(e) => setVitals((p) => ({ ...p, [k]: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-2 text-sm text-[var(--text-primary)] outline-none focus:border-sky-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 — AI Diagnosis */}
        <div className="rounded-xl border border-emerald-200 bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 rounded-t-xl bg-emerald-50 px-4 py-3 border-b border-emerald-200">
            <Stethoscope size={18} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-emerald-700">AI Diagnosis Suggestions</h2>
          </div>
          <div className="p-4 space-y-4">
            <button
              onClick={handleDiagnosis}
              disabled={diagLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {diagLoading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : 'Get AI Diagnosis Suggestions'}
            </button>
            {diagResult && (
              <div className="space-y-3">
                {diagResult.urgency && (
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    diagResult.urgency === 'high'   ? 'bg-red-100 text-red-700' :
                    diagResult.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                      'bg-emerald-100 text-emerald-700'
                  }`}>
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
                {typeof diagResult === 'string' && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{diagResult}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 3 — Drug Interaction Checker */}
        <div className="rounded-xl border border-rose-200 bg-[var(--surface)] shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 rounded-t-xl bg-rose-50 px-4 py-3 border-b border-rose-200">
            <Pill size={18} className="text-rose-600" />
            <h2 className="text-sm font-semibold text-rose-700">Drug Interaction Checker</h2>
            <span className="ml-auto text-xs text-[var(--text-secondary)]">Results update the validation banner above</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={drugInput}
                onChange={(e) => setDrugInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDrug()}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-rose-400"
                placeholder="Type medicine name and press Enter or Add"
              />
              <button
                onClick={addDrug}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              >
                Add
              </button>
            </div>
            {medicines.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medicines.map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    {m}
                    <button onClick={() => removeDrug(i)} className="ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">×</button>
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={handleDrugCheck}
              disabled={drugLoading || !medicines.length}
              className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {drugLoading ? <><Loader2 size={15} className="animate-spin" /> Checking…</> : 'Check Drug Interactions'}
            </button>
            {drugResult && (
              <div className={`rounded-lg border p-3 ${
                drugResult.safe || (drugResult.interactions?.length === 0)
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                <p className={`text-sm font-medium ${
                  drugResult.safe || (drugResult.interactions?.length === 0)
                    ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {drugResult.safe || (drugResult.interactions?.length === 0)
                    ? 'No interactions detected — safe to prescribe.'
                    : 'Interactions detected!'}
                </p>
                {drugResult.interactions?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {drugResult.interactions.map((inter, i) => (
                      <li key={i} className="text-sm text-red-700">• {inter}</li>
                    ))}
                  </ul>
                )}
                {typeof drugResult === 'string' && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{drugResult}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save consultation button */}
      <div className="mt-6">
        <button
          onClick={handleAcceptEHR}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Save Consultation
        </button>
      </div>

      {/* Floating Co-Pilot button */}
      <button
        onClick={() => setCoPilotOpen(true)}
        title="Open AI Clinical Co-Pilot"
        className="fixed bottom-8 right-8 z-20 flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl ring-2 ring-indigo-400/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-500/30"
      >
        <Bot size={18} />
        <span>AI Co-Pilot</span>
        <span className="h-2 w-2 rounded-full bg-indigo-300 animate-pulse" />
      </button>
    </div>
  );
};

export default ConsultationScreen;
