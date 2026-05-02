const NotFound = () => (
  <div className="min-h-screen bg-slate-50 px-4 py-16 text-center sm:px-6 lg:px-8">
    <div className="mx-auto inline-block max-w-2xl rounded-3xl bg-white p-12 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">404 error</p>
      <h1 className="mt-6 text-5xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-4 text-base text-slate-600">The route you are trying to access does not exist. Return to the dashboard or use the navigation above.</p>
      <div className="mt-10">
        <a href="/dashboard" className="inline-flex rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Go home</a>
      </div>
    </div>
  </div>
);

export default NotFound;
