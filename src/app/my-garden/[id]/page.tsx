'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/lib/supabase';
import type { Identification, PlantResult } from '@/types';
import Header from '@/components/leafwise/header';
import PlantDisplay from '@/components/leafwise/plant-display';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CareReminderForm from '@/components/leafwise/care-reminder-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function GardenDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [identification, setIdentification] = useState<Identification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentification = useCallback(async () => {
    if (!user) return;
    // Don't set loading to true here to avoid flicker on re-fetch
    // setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('identifications')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching identification details:', error);
      setError('Could not find this plant in your garden, or you do not have permission to view it.');
      setIdentification(null);
    } else {
      setIdentification(data as Identification);
    }
    setIsLoading(false);
  }, [user, params.id]);


  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(true);
    fetchIdentification();
  }, [user, router, fetchIdentification]);

  let plantResult: PlantResult | null = null;
  if (identification) {
    plantResult = {
      imageDataUri: identification.image_data_uri,
      plantName: identification.plant_name,
      plantDetails: identification.plant_details,
      careGuide: identification.care_guide,
    };
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button asChild variant="ghost" className="mb-0">
            <Link href="/my-garden">
              <ArrowLeft className="mr-2" />
              Back to My Garden
            </Link>
          </Button>
          <PlantDisplay isLoading={isLoading} result={plantResult} error={error} />
          {isLoading && <Skeleton className="h-96 w-full rounded-lg" />}
          {!isLoading && identification && <CareReminderForm identification={identification} onUpdate={fetchIdentification} />}
        </div>
      </main>
    </div>
  );
}
