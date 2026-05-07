import { useEffect, useState, useContext } from 'react';
import { Calendar, Receipt, FlaskConical } from 'lucide-react';
import labService from '../../services/labService';
import billingService from '../../services/billingService';
import appointmentService from '../../services/appointmentService';
import { AuthContext } from '../../context/AuthContext';

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-8 text-[var(--text-secondary)]">
    <div className="mb-3 text-[var(--text-secondary)] opacity-60">{icon}</div>
    <p className="text-sm">{text}</p>
  </div>
);

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
        let labs = { data: [] };
        let billsResponse = { data: [] };
        let appointmentsResponse = { data: { appointments: [] } };
        try {
          labs = await labService.getPatientLabReports(user._id);
        } catch (e) { console.error(e); }
        try {
          billsResponse = await billingService.getBills({ patientId: user._id });
        } catch (e) { console.error(e); }
        try {
          appointmentsResponse = await appointmentService.getAppointments({ patientId: user._id, page: 1, limit: 5 });
        } catch (e) { console.error(e); }
        setLabReports(labs.data || []);
        setBills(billsResponse.data || []);
        setAppointments(appointmentsResponse.data.appointments || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadPatientData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Patient portal</h1>
        <p className="mt-2 text-[var(--text-secondary)]">View your lab reports, bills, and upcoming appointments in one place.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Next appointments</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-[var(--text-secondary)]">Loading...</p>
            ) : appointments.length ? (
              appointments.map((appointment) => (
                <div key={appointment._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <p className="font-semibold text-[var(--text-primary)]">{appointment.doctor?.name || 'Doctor'}</p>
                  <p className="text-[var(--text-secondary)]">{new Date(appointment.date).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <EmptyState icon={<Calendar size={36} />} text="No upcoming appointments" />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Open bills</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-[var(--text-secondary)]">Loading...</p>
            ) : bills.length ? (
              bills.map((bill) => (
                <div key={bill._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <p className="font-semibold text-[var(--text-primary)]">${bill.total?.toFixed(2)}</p>
                  <p className="text-[var(--text-secondary)] capitalize">{bill.status}</p>
                </div>
              ))
            ) : (
              <EmptyState icon={<Receipt size={36} />} text="No pending bills" />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Lab reports</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-[var(--text-secondary)]">Loading...</p>
            ) : labReports.length ? (
              labReports.map((report) => (
                <div key={report._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <p className="font-semibold text-[var(--text-primary)]">{report.orderId || report._id.slice(-6)}</p>
                  <p className="text-[var(--text-secondary)]">{report.status}</p>
                </div>
              ))
            ) : (
              <EmptyState icon={<FlaskConical size={36} />} text="No lab reports yet" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
