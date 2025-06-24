'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { identifyPlant } from '@/ai/flows/identify-plant';
import { getPlantDetails } from '@/ai/flows/get-plant-details';
import { generateCareGuide } from '@/ai/flows/generate-care-guide';
import { chatWithAssistant } from '@/ai/flows/chat-with-assistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, HeartPulse } from 'lucide-react';

import Header from '@/components/leafwise/header';
import ImageUploader from '@/components/leafwise/image-uploader';
import PlantDisplay from '@/components/leafwise/plant-display';
import ChatAssistant from '@/components/leafwise/chat-assistant';
import PlantHealthChecker from '@/components/leafwise/plant-health-checker';
import type { PlantResult, ChatMessage } from '@/types';

export default function Home() {
  const [results, setResults] = useState<PlantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleImageSelect = async (files: FileList) => {
    setIsLoading(true);
    setResults([]);
    setError(null);
    setChatMessages([]);

    if (files.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const fileArray = Array.from(files);
    let hasErrorOccurred = false;

    for (const file of fileArray) {
      if (hasErrorOccurred) break;

      try {
        const photoDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

        const { plantName } = await identifyPlant({ photoDataUri });
        if (!plantName || plantName.toLowerCase().includes("not a plant")) {
          throw new Error(`Could not identify the plant in "${file.name}". Please try another image.`);
        }

        const plantDetails = await getPlantDetails({ plantName: plantName });
        if (!plantDetails) throw new Error('Could not retrieve plant details.');

        const careGuide = await generateCareGuide({
          plantName: plantDetails.name,
          category: plantDetails.category,
          nativeHabitat: plantDetails.nativeHabitat,
          commonUses: plantDetails.commonUses,
        });
        if (!careGuide) throw new Error('Could not generate a care guide.');

        const newResult: PlantResult = {
          imageUrl: photoDataUri,
          plantName: plantDetails.name,
          plantDetails,
          careGuide,
        };
        setResults(prev => [...prev, newResult]);

      } catch (e: any) {
        const errorMessage = e.message || 'An unexpected error occurred during analysis.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        hasErrorOccurred = true; // Stop processing further files
      }
    }
    
    setIsLoading(false);
  };
  
  const handleSendMessage = async (message: string) => {
    if (results.length !== 1) return;

    setIsChatLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
        const { answer } = await chatWithAssistant({
            plantName: results[0].plantName,
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
              Your personal plant care assistant. Identify plants, check their health, and get expert advice.
            </p>
          </section>

          <Tabs defaultValue="identify" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identify">
                <Layers className="mr-2" />
                Identify Plant(s)
              </TabsTrigger>
              <TabsTrigger value="health-check">
                <HeartPulse className="mr-2" />
                Health Check
              </TabsTrigger>
            </TabsList>
            <TabsContent value="identify" className="mt-6">
              <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} multiple={true} />
              <div className="mt-8 space-y-8">
                {results.map((result, index) => (
                  <PlantDisplay key={index} result={result} isLoading={false} error={null} />
                ))}

                {isLoading && results.length === 0 && (
                   <PlantDisplay isLoading={true} result={null} error={null} />
                )}
                
                {error && !isLoading && (
                  <PlantDisplay isLoading={false} result={null} error={error} />
                )}

                {results.length === 1 && !isLoading && !error && (
                  <div className="mt-8">
                    <ChatAssistant
                      plantName={results[0].plantName}
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isLoading={isChatLoading}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="health-check" className="mt-6">
              <PlantHealthChecker />
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}
