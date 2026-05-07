const cx = (...classes) => classes.filter(Boolean).join(' ');

export const TableContainer = ({ children, className = '' }) => (
  <div className={cx('table-container', className)}>
    <div className="table-scroll">
      {children}
    </div>
  </div>
);

export const DataTable = ({ children, className = '' }) => (
  <table className={cx('data-table', className)}>
    {children}
  </table>
);

export const TableHead = ({ children, className = '' }) => (
  <thead className={cx('table-head', className)}>
    {children}
  </thead>
);

export const TableHeader = ({ children, sortable = false, sorted = false, align = 'left', className = '' }) => (
  <th
    scope="col"
    aria-sort={sorted ? 'ascending' : 'none'}
    className={cx(
      'table-header-cell',
      sortable && 'is-sortable',
      sorted && 'is-sorted',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}
  >
    <span>{children}</span>
    {sortable && <span className="sort-indicator" aria-hidden="true">{sorted ? '↑↓' : '↕'}</span>}
  </th>
);

export const TableRow = ({ children, interactive = false, className = '', ...props }) => (
  <tr className={cx('table-row', interactive && 'is-interactive', className)} {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, align = 'left', className = '' }) => (
  <td className={cx('table-cell', align === 'center' && 'text-center', align === 'right' && 'text-right', className)}>
    {children}
  </td>
);
