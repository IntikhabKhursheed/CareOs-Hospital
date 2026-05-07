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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-title">Live queue</p>
            <h1 className="mt-3 text-4xl font-semibold">Today&apos;s appointment tokens</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Watch the active patient queue and token progression in real time.</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">Patient flow</p>
            <p className="mt-2 text-[var(--text-secondary)]">Refresh regularly to keep the queue current during the day.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(loading ? Array.from({ length: 3 }) : queue).map((item, idx) => (
            <article key={item?._id || idx} className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Token</p>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-primary)]">{loading ? '—' : item.tokenNumber}</span>
              </div>
              <h2 className="text-2xl font-semibold">{loading ? <span className="h-8 w-40 rounded bg-[var(--bg-secondary)]/60" /> : item.patient?.name || 'Unknown'}</h2>
              <div className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                <p>
                  <span className="font-semibold text-[var(--text-primary)]">Doctor:</span>{' '}
                  {loading ? <span className="inline-block h-4 w-28 rounded bg-[var(--bg-secondary)]/60" /> : item.doctor?.name || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold text-[var(--text-primary)]">Status:</span>{' '}
                  {loading ? 'Loading…' : item.status.replace('_', ' ')}
                </p>
                <p>
                  <span className="font-semibold text-[var(--text-primary)]">Time:</span>{' '}
                  {loading ? <span className="inline-block h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /> : item.timeSlot || 'TBD'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;
