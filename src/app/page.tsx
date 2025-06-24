
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { identifyPlant } from '@/ai/flows/identify-plant';
import { getPlantDetails } from '@/ai/flows/get-plant-details';
import { generateCareGuide } from '@/ai/flows/generate-care-guide';
import { chatWithAssistant } from '@/ai/flows/chat-with-assistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, HeartPulse, Leaf, Camera, Lightbulb, Sun, Beaker } from 'lucide-react';

import Header from '@/components/leafwise/header';
import ImageUploader from '@/components/leafwise/image-uploader';
import PlantDisplay from '@/components/leafwise/plant-display';
import ChatAssistant from '@/components/leafwise/chat-assistant';
import PlantHealthChecker from '@/components/leafwise/plant-health-checker';
import IdentificationHistory from '@/components/leafwise/identification-history';
import GardenVisualizer from '@/components/leafwise/garden-visualizer';
import ARPlantPreviewer from '@/components/leafwise/ar-plant-previewer';
import CommunityTips from '@/components/leafwise/community-tips';
import LightMeter from '@/components/leafwise/light-meter';
import DataManager from '@/components/leafwise/data-manager';
import FertilizerCalculator from '@/components/leafwise/fertilizer-calculator';
import type { PlantResult, ChatMessage, HistoryItem } from '@/types';

// Helper function to create a smaller thumbnail from a data URI.
// This is used to avoid exceeding the browser's localStorage quota.
const createThumbnailDataUri = (dataUri: string, maxWidth = 128, maxHeight = 128): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get 2D context from canvas.'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Use JPEG format for smaller file size compared to PNG.
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = dataUri;
  });
};

export default function Home() {
  const [results, setResults] = useState<PlantResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedHistory = window.localStorage.getItem('plantHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }
  }, []);

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
          id: photoDataUri,
          imageUrl: photoDataUri,
          plantName: plantDetails.name,
          plantDetails,
          careGuide,
        };
        setResults(prev => [...prev, newResult]);
        
        // Create a smaller thumbnail to avoid exceeding localStorage quota.
        const thumbnailDataUri = await createThumbnailDataUri(photoDataUri);

        setHistory(prevHistory => {
          const newHistoryItem: HistoryItem = { 
            id: thumbnailDataUri, // Using thumbnail as ID is fine, it's unique and small.
            imageUrl: thumbnailDataUri, 
            plantName: newResult.plantName 
          };
          // Filter out previous entry if it's the same image to prevent duplicates
          const filteredHistory = prevHistory.filter(item => item.id !== newHistoryItem.id);
          const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 5);
          try {
            window.localStorage.setItem('plantHistory', JSON.stringify(updatedHistory));
          } catch (e) {
             console.error("Failed to save history to localStorage", e);
             // We don't toast here, as the user might not care about history failing to save.
          }
          return updatedHistory;
        });

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
  
  const handleClearHistory = () => {
    setHistory([]);
    try {
      window.localStorage.removeItem('plantHistory');
    } catch (e) {
      console.error("Failed to clear history from localStorage", e);
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
            <TabsList>
              <TabsTrigger value="identify">
                <ScanLine className="h-5 w-5" />
                <span className="hidden md:inline">Identify</span>
              </TabsTrigger>
              <TabsTrigger value="health-check">
                <HeartPulse className="h-5 w-5" />
                <span className="hidden md:inline">Health Check</span>
              </TabsTrigger>
               <TabsTrigger value="light-meter">
                <Sun className="h-5 w-5" />
                <span className="hidden md:inline">Light Meter</span>
              </TabsTrigger>
              <TabsTrigger value="garden">
                <Leaf className="h-5 w-5" />
                <span className="hidden md:inline">My Garden</span>
              </TabsTrigger>
              <TabsTrigger value="ar-preview">
                <Camera className="h-5 w-5" />
                <span className="hidden md:inline">AR Preview</span>
              </TabsTrigger>
              <TabsTrigger value="tips">
                <Lightbulb className="h-5 w-5" />
                <span className="hidden md:inline">Tips</span>
              </TabsTrigger>
               <TabsTrigger value="fertilizer">
                <Beaker className="h-5 w-5" />
                <span className="hidden md:inline">Fertilizer</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="identify" className="mt-6">
              <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} multiple={true} />
              <div className="mt-8 space-y-8">
                {results.map((result) => (
                  <PlantDisplay key={result.id} result={result} isLoading={false} error={null} />
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
            <TabsContent value="light-meter" className="mt-6">
              <LightMeter />
            </TabsContent>
            <TabsContent value="garden" className="mt-6">
              <GardenVisualizer />
            </TabsContent>
            <TabsContent value="ar-preview" className="mt-6">
              <ARPlantPreviewer 
                plantImageUrl={results.length > 0 ? results[0].imageUrl : null}
                plantName={results.length > 0 ? results[0].plantName : null}
              />
            </TabsContent>
            <TabsContent value="tips" className="mt-6">
              <CommunityTips />
            </TabsContent>
             <TabsContent value="fertilizer" className="mt-6">
              <FertilizerCalculator />
            </TabsContent>
          </Tabs>

          {isClient && (
            <div className="mt-12 space-y-8">
              {history.length > 0 && (
                <IdentificationHistory
                  history={history}
                  onClearHistory={handleClearHistory}
                />
              )}
              <DataManager />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
