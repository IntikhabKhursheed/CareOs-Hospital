import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { navigateTo } from '../../utils/navigation';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Clock, User, TestTube, AlertTriangle } from 'lucide-react';
import labTestRequestService from '../../services/labTestRequestService';

const LabQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleMarkSampleCollected = async (requestId) => {
    try {
      await labTestRequestService.markSampleCollected(requestId);
      toast.success('Sample marked as collected');
      // Refresh the queue
      const response = await labTestRequestService.getLabQueue({ status: 'pending' });
      setQueue(response.data?.requests || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark sample as collected');
    }
  };

  useEffect(() => {
    const loadQueue = async () => {
      setLoading(true);
      try {
        const response = await labTestRequestService.getLabQueue({ status: 'pending' });
        setQueue(response.data?.requests || []);
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
              <TableHeader>Test Details</TableHeader>
              <TableHeader>Patient Info</TableHeader>
              <TableHeader>Assigned By</TableHeader>
              <TableHeader>Priority</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-28 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]" /></TableCell>
                    <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]" /></TableCell>
                  </TableRow>
                ))
              : queue.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TestTube size={16} className="text-blue-500" />
                          <span className="font-semibold text-[var(--text-primary)]">{request.test?.testCode}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{request.test?.testName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{request.test?.category} • {request.test?.department}</p>
                        <p className="text-xs text-[var(--text-secondary)]">TAT: {request.test?.turnaroundHours}h</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-green-500" />
                          <span className="font-medium text-[var(--text-primary)]">{request.patient?.name}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">MRH: {request.patient?.MRH}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{request.patient?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{request.referrer?.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{request.referrerName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={request.urgency === 'stat' ? 'destructive' : request.urgency === 'urgent' ? 'warning' : 'default'}
                        className="capitalize"
                      >
                        {request.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={request.status === 'completed' ? 'success' : request.status === 'in_progress' ? 'warning' : 'default'}
                        className="capitalize"
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!request.sampleCollected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSampleCollected(request._id)}
                            className="text-xs"
                          >
                            Collect Sample
                          </Button>
                        )}
                        {request.sampleCollected && !request.results && (
                          <Button
                            size="sm"
                            onClick={() => navigateTo(`/lab/results/${request._id}`)}
                            className="text-xs"
                          >
                            Enter Results
                          </Button>
                        )}
                        {request.results && (
                          <Badge variant="success" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
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
