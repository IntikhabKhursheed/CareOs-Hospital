import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { navigateTo } from '../../utils/navigation';
import { Clock, Users, AlertTriangle, TrendingUp, TestTube, User, Calendar } from 'lucide-react';
import labOrderService from '../../services/labOrderService';

const LabQueue = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    completedToday: 0,
    criticalAlerts: 0,
    avgTAT: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const tabs = ['All', 'STAT', 'Urgent', 'Routine', 'Completed'];

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [activeTab, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (activeTab === 'STAT') filters.priority = 'stat';
      if (activeTab === 'Urgent') filters.priority = 'urgent';
      if (activeTab === 'Routine') filters.priority = 'routine';
      if (activeTab === 'Completed') filters.overallStatus = 'completed';
      if (activeTab === 'All') {
        // Show pending and partial for All tab
        filters.overallStatus = ['ordered', 'partial'];
      }

      const response = await labOrderService.getLabOrders({
        ...filters,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load lab queue');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get all orders for stats calculation
      const allOrdersResponse = await labOrderService.getLabOrders({ limit: 1000 });
      const allOrders = allOrdersResponse.data?.orders || [];

      const today = new Date().toDateString();
      const pending = allOrders.filter(order => 
        ['ordered', 'partial'].includes(order.overallStatus)
      ).length;
      
      const completedToday = allOrders.filter(order => 
        order.overallStatus === 'completed' && 
        new Date(order.updatedAt).toDateString() === today
      ).length;

      const criticalAlerts = allOrders.filter(order => 
        order.criticalValueAlerted
      ).length;

      // Calculate average TAT for completed orders
      const completedOrders = allOrders.filter(order => order.overallStatus === 'completed');
      const avgTAT = completedOrders.length > 0 
        ? Math.round(completedOrders.reduce((sum, order) => {
            const tat = order.tests?.reduce((max, test) => 
              Math.max(max, test.test?.turnaroundHours || 0), 0
            );
            return sum + tat;
          }, 0) / completedOrders.length)
        : 0;

      setStats({
        pending,
        completedToday,
        criticalAlerts,
        avgTAT
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'stat': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-amber-100 text-amber-800';
      case 'sample_collected': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionForOrder = (order) => {
    const hasOrderedTests = order.tests?.some(test => test.status === 'ordered');
    const hasCollectedTests = order.tests?.some(test => test.status === 'sample_collected');
    const hasCompletedTests = order.tests?.some(test => test.status === 'completed');

    if (hasOrderedTests) {
      return {
        text: 'Collect Sample',
        action: () => handleCollectSample(order._id),
        variant: 'outline'
      };
    } else if (hasCollectedTests && !hasCompletedTests) {
      return {
        text: 'Enter Results',
        action: () => navigateTo(`/lab/result?id=${order._id}`),
        variant: 'primary'
      };
    } else {
      return {
        text: 'View Results',
        action: () => navigateTo(`/lab/result?id=${order._id}`),
        variant: 'secondary'
      };
    }
  };

  const handleCollectSample = async (orderId) => {
    try {
      await labOrderService.updateOrderStatus(orderId, { 
        overallStatus: 'partial',
        sampleCollectedAt: new Date()
      });
      toast.success('Sample marked as collected');
      loadOrders();
      loadStats();
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark sample as collected');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now - created;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Lab operations</p>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">Laboratory Queue Management</h1>
        <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Monitor pending tests, prioritize urgent orders, and manage sample collection workflow.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Pending Orders</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Completed Today</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.completedToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Critical Alerts</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.criticalAlerts}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Avg TAT</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.avgTAT}h</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm mb-6">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tests</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Time Elapsed</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    No orders found for {activeTab.toLowerCase()} status
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const hasStatPriority = order.tests?.some(test => test.priority === 'stat');
                  const hasUrgentPriority = order.tests?.some(test => test.priority === 'urgent');
                  const borderClass = hasStatPriority ? 'border-l-4 border-l-red-500 bg-red-50' :
                                         hasUrgentPriority ? 'border-l-4 border-l-amber-500 bg-amber-50' : '';
                  
                  const action = getActionForOrder(order);
                  
                  return (
                    <tr key={order._id} className={borderClass}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[var(--text-secondary)]" />
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{order.patient?.name}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{order.patient?.MRH}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {order.tests?.slice(0, 3).map((test, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-[var(--bg-primary)] text-white rounded">
                              <TestTube className="h-3 w-3 mr-1" />
                              {test.test?.testCode}
                            </span>
                          ))}
                          {order.tests?.length > 3 && (
                            <span className="text-xs text-[var(--text-secondary)]">+{order.tests.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {hasStatPriority && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                          {hasUrgentPriority && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(order.tests?.[0]?.priority)}`}>
                            {order.tests?.[0]?.priority?.toUpperCase() || 'ROUTINE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                          <span className="text-sm text-[var(--text-primary)]">{order.orderedBy?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--text-secondary)]" />
                          <span className="text-sm text-[var(--text-primary)]">{getTimeElapsed(order.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.overallStatus)}`}>
                          {order.overallStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={action.action}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            action.variant === 'primary' ? 'bg-primary text-white hover:bg-primary/90' :
                            action.variant === 'outline' ? 'border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]' :
                            'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:text-white'
                          }`}
                        >
                          {action.text}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-[var(--border)]">
            <div className="text-sm text-[var(--text-secondary)]">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, orders.length)} of {orders.length} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={orders.length < limit}
                className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabQueue;
