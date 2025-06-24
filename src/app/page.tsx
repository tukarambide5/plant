'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { identifyPlant } from '@/ai/flows/identify-plant';
import { getPlantDetails } from '@/ai/flows/get-plant-details';
import { generateCareGuide } from '@/ai/flows/generate-care-guide';
import { chatWithAssistant } from '@/ai/flows/chat-with-assistant';

import Header from '@/components/leafwise/header';
import ImageUploader from '@/components/leafwise/image-uploader';
import PlantDisplay from '@/components/leafwise/plant-display';
import ChatAssistant from '@/components/leafwise/chat-assistant';
import type { PlantResult, ChatMessage } from '@/types';

export default function Home() {
  const [result, setResult] = useState<PlantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setChatMessages([]);

    try {
      // Step 1: Convert image to Data URI
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;

        try {
          // Step 2: Identify Plant (using data URI)
          const { plantName } = await identifyPlant({ photoDataUri });
          if (!plantName || plantName.toLowerCase().includes("not a plant")) {
            throw new Error('Could not identify the plant. Please try another image.');
          }

          // Step 3: Get Plant Details
          const plantDetails = await getPlantDetails({ plantName: plantName });
          if (!plantDetails) throw new Error('Could not retrieve plant details.');

          // Step 4: Generate Care Guide
          const careGuide = await generateCareGuide({
            plantName: plantDetails.name,
            category: plantDetails.category,
            nativeHabitat: plantDetails.nativeHabitat,
            commonUses: plantDetails.commonUses,
          });
          if (!careGuide) throw new Error('Could not generate a care guide.');

          const newResult: PlantResult = {
            imageUrl: photoDataUri, // Use data URI for display
            plantName: plantDetails.name,
            plantDetails,
            careGuide,
          };
          setResult(newResult);

        } catch (e: any) {
          const errorMessage = e.message || 'An unexpected error occurred during analysis.';
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
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        setIsLoading(false);
      };
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (!result) return;

    setIsChatLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
        const { answer } = await chatWithAssistant({
            plantName: result.plantName,
            question: message,
        });

        const assistantMessage: ChatMessage = { role: 'assistant', content: answer };
        setChatMessages(prev => [...prev, assistantMessage]);
    } catch (e: any) {
        const errorMessage = e.message || "The chat assistant isn't available right now.";
        toast({
            title: 'Chat Error',
            description: errorMessage,
            variant: 'destructive',
        });
        setChatMessages(prev => prev.slice(0, prev.length - 1));
    } finally {
        setIsChatLoading(false);
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

          <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />

          <div className="mt-4">
            <PlantDisplay isLoading={isLoading} result={result} error={error} />

            {result && !isLoading && !error && (
              <div className="mt-8">
                <ChatAssistant
                  plantName={result.plantName}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isChatLoading}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
