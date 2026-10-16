// Consistent loading / error / empty messages.
export function Loading({ text = 'Loading…' }) {
  return <p className="py-10 text-center text-sm text-maroon/70" role="status">{text}</p>;
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="card mx-auto my-8 max-w-md p-6 text-center" role="alert">
      <p className="font-semibold">We couldn&apos;t load this page.</p>
      <p className="mt-1 text-sm text-maroon/70">{error?.message || 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className="btn-gold mt-4">Try again</button>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="card p-8 text-center">
      <p className="font-semibold">{title}</p>
      <div className="mt-2 text-sm text-maroon/70">{children}</div>
    </div>
  );
}
