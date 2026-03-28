import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-ivory">
      <div className="mb-6">
        <p className="font-sans text-[80px] font-light text-gray-100 leading-none select-none">404</p>
        <h1 className="font-display text-3xl italic text-charcoal -mt-4 mb-3">Page Not Found</h1>
        <p className="font-sans text-sm text-mink max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => navigate(-1)}
          className="btn-outline flex items-center justify-center gap-2">
          <ArrowLeft size={14} /> Go Back
        </button>
        <Link to="/" className="btn-primary flex items-center justify-center gap-2">
          <Home size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}