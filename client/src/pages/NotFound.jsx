import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page max-w-md text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-sm text-maroon/70">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
