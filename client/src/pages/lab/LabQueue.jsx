import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import labService from '../../services/labService';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

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

      <section>
        <TableContainer className="bg-[var(--bg-card)]">
          <DataTable>
          <TableHead>
            <tr>
              <TableHeader sortable sorted>Order ID</TableHeader>
              <TableHeader>Patient</TableHeader>
              <TableHeader sortable>Priority</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader align="center">Critical</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell align="center"><div className="mx-auto h-4 w-12 rounded bg-[var(--bg-secondary)]" /></TableCell>
                  </TableRow>
                ))
              : queue.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-semibold text-[var(--text-primary)]">{item._id.slice(-6)}</TableCell>
                    <TableCell>{item.patient?.name || 'Unknown'}</TableCell>
                    <TableCell className="capitalize">{item.priority}</TableCell>
                    <TableCell className="capitalize">{item.status}</TableCell>
                    <TableCell align="center">{item.isCritical ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
          </tbody>
          </DataTable>
        </TableContainer>
      </section>
    </div>
  );
};

export default LabQueue;
