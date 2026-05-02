import { useMemo, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import billingService from '../../services/billingService';

const PaymentForm = () => {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const billId = query.get('id');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!billId || !amount) {
      toast.error('Enter amount and select bill');
      return;
    }
    setLoading(true);
    try {
      await billingService.addPayment(billId, { amount: parseFloat(amount), method });
      toast.success('Payment recorded successfully');
      setAmount('');
    } catch (error) {
      console.error(error);
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Record payment</h1>
          <p className="mt-2 text-slate-600">Save a payment against an invoice and keep billing status up to date.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-semibold text-slate-700">Bill ID</label>
        <input
          type="text"
          value={billId || ''}
          readOnly
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none"
        />

        <label className="mt-6 text-sm font-semibold text-slate-700">Amount paid</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none"
          placeholder="Enter payment amount"
        />

        <label className="mt-6 text-sm font-semibold text-slate-700">Payment method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none"
        >
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="insurance">Insurance</option>
        </select>

        <button
          onClick={handlePayment}
          disabled={!amount || loading}
          className="mt-8 w-full rounded-3xl bg-primary px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Submit payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
