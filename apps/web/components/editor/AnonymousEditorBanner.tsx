'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AnonymousEditorBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-yellow-800">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">
          You're editing in preview mode. <Link href="/login" className="underline font-semibold">Log in</Link> to save your changes.
        </span>
      </div>
    </div>
  );
}
