const cx = (...classes) => classes.filter(Boolean).join(' ');

export const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'badge-gray',
    success: 'badge-emerald',
    warning: 'badge-amber',
    error: 'badge-red',
    info: 'badge-blue',
    primary: 'badge-indigo'
  };

  return (
    <span className={cx('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
};
