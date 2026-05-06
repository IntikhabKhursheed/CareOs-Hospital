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
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-100">
      <Toaster position="top-right" />
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Billing dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Invoices and payments</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Review billing history, export invoices, and manage payments from one secure interface.</p>
        </div>
        <a href="/billing/pay" className="btn-primary inline-flex items-center justify-center">
          Record payment
        </a>
      </div>

      <section className="card-glass overflow-x-auto rounded-3xl border border-slate-800 p-1 shadow-2xl shadow-slate-950/20">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
            <tr>
              <th className="px-5 py-4">Bill</th>
              <th className="px-5 py-4">Patient</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-800">
                    <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-20 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-28 rounded bg-slate-800" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                  </tr>
                ))
              : bills.map((bill) => (
                  <tr key={bill._id} className="border-b border-slate-800 hover:bg-slate-900/70 transition">
                    <td className="px-5 py-5 font-semibold text-slate-100">{bill._id.slice(-6)}</td>
                    <td className="px-5 py-5 text-slate-300">{bill.patient?.name || 'Unknown'}</td>
                    <td className="px-5 py-5 text-slate-300">${bill.total.toFixed(2)}</td>
                    <td className="px-5 py-5 capitalize text-slate-300">{bill.status}</td>
                    <td className="px-5 py-5">
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
      </section>
    </div>
  );
};

export default BillView;
