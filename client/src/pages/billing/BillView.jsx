import { useState, useEffect } from 'react'
import { Receipt, Plus, AlertCircle } from 'lucide-react'
import billingService from '../../services/billingService'

export default function BillView() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchBills = async () => {
      try {
        const res = await billingService.getBills()
        if (!isMounted) return
        setBills(res?.data?.bills || res?.data || [])
      } catch (err) {
        if (!isMounted) return
        setError('Could not load billing data')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    fetchBills()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">Finance</p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Billing Records</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 
        hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
          <Plus size={16} />
          New Bill
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 
        flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!error && bills.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl 
        p-16 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-[var(--bg-secondary)] rounded-full mb-4">
            <Receipt size={32} className="text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            No billing records found
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Bills will appear here once patient consultations are completed
          </p>
        </div>
      )}

      {bills.length > 0 && (
        <div className="grid gap-4">
          {bills.map((bill, i) => (
            <div key={bill._id || i} className="bg-[var(--bg-card)] border border-[var(--border)] 
            rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {bill.patient?.name || 'Patient'}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {new Date(bill.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  ${bill.totalAmount || 0}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${bill.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : bill.status === 'insurance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                  {bill.status || 'pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
