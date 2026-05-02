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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Lab result entry</h1>
          <p className="mt-2 text-slate-600">Enter or verify result data for the selected lab order.</p>
        </div>
        <div className="space-x-3">
          <a href="/lab" className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Back to queue</a>
          <button
            onClick={handleVerify}
            disabled={verified || loading}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verified ? 'Verified' : 'Verify now'}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-semibold text-slate-700">Lab order ID</label>
        <div className="mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900">{orderId || 'No order selected'}</div>

        <label className="mt-6 block text-sm font-semibold text-slate-700">Result payload</label>
        <textarea
          value={results}
          onChange={(e) => setResults(e.target.value)}
          rows={10}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-primary"
          placeholder="Use format: Test name: value"
        />

        <button
          onClick={handleSave}
          disabled={!results.trim() || loading}
          className="mt-6 rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save results
        </button>
      </div>
    </div>
  );
};

export default ResultEntry;
