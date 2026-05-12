import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { X, Search, Clock } from 'lucide-react';
import testService from '../services/testService';
import labOrderService from '../services/labOrderService';

const OrderTestsModal = ({ isOpen, onClose, patientId }) => {
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [referredBy, setReferredBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTests();
    }
  }, [isOpen]);

  const loadTests = async () => {
    setTestsLoading(true);
    try {
      const response = await testService.getTests();
      console.log('Tests response:', response);
      // Handle the actual response structure from API
      const testsData = response.data?.data?.allTests || response.data?.data?.tests || response.data?.allTests || response.data?.tests || [];
      // If testsData is an object (grouped tests), flatten it
      const flatTests = Array.isArray(testsData) ? testsData : 
        Object.values(testsData).flat() || [];
      setTests(flatTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setTestsLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory && test.isActive;
  });

  const categories = ['All', ...new Set(tests.map(test => test.category))];

  const toggleTestSelection = (test) => {
    setSelectedTests(prev => {
      const exists = prev.find(t => t._id === test._id);
      if (exists) {
        return prev.filter(t => t._id !== test._id);
      } else {
        return [...prev, { 
          ...test, 
          priority: 'routine',
          clinicalNotes: ''
        }];
      }
    });
  };

  const updateTestPriority = (testId, priority) => {
    setSelectedTests(prev => 
      prev.map(test => 
        test._id === testId ? { ...test, priority } : test
      )
    );
  };

  const updateTestNotes = (testId, clinicalNotes) => {
    setSelectedTests(prev => 
      prev.map(test => 
        test._id === testId ? { ...test, clinicalNotes } : test
      )
    );
  };

  const removeTest = (testId) => {
    setSelectedTests(prev => prev.filter(test => test._id !== testId));
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, test) => total + (test.price || 0), 0);
  };

  const handlePlaceOrder = async () => {
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    if (!patientId) {
      toast.error('Patient ID is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientId,
        testIds: selectedTests.map(test => test._id),
        referredBy,
        priority: selectedTests[0]?.priority || 'routine',
        clinicalNotes: selectedTests[0]?.clinicalNotes || ''
      };

      console.log('Creating lab order with payload:', payload);
      const response = await labOrderService.createLabOrder(payload);
      console.log('Lab order creation response:', response);
      
      toast.success('Lab order placed successfully');
      onClose();
      setSelectedTests([]);
      setReferredBy('');
    } catch (error) {
      console.error('Lab order creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
          
          <div className="relative max-w-4xl w-full bg-[var(--bg-card)] rounded-xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Order Lab Tests</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Panel - Test Catalog */}
              <div>
                <div className="mb-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="Search tests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {testsLoading ? (
                    <div className="text-center py-8 text-[var(--text-secondary)]">Loading tests...</div>
                  ) : filteredTests.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-secondary)]">No tests found</div>
                  ) : (
                    filteredTests.map(test => {
                      const isSelected = selectedTests.find(t => t._id === test._id);
                      return (
                        <div
                          key={test._id}
                          onClick={() => toggleTestSelection(test)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                            isSelected
                              ? 'border-primary bg-primary/15 shadow-md ring-2 ring-primary/20'
                              : 'border-[var(--border)] hover:bg-[var(--bg-secondary)] hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-primary' : 'bg-gray-300'
                                }`} />
                                <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                                  {test.testCode}
                                </span>
                                <h4 className="font-semibold text-[var(--text-primary)]">{test.testName}</h4>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {test.turnaroundHours}h
                                </span>
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <span className="text-sm">₨</span>
                                  {test.price}
                                </span>
                                <span className="bg-[var(--bg-secondary)] px-2 py-1 rounded text-xs">
                                  {test.category}
                                </span>
                              </div>
                            </div>
                            <div className={`p-2 rounded-full transition-colors ${
                              isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Panel - Selected Tests */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
  Selected Tests {selectedTests.length > 0 && <span className="text-sm font-normal text-primary">({selectedTests.length})</span>}
</h3>
                
                <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                  {selectedTests.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border)] rounded-lg">
                      No tests selected
                    </div>
                  ) : (
                    selectedTests.map(test => (
                      <div key={test._id} className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)]">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-[var(--text-primary)]">{test.testName}</h4>
                          <button
                            onClick={() => removeTest(test._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Priority</label>
                            <select
                              value={test.priority}
                              onChange={(e) => updateTestPriority(test._id, e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-primary text-sm"
                            >
                              <option value="routine">Routine</option>
                              <option value="urgent">Urgent</option>
                              <option value="stat">STAT</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Clinical Notes</label>
                            <textarea
                              value={test.clinicalNotes || ''}
                              onChange={(e) => updateTestNotes(test._id, e.target.value)}
                              rows={2}
                              placeholder="Add clinical notes..."
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-primary text-sm resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Referred By</label>
                    <input
                      type="text"
                      value={referredBy}
                      onChange={(e) => setReferredBy(e.target.value)}
                      placeholder="Doctor name (optional)"
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-lg">
                    <span className="text-lg font-semibold text-[var(--text-primary)]">Total</span>
                    <span className="text-xl font-bold text-primary">₨{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[var(--border)]">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={selectedTests.length === 0 || loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTestsModal;
