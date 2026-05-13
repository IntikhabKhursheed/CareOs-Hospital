import { useEffect, useState } from 'react';
import { navigateTo } from '../../utils/navigation';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import patientService from '../../services/patientService';
import labOrderService from '../../services/labOrderService';
import OrderTestsModal from '../../components/OrderTestsModal';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState({ appointments: [], visits: [] });
  const [labHistory, setLabHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableTests, setAvailableTests] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const id = new URLSearchParams(window.location.search).get('id');

  
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const loadLabHistory = async () => {
    try {
      const response = await labOrderService.getPatientLabHistory(id);
      setLabHistory(response.data || []);
    } catch (error) {
      console.error('Failed to load lab history:', error);
      setLabHistory([]);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await patientService.getPatientById(id);
        const historyResponse = await patientService.getPatientHistory(id);
        setPatient(response.data);
        setHistory(historyResponse.data);
        
                
        // Load lab history
        await loadLabHistory();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-8">
        <div className="animate-pulse rounded-xl bg-[var(--bg-card)] p-8 shadow-sm border border-[var(--border)]">
          <div className="h-8 w-56 rounded bg-[var(--bg-secondary)]" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-[var(--bg-secondary)]" />
            <div className="h-24 rounded-xl bg-[var(--bg-secondary)]" />
            <div className="h-24 rounded-xl bg-[var(--bg-secondary)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Patient profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">{patient?.name || 'Patient details'}</h1>
              <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Complete clinical history, contact details and active care notes are displayed below.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">MRH</p>
              <p className="mt-2 text-xl text-[var(--text-primary)]">{patient?.MRH || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Date of birth</p>
              <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Phone</p>
              <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{patient?.phone || '—'}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Email</p>
              <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{patient?.email || '—'}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Medical summary</h2>
            <p className="mt-4 text-[var(--text-secondary)]">Allergies</p>
            <p className="mt-2 text-[var(--text-primary)]">{patient?.allergies?.length ? patient.allergies.join(', ') : 'None'}</p>
            <p className="mt-4 text-[var(--text-secondary)]">Chronic conditions</p>
            <p className="mt-2 text-[var(--text-primary)]">{patient?.chronicConditions?.length ? patient.chronicConditions.join(', ') : 'None'}</p>
          </div>

          <div className="lg:col-span-2 grid gap-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Appointment history</h3>
              {history.appointments.length ? (
                <ul className="mt-4 space-y-4">
                  {history.appointments.map((appointment) => (
                    <li key={appointment._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="font-medium text-[var(--text-primary)]">{new Date(appointment.date).toLocaleDateString()} • {appointment.timeSlot}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Status: {appointment.status.replace('_', ' ')}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[var(--text-secondary)]">No appointment records found.</p>
              )}
            </div>

            {/* <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Lab Orders</h3>
              <div className="text-sm text-[var(--text-secondary)]">
                <p>Use the "Order Tests" button above to create new lab orders for this patient.</p>
                <p className="mt-2">View complete lab history in the Lab History section below.</p>
              </div>
            </div> */}

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Visit records</h3>
              {history.visits.length ? (
                <ul className="mt-4 space-y-4">
                  {history.visits.map((visit) => (
                    <li key={visit._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="font-medium text-[var(--text-primary)]">{new Date(visit.createdAt).toLocaleDateString()}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Complaint: {visit.chiefComplaint || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[var(--text-secondary)]">No visit records found.</p>
              )}
            </div>
          </div>
        </section>

        {/* Order Tests Section */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Order Lab Tests</h2>
              <p className="text-[var(--text-secondary)]">Order comprehensive lab tests for this patient with priority selection and clinical notes.</p>
            </div>
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              Order Tests
            </button>
          </div>
        </section>

        {/* Lab History Section */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Lab History</h2>
          {labHistory.length ? (
            <div className="space-y-4">
              {labHistory.map((order) => (
                <div key={order._id} className="border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] p-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleOrderExpansion(order._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                          {order.orderNumber}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          order.overallStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          order.overallStatus === 'partial' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.overallStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {order.tests?.map((test, index) => (
                          <span key={index} className="text-xs bg-[var(--bg-primary)] px-2 py-1 rounded">
                            {test.test?.testCode}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedOrders[order._id] ? (
                        <ChevronUp className="h-5 w-5 text-[var(--text-secondary)]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
                      )}
                    </div>
                  </div>
                  
                  {expandedOrders[order._id] && (
                    <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
                      {order.tests?.map((test, testIndex) => (
                        <div key={testIndex} className="bg-[var(--bg-card)] p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-[var(--text-primary)]">
                                {test.test?.testName}
                              </h4>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {test.test?.category} • {test.test?.department}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${
                              test.status === 'completed' ? 'bg-green-100 text-green-800' :
                              test.status === 'sample_collected' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {test.status?.replace('_', ' ') || 'ordered'}
                            </span>
                          </div>
                          
                          {test.results?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {test.results.map((result, resultIndex) => (
                                <div key={resultIndex} className="flex justify-between items-center text-sm">
                                  <span className="text-[var(--text-secondary)]">{result.parameter}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[var(--text-primary)]">
                                      {result.value} {result.unit}
                                    </span>
                                    {result.flag !== 'normal' && (
                                      <span className={`px-1 py-0.5 text-xs rounded ${
                                        result.flag.includes('critical') ? 'bg-red-100 text-red-800' :
                                        result.flag.includes('low') ? 'bg-blue-100 text-blue-800' :
                                        'bg-amber-100 text-amber-800'
                                      }`}>
                                        {result.flag.replace('_', ' ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {test.aiInterpretation && (
                            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                              <p className="text-sm font-medium text-indigo-800 mb-1">AI Interpretation</p>
                              <p className="text-sm text-indigo-700">{test.aiInterpretation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No lab orders found for this patient.
            </div>
          )}
        </section>
      </div>

      {/* Order Tests Modal */}
      <OrderTestsModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        patientId={id}
      />
    </div>
  );
};

export default PatientProfile;
