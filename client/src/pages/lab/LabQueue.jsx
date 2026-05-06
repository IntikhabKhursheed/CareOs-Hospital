import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import labService from '../../services/labService';

const LabQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQueue = async () => {
      setLoading(true);
      try {
        const response = await labService.getLabQueue();
        setQueue(response.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load lab queue');
      } finally {
        setLoading(false);
      }
    };
    loadQueue();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-100">
      <Toaster position="top-right" />
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Lab operations</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Monitor laboratory queue</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Track pending tests, prioritize urgent orders, and submit results with one workflow.</p>
        </div>
        <a href="/lab/result" className="btn-primary inline-flex items-center justify-center">
          Enter results
        </a>
      </div>

      <section className="card-glass overflow-x-auto rounded-3xl border border-slate-800 p-1 shadow-2xl shadow-slate-950/20">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
            <tr>
              <th className="px-5 py-4">Order ID</th>
              <th className="px-5 py-4">Patient</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Critical</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-800">
                    <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-20 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-slate-800" /></td>
                  </tr>
                ))
              : queue.map((item) => (
                  <tr key={item._id} className="border-b border-slate-800 hover:bg-slate-900/70 transition">
                    <td className="px-5 py-5 font-semibold text-slate-100">{item._id.slice(-6)}</td>
                    <td className="px-5 py-5 text-slate-300">{item.patient?.name || 'Unknown'}</td>
                    <td className="px-5 py-5 capitalize text-slate-300">{item.priority}</td>
                    <td className="px-5 py-5 capitalize text-slate-300">{item.status}</td>
                    <td className="px-5 py-5 text-slate-300">{item.isCritical ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LabQueue;
