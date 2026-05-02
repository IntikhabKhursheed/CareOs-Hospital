import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import labService from '../../services/labService';
import billingService from '../../services/billingService';
import appointmentService from '../../services/appointmentService';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const PatientPortal = () => {
  const { user } = useContext(AuthContext);
  const [labReports, setLabReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatientData = async () => {
      setLoading(true);
      try {
        const [labs, billsResponse, appointmentsResponse] = await Promise.all([
          labService.getPatientLabReports(user._id),
          billingService.getBills({ patientId: user._id }),
          appointmentService.getAppointments({ patientId: user._id, page: 1, limit: 5 })
        ]);
        setLabReports(labs.data || []);
        setBills(billsResponse.data || []);
        setAppointments(appointmentsResponse.data.appointments || []);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load portal data');
      } finally {
        setLoading(false);
      }
    };
    if (user) loadPatientData();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Patient portal</h1>
        <p className="mt-2 text-slate-600">View your lab reports, bills, and upcoming appointments in one place.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Next appointments</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : appointments.length ? (
              appointments.map((appointment) => (
                <div key={appointment._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{appointment.doctor?.name || 'Doctor'}</p>
                  <p className="text-slate-600">{new Date(appointment.date).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No upcoming consultations.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Open bills</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : bills.length ? (
              bills.map((bill) => (
                <div key={bill._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">${bill.total?.toFixed(2)}</p>
                  <p className="text-slate-600 capitalize">{bill.status}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No open invoices.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Lab reports</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : labReports.length ? (
              labReports.map((report) => (
                <div key={report._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{report.orderId || report._id.slice(-6)}</p>
                  <p className="text-slate-600">{report.status}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No lab reports available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
