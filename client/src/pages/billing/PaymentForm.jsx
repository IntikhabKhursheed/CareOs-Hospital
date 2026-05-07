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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Payments</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Record a new payment</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Log payments securely and keep invoices synced with billing status.</p>
        </div>
      </div>

      <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Bill ID</p>
            <input
              type="text"
              value={billId || ''}
              readOnly
              className="mt-3 w-full rounded-xl border border-slate-200 bg-gray-50 p-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Amount paid</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-gray-50 p-4 text-sm text-slate-900 outline-none"
              placeholder="Enter payment amount"
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Payment method</p>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-gray-50 p-4 text-sm text-slate-900 outline-none"
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Once recorded, payment details will be reflected in the billing ledger.</p>
            <button
              onClick={handlePayment}
              disabled={!amount || loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? 'Saving...' : 'Submit payment'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentForm;
