import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { navigateTo } from '../../utils/navigation';
import { ArrowLeft, Brain, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import labOrderService from '../../services/labOrderService';

const ResultEntry = () => {
  const query = new URLSearchParams(window.location.search);
  const orderId = query.get('id');
  const [order, setOrder] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({});

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      if (!orderId) {
        toast.error('No lab order ID provided');
        setLoading(false);
        return;
      }

      const response = await labOrderService.getLabOrderById(orderId);
      console.log('Lab order response:', response);
      
      if (response.data) {
        setOrder(response.data);
        // Initialize test results from existing data
        const initialResults = {};
        response.data.tests?.forEach(test => {
          if (test.results?.length > 0) {
            initialResults[test._id] = {};
            test.results.forEach(result => {
              initialResults[test._id][result.parameter] = result.value;
            });
          } else {
            initialResults[test._id] = {};
          }
        });
        setTestResults(initialResults);
      } else {
        toast.error('Lab order not found');
      }
    } catch (error) {
      console.error('Failed to load lab order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load lab order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (testId, parameterName, value) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [parameterName]: value
      }
    }));
  };

  const calculateFlag = (value, parameter, patientGender) => {
    if (!parameter || !value) return 'normal';
    
    const normalRange = getNormalRange(parameter, patientGender);
    if (!normalRange) return 'normal';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';

    // Parse range (e.g., "70-120", "<200", ">3.5")
    const rangeParts = normalRange.match(/([<>=]*)(\d+\.?\d*)-?(\d+\.?\d*)?/);
    if (!rangeParts) return 'normal';

    const [, operator, min, max] = rangeParts;
    
    if (operator === '<' && numValue >= parseFloat(min)) return 'high';
    if (operator === '>' && numValue <= parseFloat(min)) return 'low';
    
    if (min && max) {
      const minVal = parseFloat(min);
      const maxVal = parseFloat(max);
      
      if (numValue < minVal * 0.5) return 'critical_low';
      if (numValue > maxVal * 2) return 'critical_high';
      if (numValue < minVal) return 'low';
      if (numValue > maxVal) return 'high';
    }

    return 'normal';
  };

  const getNormalRange = (parameter, gender) => {
    if (!parameter) return '';
    
    switch (gender.toLowerCase()) {
      case 'male':
        return parameter.normalRangeMale || '';
      case 'female':
        return parameter.normalRangeFemale || '';
      default:
        return parameter.normalRangeChild || '';
    }
  };

  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'critical_low':
        return <TrendingDown className="h-4 w-4 text-red-600 animate-pulse" />;
      case 'critical_high':
        return <TrendingUp className="h-4 w-4 text-red-600 animate-pulse" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-amber-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getFlagColor = (flag) => {
    switch (flag) {
      case 'critical_low':
      case 'critical_high':
        return 'text-red-800 bg-red-100 border-red-200';
      case 'low':
        return 'text-blue-800 bg-blue-100 border-blue-200';
      case 'high':
        return 'text-amber-800 bg-amber-100 border-amber-200';
      default:
        return 'text-green-800 bg-green-100 border-green-200';
    }
  };

  const handleAIInterpretation = async (testId) => {
    setAiLoading(prev => ({ ...prev, [testId]: true }));
    
    try {
      const test = order.tests.find(t => t._id === testId);
      const results = Object.entries(testResults[testId] || {}).map(([param, value]) => ({
        parameter: param,
        value
      }));

      // Mock AI interpretation (in real implementation, this would call AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const interpretation = `Based on the provided results for ${test.test?.testName}, the values appear to be within normal ranges for most parameters. No critical abnormalities detected. Continue routine monitoring as per standard protocol.`;
      
      // Update order with AI interpretation
      await labOrderService.enterResults(orderId, {
        testId,
        results: results.map(r => ({
          ...r,
          flag: calculateFlag(r.value, test.test?.parameters?.find(p => p.name === r.parameter), order.patient?.gender),
          unit: test.test?.parameters?.find(p => p.name === r.parameter)?.unit || '',
          normalRange: getNormalRange(test.test?.parameters?.find(p => p.name === r.parameter), order.patient?.gender)
        })),
        aiInterpretation: interpretation
      });

      // Reload order to show updated interpretation
      loadOrder();
      toast.success('AI interpretation generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate AI interpretation');
    } finally {
      setAiLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleSaveAllResults = async () => {
    setLoading(true);
    try {
      for (const test of order.tests) {
        const results = Object.entries(testResults[test._id] || {}).map(([param, value]) => ({
          parameter: param,
          value,
          flag: calculateFlag(value, test.test?.parameters?.find(p => p.name === param), order.patient?.gender),
          unit: test.test?.parameters?.find(p => p.name === param)?.unit || '',
          normalRange: getNormalRange(test.test?.parameters?.find(p => p.name === param), order.patient?.gender)
        }));

        await labOrderService.enterResults(orderId, {
          testId: test._id,
          results
        });
      }
      
      toast.success('All test results saved successfully');
      loadOrder();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save results');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
        <div className="animate-pulse rounded-xl bg-[var(--bg-card)] p-8 shadow-sm">
          <div className="h-8 w-56 rounded bg-[var(--bg-secondary)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigateTo('/lab')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </button>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Lab Results Entry</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">{order.orderNumber}</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Enter test results with automated flagging and AI interpretation.</p>
          </div>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className="grid gap-6 mb-8 lg:grid-cols-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Patient Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Name</p>
              <p className="font-medium text-[var(--text-primary)]">{order.patient?.name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">MRH</p>
              <p className="font-medium text-[var(--text-primary)]">{order.patient?.MRH}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Gender</p>
              <p className="font-medium text-[var(--text-primary)]">{order.patient?.gender}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Order Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Ordered By</p>
              <p className="font-medium text-[var(--text-primary)]">{order.orderedBy?.name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Referred By</p>
              <p className="font-medium text-[var(--text-primary)]">{order.referredBy || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Created At</p>
              <p className="font-medium text-[var(--text-primary)]">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Sample Status</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Sample Collected</p>
              <p className="font-medium text-[var(--text-primary)]">
                {order.sampleCollectedAt ? `Yes - ${new Date(order.sampleCollectedAt).toLocaleString()}` : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Overall Status</p>
              <span className={`inline-flex px-3 py-1 text-sm rounded-full ${
                order.overallStatus === 'completed' ? 'bg-green-100 text-green-800' :
                order.overallStatus === 'partial' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.overallStatus?.replace('_', ' ') || 'ordered'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-6">
        {order.tests?.map((test) => (
          <div key={test._id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
            {/* Test Header */}
            <div className="bg-[var(--bg-secondary)] p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">{test.test?.testName}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                      {test.test?.testCode}
                    </span>
                    <span className="text-sm bg-[var(--bg-primary)] text-white px-2 py-1 rounded">
                      {test.test?.category}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      Priority: {test.priority?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    test.status === 'completed' ? 'bg-green-100 text-green-800' :
                    test.status === 'sample_collected' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status?.replace('_', ' ') || 'ordered'}
                  </span>
                </div>
              </div>
            </div>

            {/* Parameter Table */}
            <div className="p-6">
              {test.test?.parameters?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Parameter</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Value Input</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Unit</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Normal Range</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.test.parameters.map((parameter) => {
                        const value = testResults[test._id]?.[parameter.name] || '';
                        const flag = calculateFlag(value, parameter, order.patient?.gender);
                        
                        return (
                          <tr key={parameter.name} className="border-b border-[var(--border)]">
                            <td className="py-3 px-4">
                              <span className="font-medium text-[var(--text-primary)]">{parameter.name}</span>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleResultChange(test._id, parameter.name, e.target.value)}
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-primary text-sm"
                                placeholder={`Enter ${parameter.name} value`}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-[var(--text-secondary)]">{parameter.unit}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-[var(--text-secondary)]">
                                {getNormalRange(parameter, order.patient?.gender)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getFlagIcon(flag)}
                                <span className={`px-2 py-1 text-xs rounded ${getFlagColor(flag)}`}>
                                  {flag.replace('_', ' ') || 'normal'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  No parameters defined for this test.
                </div>
              )}
            </div>

            {/* AI Interpretation */}
            <div className="border-t border-[var(--border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[var(--text-primary)]">AI Interpretation</h4>
                <button
                  onClick={() => handleAIInterpretation(test._id)}
                  disabled={aiLoading[test._id]}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="h-4 w-4" />
                  {aiLoading[test._id] ? 'Generating...' : 'Generate AI Interpretation'}
                </button>
              </div>
              
              {test.aiInterpretation && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-indigo-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-800 mb-2">AI Analysis</p>
                      <p className="text-sm text-indigo-700 leading-relaxed">{test.aiInterpretation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save All Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSaveAllResults}
          disabled={loading}
          className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : 'Save All Results'}
        </button>
      </div>
    </div>
  );
};

export default ResultEntry;
