'use client';

import { Sprout } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="py-4 px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
          <Sprout className="h-7 w-7" />
          <span className="text-2xl font-headline font-bold">
            LeafWise
          </span>
        </Link>
      </div>
    </header>
  );
}
