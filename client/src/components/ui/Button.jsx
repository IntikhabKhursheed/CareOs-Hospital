const cx = (...classes) => classes.filter(Boolean).join(' ');

export const Button = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };

  const sizeClasses = {
    small: 'btn-small',
    medium: 'btn-medium',
    large: 'btn-large'
  };

  return (
    <button
      type={type}
      className={cx(
        'btn',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'btn-disabled',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
