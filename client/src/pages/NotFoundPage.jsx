import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-watchmate-surface border border-watchmate-border flex items-center justify-center text-watchmate-cyan mb-6 shadow-2xl">
        <Film className="w-8 h-8" />
      </div>

      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-watchmate-text mb-2">
        That room isn't here.
      </h1>
      <p className="text-sm text-watchmate-muted max-w-sm mb-8">
        The watch room you are looking for might have closed, expired, or the link may have a typo.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/home"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Lounge</span>
        </Link>
        <Link
          to="/"
          className="px-5 py-3 rounded-2xl text-xs font-semibold bg-watchmate-surface text-watchmate-text border border-watchmate-border hover:bg-watchmate-elevated transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
