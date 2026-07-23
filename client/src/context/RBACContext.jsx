import { createContext, useContext, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const RBACContext = createContext(null);

/**
 * Canonical role labels shown in the UI.
 */
export const ROLE_LABELS = {
  admin: 'Chief Medical Officer',
  doctor: 'Attending Physician',
  labtech: 'Lab Technician',
  patient: 'Patient',
};

/**
 * Routes that are ALLOWED for each role.
 * Any route NOT in a role's list will render with a lock icon in the sidebar.
 */
export const ROLE_PERMISSIONS = {
  admin: [
    '/dashboard',
    '/patients',
    '/patients/new',
    '/patients/profile',
    '/doctors',
    '/doctors/new',
    '/appointments',
    '/appointments/new',
    '/appointments/queue',
    '/lab',
    '/tests',
    '/billing',
    '/billing/pay',
    '/portal',
    '/consultations',
  ],
  doctor: [
    '/dashboard',
    '/consultations',
    '/lab',
    '/billing',
    '/portal',
  ],
  labtech: [
    '/lab',
    '/tests',
    '/portal',
  ],
  patient: [
    '/portal',
    '/billing',
  ],
};

/**
 * All available demo roles for the switcher dropdown.
 */
export const DEMO_ROLES = [
  { value: 'admin', label: 'Admin (CMO)' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'labtech', label: 'Lab Technician' },
  { value: 'patient', label: 'Patient' },
];

const STORAGE_KEY = 'careos_demo_role';

export const RBACProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [activeRole, setActiveRoleState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || user?.role || 'admin';
  });

  const setActiveRole = useCallback((role) => {
    setActiveRoleState(role);
    localStorage.setItem(STORAGE_KEY, role);
  }, []);

  /**
   * Returns true if the given path is accessible for the active role.
   */
  const canAccess = useCallback(
    (path) => {
      const allowed = ROLE_PERMISSIONS[activeRole] || [];
      return allowed.includes(path);
    },
    [activeRole]
  );

  return (
    <RBACContext.Provider
      value={{
        activeRole,
        setActiveRole,
        canAccess,
        roleLabel: ROLE_LABELS[activeRole] || activeRole,
        permissions: ROLE_PERMISSIONS[activeRole] || [],
        demoRoles: DEMO_ROLES,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => useContext(RBACContext);
