const NotFound = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 text-center sm:px-6 lg:px-8">
    <div className="mx-auto inline-block max-w-2xl rounded-3xl bg-[var(--bg-card)] p-12 shadow-xl border border-[var(--border)]">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">404 error</p>
      <h1 className="mt-6 text-5xl font-semibold text-[var(--text-primary)]">Page not found</h1>
      <p className="mt-4 text-base text-[var(--text-secondary)]">The route you are trying to access does not exist. Return to the dashboard or use the navigation above.</p>
      <div className="mt-10">
        <a href="/dashboard" className="inline-flex rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Go home</a>
      </div>
    </div>
  </div>
);

export default NotFound;
