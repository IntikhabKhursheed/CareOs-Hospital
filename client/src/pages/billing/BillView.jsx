import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import billingService from '../../services/billingService';

const BillView = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const response = await billingService.getBills({ page: 1, limit: 10 });
        setBills(response.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load bill history');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const downloadPdf = async (bill) => {
    try {
      const blob = await billingService.generateBill({ patientId: bill.patient._id, items: bill.items }, true);
      const href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = href;
      link.download = `bill-${bill._id}.pdf`;
      link.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Billing overview</h1>
          <p className="mt-2 text-slate-600">Review invoices, track payment status, and export bills directly.</p>
        </div>
        <a href="/billing/pay" className="rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Record payment</a>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Bill</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-slate-200">
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                  </tr>
                ))
              : bills.map((bill) => (
                  <tr key={bill._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-4">{bill._id.slice(-6)}</td>
                    <td className="px-4 py-4">{bill.patient?.name || 'Unknown'}</td>
                    <td className="px-4 py-4">${bill.total.toFixed(2)}</td>
                    <td className="px-4 py-4 capitalize">{bill.status}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => downloadPdf(bill)}
                        className="rounded-2xl border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillView;
