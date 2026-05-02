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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Lab queue</h1>
          <p className="mt-2 text-slate-600">Review pending lab work, critical orders, and open test requests for your team.</p>
        </div>
        <a href="/lab/result" className="rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Enter results</a>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Critical</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-slate-200">
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-slate-200" /></td>
                  </tr>
                ))
              : queue.map((item) => (
                  <tr key={item._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-4">{item._id.slice(-6)}</td>
                    <td className="px-4 py-4">{item.patient?.name || 'Unknown'}</td>
                    <td className="px-4 py-4 capitalize">{item.priority}</td>
                    <td className="px-4 py-4 capitalize">{item.status}</td>
                    <td className="px-4 py-4">{item.isCritical ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabQueue;
