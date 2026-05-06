import { useEffect, useMemo, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import labService from '../../services/labService';

const ResultEntry = () => {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const orderId = query.get('id');
  const [results, setResults] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await labService.getLabQueue();
        const order = response.data.find((item) => item._id === orderId);
        if (order && order.results?.length) {
          setResults(order.results.map((r) => `${r.test}: ${r.value} ${r.unit || ''}`).join('\n'));
          setVerified(order.isVerified);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const handleSave = async () => {
    if (!orderId) {
      toast.error('Missing lab order id in URL');
      return;
    }
    setLoading(true);
    try {
      await labService.updateResults(orderId, { results: results.split('\n').map((line) => ({ test: line.split(':')[0]?.trim(), value: line.split(':')[1]?.trim() })) });
      toast.success('Lab results saved');
    } catch (error) {
      console.error(error);
      toast.error('Unable to save results');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      await labService.verifyResults(orderId, { verified: true });
      setVerified(true);
      toast.success('Lab results verified');
    } catch (error) {
      console.error(error);
      toast.error('Unable to verify results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-100">
      <Toaster position="top-right" />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Lab results</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Verify and save order data</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Use the lab result editor to record findings and confirm verification status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/lab" className="btn-secondary inline-flex items-center justify-center">
            Back to queue
          </a>
          <button
            onClick={handleVerify}
            disabled={verified || loading}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verified ? 'Verified' : 'Verify now'}
          </button>
        </div>
      </div>

      <section className="card-glass rounded-3xl border border-slate-800 p-8 shadow-2xl shadow-slate-950/20">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Lab order ID</p>
            <div className="mt-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200">{orderId || 'No order selected'}</div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Verification</p>
            <p className="mt-2 text-slate-400">Mark results verified after review and sign-off.</p>
            <div className="mt-4 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{verified ? 'Verified' : 'Pending'}</div>
          </div>
        </div>

        <label className="mt-8 block text-sm uppercase tracking-[0.2em] text-slate-500">Result payload</label>
        <textarea
          value={results}
          onChange={(e) => setResults(e.target.value)}
          rows={12}
          className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-100 outline-none transition focus:border-primary"
          placeholder="Use format: Test name: value"
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <p className="text-sm text-slate-400">Save result data once it reflects the completed lab findings.</p>
          <button
            onClick={handleSave}
            disabled={!results.trim() || loading}
            className="btn-primary w-full sm:w-auto"
          >
            Save results
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResultEntry;
