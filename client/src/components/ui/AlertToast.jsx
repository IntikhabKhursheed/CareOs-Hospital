import { useEffect, useState } from 'react';
import { X, Wifi, AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * AlertToast — a single dismissible notification toast.
 *
 * Props:
 *  - id: unique identifier
 *  - type: 'info' | 'success' | 'warning' | 'critical'
 *  - title: string
 *  - message: string
 *  - onDismiss: (id) => void
 *  - duration: ms before auto-dismiss (default 5000)
 */
const TYPE_CONFIG = {
  info: {
    icon: <Info size={16} />,
    containerClass: 'border-sky-200 bg-sky-50',
    iconClass: 'text-sky-500 bg-sky-100',
    titleClass: 'text-sky-800',
    progressClass: 'bg-sky-400',
  },
  success: {
    icon: <CheckCircle size={16} />,
    containerClass: 'border-emerald-200 bg-emerald-50',
    iconClass: 'text-emerald-600 bg-emerald-100',
    titleClass: 'text-emerald-800',
    progressClass: 'bg-emerald-400',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    containerClass: 'border-amber-200 bg-amber-50',
    iconClass: 'text-amber-600 bg-amber-100',
    titleClass: 'text-amber-800',
    progressClass: 'bg-amber-400',
  },
  critical: {
    icon: <AlertTriangle size={16} />,
    containerClass: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600 bg-red-100',
    titleClass: 'text-red-800',
    progressClass: 'bg-red-500',
  },
};

export const AlertToast = ({ id, type = 'info', title, message, onDismiss, duration = 5000 }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  // Slide-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = 50; // ms
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(timer);
          onDismiss(id);
          return 0;
        }
        return p - step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ${cfg.containerClass} ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
      style={{ width: '340px' }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconClass}`}>
          {cfg.icon}
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Live badge */}
              <span className="flex items-center gap-1 rounded-full bg-[rgba(0,0,0,0.06)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[rgba(0,0,0,0.5)]">
                <Wifi size={9} className="animate-pulse" />
                Live
              </span>
            </div>
            <button
              onClick={() => onDismiss(id)}
              className="shrink-0 rounded-md p-0.5 text-[rgba(0,0,0,0.35)] transition hover:text-[rgba(0,0,0,0.6)]"
            >
              <X size={14} />
            </button>
          </div>
          <p className={`mt-1 text-sm font-semibold leading-tight ${cfg.titleClass}`}>{title}</p>
          {message && (
            <p className="mt-0.5 text-xs leading-relaxed text-[rgba(0,0,0,0.55)]">{message}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-[rgba(0,0,0,0.06)]">
        <div
          className={`h-full transition-all ${cfg.progressClass}`}
          style={{ width: `${progress}%`, transitionDuration: '50ms' }}
        />
      </div>
    </div>
  );
};

/**
 * ToastContainer — renders all active toasts stacked in the top-right corner.
 * Also runs the simulated WebSocket interval.
 */
const SIMULATED_ALERTS = [
  { type: 'critical', title: 'Critical Lab Result', message: 'Patient #MRN-2026-34283: Critical Potassium level (6.8 mEq/L) reported from Lab.' },
  { type: 'warning', title: 'Allergy Conflict Detected', message: 'Patient #MRN-2026-14320: Penicillin allergy conflict in prescribed order.' },
  { type: 'info', title: 'Real-Time Sync Active', message: 'All clinical data is syncing across Doctor, Lab, and Admin roles.' },
  { type: 'success', title: 'Lab Results Ready', message: 'Patient #MRN-2026-89012: CBC results are now available for review.' },
  { type: 'warning', title: 'Medication Review Due', message: 'Patient #MRN-2026-55671: Warfarin dosage requires physician sign-off.' },
  { type: 'critical', title: 'Vitals Alert', message: 'Patient #MRN-2026-22901: SpO2 dropped to 88%. Immediate attention required.' },
  { type: 'info', title: 'New Appointment Queued', message: 'Dr. Ayesha Malik has 2 new walk-in consultations added to today\'s queue.' },
];

let alertIndex = 0;

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Show first toast quickly to demonstrate the feature on page load
    const firstTimeout = setTimeout(() => {
      const alert = SIMULATED_ALERTS[alertIndex % SIMULATED_ALERTS.length];
      alertIndex += 1;
      setToasts((prev) => [...prev, { ...alert, id: Date.now() }]);
    }, 2500);

    // Then continue on interval
    const interval = setInterval(() => {
      const alert = SIMULATED_ALERTS[alertIndex % SIMULATED_ALERTS.length];
      alertIndex += 1;
      setToasts((prev) => {
        // Cap at 3 visible at once
        const next = [...prev, { ...alert, id: Date.now() }];
        return next.slice(-3);
      });
    }, 10000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <AlertToast key={toast.id} {...toast} onDismiss={dismiss} />
      ))}
    </div>
  );
};

export default AlertToast;
