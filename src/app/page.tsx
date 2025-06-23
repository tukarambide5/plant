'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { identifyPlant } from '@/ai/flows/identify-plant';
import { getPlantDetails, type GetPlantDetailsOutput } from '@/ai/flows/get-plant-details';
import { generateCareGuide, type GenerateCareGuideOutput } from '@/ai/flows/generate-care-guide';

import Header from '@/components/leafwise/header';
import ImageUploader from '@/components/leafwise/image-uploader';
import PlantDisplay from '@/components/leafwise/plant-display';

export type PlantResult = {
  imageDataUri: string;
  plantName: string;
  plantDetails: GetPlantDetailsOutput;
  careGuide: GenerateCareGuideOutput;
};

export default function Home() {
  const [result, setResult] = useState<PlantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
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

        setResult({
          imageDataUri,
          plantName: plantDetails.name,
          plantDetails,
          careGuide,
        });

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
          
          <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />

          <div className="mt-4">
            <PlantDisplay isLoading={isLoading} result={result} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}
