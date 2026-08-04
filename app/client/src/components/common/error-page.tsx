// JQube — ErrorPage Component (TSX)

import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  code?: string;
  title?: string;
  description?: string;
}

export default function ErrorPage({
  code = '404',
  title = 'Page Not Found',
  description = 'The page you are looking for does not exist or has been moved.',
}: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] px-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-[#FF3B3B]/10 rounded-2xl border border-[#FF3B3B]/20">
            <ShieldX className="w-10 h-10 text-[#FF3B3B]" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold text-white">{code}</h1>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-[#A1A1AA]">{description}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#FF3B3B]/20 transition-all mt-4"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
