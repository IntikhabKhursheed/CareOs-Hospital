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
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Lab operations</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">Monitor laboratory queue</h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Track pending tests, prioritize urgent orders, and submit results with one workflow.</p>
        </div>
        <a href="/lab/result" className="btn-primary inline-flex items-center justify-center">
          Enter results
        </a>
      </div>

      <section className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1 shadow-sm">
        <table className="min-w-full text-left text-sm text-[var(--text-secondary)]">
          <thead className="border-b border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)]">
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
                  <tr key={idx} className="border-b border-[var(--border)]">
                    <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-12 rounded bg-[var(--bg-secondary)]" /></td>
                  </tr>
                ))
              : queue.map((item) => (
                  <tr key={item._id} className="border-b border-[var(--border)] hover:bg-[var(--sidebar-active)] transition">
                    <td className="px-5 py-5 font-semibold text-[var(--text-primary)]">{item._id.slice(-6)}</td>
                    <td className="px-5 py-5 text-[var(--text-secondary)]">{item.patient?.name || 'Unknown'}</td>
                    <td className="px-5 py-5 capitalize text-[var(--text-secondary)]">{item.priority}</td>
                    <td className="px-5 py-5 capitalize text-[var(--text-secondary)]">{item.status}</td>
                    <td className="px-5 py-5 text-[var(--text-secondary)]">{item.isCritical ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LabQueue;
