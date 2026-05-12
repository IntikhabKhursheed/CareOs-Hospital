import { useEffect, useRef, useState } from 'react';
import testService from '../../services/testService';
import { DataTable, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { navigateTo } from '../../utils/navigation';

const TestCatalogList = () => {
  const [tests, setTests] = useState([]);
  const [allTests, setAllTests] = useState([]); // For flat view
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);
  const [groupedTests, setGroupedTests] = useState({});
  const latestRequestRef = useRef(0);

  const loadTests = async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setLoading(true);
    try {
      const response = await testService.getAllTests({ search, category, department, page, limit });
      if (latestRequestRef.current !== requestId) return;
      setTests(response.data.allTests || []);
      setAllTests(response.data.allTests || []);
      setGroupedTests(response.data.tests || {});
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      if (latestRequestRef.current !== requestId) return;
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this test? This will deactivate it.')) return;
    try {
      await testService.deleteTest(id);
      loadTests();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTests();
  }, [search, category, department, page]);

  const displayTests = search || category || department ? tests : allTests;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-title">Test catalog</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage laboratory tests</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">Search, filter, and review test details from a unified premium dashboard.</p>
          </div>
          <button onClick={() => navigateTo('/tests/new')} className="btn-primary inline-flex items-center justify-center">
            Add Test
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <section className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tests by code or name"
                className="input-field"
              />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field">
                <option value="">All categories</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Serology">Serology</option>
                <option value="Radiology">Radiology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Urine">Urine</option>
                <option value="Stool">Stool</option>
              </select>
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="input-field">
                <option value="">All departments</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Cardiology">Cardiology</option>
              </select>
            </div>
          </section>

          <aside className="surface rounded-[1.5rem] border border-[var(--border)] p-6 shadow-sm">
            <p className="section-title">Overview</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Total tests</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.total || tests.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Current page</p>
                <p className="mt-2 text-3xl font-semibold">{pagination.page}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--bg-secondary)] p-5 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">Categories</p>
                <p className="mt-2 text-3xl font-semibold">{Object.keys(groupedTests).length}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6">
          <TableContainer>
            <DataTable>
              <TableHead>
                <tr>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>TAT</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><div className="h-4 w-16 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-32 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-24 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-20 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-16 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-12 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell><div className="h-4 w-16 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                        <TableCell align="right"><div className="ml-auto h-4 w-32 rounded bg-[var(--bg-secondary)]/60" /></TableCell>
                      </TableRow>
                    ))
                  : displayTests.map((test) => (
                      <TableRow
                        key={test._id}
                        interactive
                        className="group"
                        onClick={() => navigateTo(`/tests/edit?id=${test._id}`)}
                      >
                        <TableCell className="font-semibold text-[var(--text-primary)]">{test.testCode}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">{test.testName}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">{test.category}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">{test.department}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">PKR {test.price}</TableCell>
                        <TableCell className="text-[var(--text-primary)]">{test.turnaroundHours}h</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            test.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigateTo(`/tests/edit?id=${test._id}`); }}
                              className="table-focusable inline-flex items-center rounded-md border border-blue-300 bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(test._id); }}
                              className="table-focusable inline-flex items-center rounded-md border border-red-300 bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </tbody>
            </DataTable>
          </TableContainer>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[var(--text-secondary)]">Page {pagination.page} of {Math.max(Math.ceil(pagination.total / pagination.limit), 1)}</div>
          <div className="flex flex-wrap gap-3">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(page - 1)} 
              className="rounded-3xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)] transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--sidebar-active)]"
            >
              Previous
            </button>
            <button 
              disabled={page >= Math.ceil(pagination.total / pagination.limit)} 
              onClick={() => setPage(page + 1)} 
              className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCatalogList;
