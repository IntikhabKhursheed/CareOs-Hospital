import { useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import aiService from '../../services/aiService';

const ConsultationScreen = () => {
  const [patientNotes, setPatientNotes] = useState('');
  const [medications, setMedications] = useState('');
  const [labResults, setLabResults] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => patientNotes.trim().length > 10, [patientNotes]);

  const handleAiAction = async (type) => {
    if (!canSubmit) {
      toast.error('Add the patient summary first.');
      return;
    }

    setLoading(true);
    setResponse('');
    try {
      let result;
      if (type === 'note') {
        result = await aiService.generateClinicalNote({ notes: patientNotes });
      } else if (type === 'diagnosis') {
        result = await aiService.suggestDiagnosis({ notes: patientNotes, medications });
      } else if (type === 'interaction') {
        result = await aiService.checkDrugInteraction({ medications });
      }
      setResponse(result.data || result.message || JSON.stringify(result));
      toast.success('AI analysis ready');
    } catch (error) {
      console.error(error);
      toast.error('AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Consultation screen</h1>
          <p className="mt-2 text-slate-600">Use AI-powered assistance to generate notes, diagnosis ideas, and safety checks.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="text-sm font-semibold text-slate-700">Patient summary</label>
            <textarea
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              rows={8}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-primary"
              placeholder="Enter clinical presentation, vitals, background and exam findings"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Current medications</label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-primary"
              placeholder="List current drugs and doses"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Lab summary</label>
            <textarea
              value={labResults}
              onChange={(e) => setLabResults(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-primary"
              placeholder="Paste recent lab results for interpretation"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleAiAction('note')}
              disabled={!canSubmit || loading}
              className="rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate clinical note
            </button>
            <button
              onClick={() => handleAiAction('diagnosis')}
              disabled={!canSubmit || loading}
              className="rounded-3xl border border-primary bg-white px-5 py-3 text-sm font-semibold text-primary transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suggest diagnosis
            </button>
            <button
              onClick={() => handleAiAction('interaction')}
              disabled={!medications.trim() || loading}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check drug interactions
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">AI output</h2>
          <div className="mt-4 min-h-[300px] rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            {loading ? (
              <p className="text-slate-500">Processing AI request...</p>
            ) : response ? (
              <pre className="whitespace-pre-wrap">{response}</pre>
            ) : (
              <p className="text-slate-500">Run a prompt to show recommendations and notes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationScreen;
