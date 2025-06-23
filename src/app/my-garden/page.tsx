'use client';

import Header from '@/components/leafwise/header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import Link from 'next/link';

export default function MyGardenPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
                <Alert variant="default" className="max-w-md text-center">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="font-bold">Feature Not Available</AlertTitle>
                    <AlertDescription>
                        User accounts and saved plant collections are no longer available. This app now functions as a stateless plant identifier.
                    </AlertDescription>
                     <Button asChild className="mt-4">
                        <Link href="/">Identify a Plant</Link>
                    </Button>
                </Alert>
            </main>
        </div>
    );
}
