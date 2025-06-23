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

// Helper to read file as data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


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

    let filePath = '';

    try {
      const imageDataUri = await fileToDataUri(file);

      // Step 1: Identify Plant (using data URI)
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

      // Step 4: Upload image to Supabase Storage
      const fileExtension = file.name.split('.').pop() || 'png';
      filePath = `${user.id}/${Date.now()}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage.from('plant-images').upload(filePath, file);

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage.from('plant-images').getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded image.');
      }
      
      const newResult: PlantResult = {
        imageUrl: publicUrl,
        plantName: plantDetails.name,
        plantDetails,
        careGuide,
      };
      setResult(newResult);

      // Step 5: Save to Supabase database
      const { error: insertError } = await supabase.from('identifications').insert({
        user_id: user.id,
        plant_name: newResult.plantName,
        plant_details: newResult.plantDetails,
        care_guide: newResult.careGuide,
        image_url: newResult.imageUrl,
      });

      if (insertError) {
        throw new Error(`Your identification was successful but we failed to save it. Error: ${insertError.message}`);
      }

    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
       // If an error occurred after the image was uploaded, try to remove it.
      if (filePath) {
        await supabase.storage.from('plant-images').remove([filePath]);
      }
    } finally {
      setIsLoading(false);
    }
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
