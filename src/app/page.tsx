'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { identifyPlant } from '@/ai/flows/identify-plant';
import { getPlantDetails } from '@/ai/flows/get-plant-details';
import { generateCareGuide } from '@/ai/flows/generate-care-guide';
import { supabase } from '@/lib/supabase';

import Header from '@/components/leafwise/header';
import ImageUploader from '@/components/leafwise/image-uploader';
import PlantDisplay from '@/components/leafwise/plant-display';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import type { PlantResult } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const [result, setResult] = useState<PlantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to identify plants.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUri = reader.result as string;

      try {
        // Step 1: Identify Plant
        const { plantSpecies } = await identifyPlant({ photoDataUri: imageDataUri });
        if (!plantSpecies || plantSpecies.toLowerCase().includes("not a plant")) throw new Error('Could not identify the plant. Please try another image.');
        
        // Step 2: Get Plant Details
        const plantDetails = await getPlantDetails({ plantName: plantSpecies });
        if (!plantDetails) throw new Error('Could not retrieve plant details.');
        
        // Step 3: Generate Care Guide
        const careGuide = await generateCareGuide({
          plantName: plantDetails.name,
          category: plantDetails.category,
          nativeHabitat: plantDetails.nativeHabitat,
          commonUses: plantDetails.commonUses,
        });
        if (!careGuide) throw new Error('Could not generate a care guide.');

        const newResult: PlantResult = {
          imageDataUri,
          plantName: plantDetails.name,
          plantDetails,
          careGuide,
        };
        setResult(newResult);

        // Step 4: Save to Supabase
        const { error: insertError } = await supabase.from('identifications').insert({
          user_id: user.id,
          plant_name: newResult.plantName,
          plant_details: newResult.plantDetails,
          care_guide: newResult.careGuide,
          image_data_uri: newResult.imageDataUri,
        });

        if (insertError) {
          console.error('Error saving identification to Supabase:', insertError);
          // Optional: Show a non-blocking toast message about save failure
          toast({
            title: 'Could not save to My Garden',
            description: 'Your identification was successful but we failed to save it to your collection.',
            variant: 'destructive',
          });
        }

      } catch (e: any) {
        const errorMessage = e.message || 'An unexpected error occurred.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      const errorMessage = 'Failed to read the image file.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-headline text-primary mb-2">
              Snap & Grow
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Identify any plant from a photo and get instant care guides to help your green friends thrive.
            </p>
          </section>
          
          {user ? (
            <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />
          ) : (
            <div className="text-center py-10 border border-dashed rounded-lg bg-secondary/30 flex flex-col items-center justify-center">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">Login to Get Started</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Please log in to identify plants and access your personalized care guides.
              </p>
              <Button asChild className="mt-6">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          )}

          <div className="mt-4">
            <PlantDisplay isLoading={isLoading} result={result} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}
