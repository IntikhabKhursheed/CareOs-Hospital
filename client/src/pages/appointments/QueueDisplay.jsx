import { useEffect, useState } from 'react';
import appointmentService from '../../services/appointmentService';

const QueueDisplay = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getTodayQueue();
      setQueue(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Today queue</h1>
        <p className="mt-2 text-slate-600">Live token queue for today&apos;s appointments.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(loading ? Array.from({ length: 3 }) : queue).map((item, idx) => (
          <div key={item?._id || idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Token</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{loading ? '—' : item.tokenNumber}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{loading ? <span className="h-6 w-32 rounded bg-slate-200 inline-block" /> : item.patient?.name}</h2>
            <p className="mt-3 text-sm text-slate-600">Doctor: {loading ? <span className="inline-block h-4 w-24 rounded bg-slate-200" /> : item.doctor?.name}</p>
            <p className="mt-2 text-sm text-slate-600">Status: {loading ? 'Loading…' : item.status.replace('_', ' ')}</p>
            <p className="mt-2 text-sm text-slate-600">Time: {loading ? <span className="inline-block h-4 w-20 rounded bg-slate-200" /> : item.timeSlot}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueDisplay;
