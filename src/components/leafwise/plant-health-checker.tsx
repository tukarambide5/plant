'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { diagnosePlantHealth } from '@/ai/flows/diagnose-plant';
import type { DiagnosePlantHealthOutput } from '@/ai/flows/diagnose-plant';
import ImageUploader from '@/components/leafwise/image-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, HeartPulse, ListChecks, Stethoscope } from 'lucide-react';

type DiagnosisResult = {
  imageUrl: string;
  diagnosis: DiagnosePlantHealthOutput;
};

export default function PlantHealthChecker() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;

        try {
          const diagnosis = await diagnosePlantHealth({ photoDataUri });
          setResult({ imageUrl: photoDataUri, diagnosis });
        } catch (e: any) {
          const errorMessage = e.message || 'An unexpected error occurred during health analysis.';
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

  return (
    <div className="space-y-8">
      <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />
      <div className="mt-4">
        {isLoading && <LoadingSkeleton />}
        {error && !isLoading && (
            <Alert variant="destructive" className="animate-in fade-in-25">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {result && !isLoading && <DiagnosisDisplay result={result} />}
      </div>
    </div>
  );
}

const DiagnosisDisplay = ({ result }: { result: DiagnosisResult }) => {
    const { imageUrl, diagnosis } = result;

    return (
        <Card className="overflow-hidden shadow-lg animate-in fade-in-50 duration-500">
            <div className="grid md:grid-cols-2">
                 <div className="relative aspect-square bg-secondary">
                    <Image
                    src={imageUrl}
                    alt="Plant for health check"
                    fill
                    className="object-cover"
                    data-ai-hint="sick plant"
                    />
                </div>
                <div className="p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
                            <Stethoscope className="h-7 w-7" />
                            Health Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                        <Alert variant={diagnosis.isHealthy ? "default" : "destructive"} className={diagnosis.isHealthy ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}>
                            {diagnosis.isHealthy ? <CheckCircle2 className={`h-5 w-5 ${diagnosis.isHealthy ? "text-green-600 dark:text-green-400" : ""}`} /> : <AlertTriangle className="h-5 w-5" />}
                            <AlertTitle className="text-lg">{diagnosis.isHealthy ? "Plant is Healthy" : "Health Issue Detected"}</AlertTitle>
                            <AlertDescription>
                                {diagnosis.diagnosis}
                            </AlertDescription>
                        </Alert>
                        
                        {!diagnosis.isHealthy && diagnosis.recommendations.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground mb-3">
                                    <ListChecks className="h-5 w-5 text-accent" />
                                    Recommendations
                                </h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    {diagnosis.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </div>
            </div>
        </Card>
    );
};


const LoadingSkeleton = () => (
    <Card className="overflow-hidden shadow-lg">
      <div className="grid md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="p-6">
          <CardHeader className="p-0 mb-6">
            <Skeleton className="h-8 w-2/3 mb-4" />
          </CardHeader>
          <CardContent className="p-0 grid gap-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
);
