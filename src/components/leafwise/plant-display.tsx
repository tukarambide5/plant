import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BookOpen, Leaf, Globe, Sparkles, Sprout, Sun, Thermometer, Droplets, Layers, Flower2 } from 'lucide-react';
import type { PlantResult } from '@/app/page';
import IconWithLabel from './icon-with-label';

type PlantDisplayProps = {
  isLoading: boolean;
  result: PlantResult | null;
  error: string | null;
};

export default function PlantDisplay({ isLoading, result, error }: PlantDisplayProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-25">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg bg-secondary/30">
        <Sprout className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">Awaiting Plant</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload an image to see plant details and care instructions here.
        </p>
      </div>
    );
  }

  const { imageDataUri, plantName, plantDetails, careGuide } = result;

  return (
    <div className="grid gap-8 animate-in fade-in-50 duration-500">
      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-secondary">
            <Image
              src={imageDataUri}
              alt={plantName}
              fill
              className="object-cover"
              data-ai-hint="plant"
            />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <CardHeader className="p-0 mb-6">
              <p className="text-sm font-medium text-accent font-body tracking-wider uppercase">Identified Plant</p>
              <CardTitle className="text-4xl font-headline text-primary">{plantName}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 grid gap-4">
              <IconWithLabel icon={Leaf} label="Category" value={plantDetails.category} />
              <IconWithLabel icon={Globe} label="Native Habitat" value={plantDetails.nativeHabitat} />
              <IconWithLabel icon={Sparkles} label="Common Uses" value={plantDetails.commonUses} />
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
            <BookOpen className="h-7 w-7" />
            Care Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
          <IconWithLabel icon={Droplets} label="Watering" value={careGuide.watering} />
          <IconWithLabel icon={Sun} label="Sunlight" value={careGuide.sunlight} />
          <IconWithLabel icon={Thermometer} label="Temperature" value={careGuide.temperature} />
          <IconWithLabel icon={Layers} label="Soil" value={careGuide.soil} />
          <IconWithLabel icon={Flower2} label="Fertilizing" value={careGuide.fertilizing} />
        </CardContent>
      </Card>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid gap-8">
    <Card className="overflow-hidden shadow-lg">
      <div className="grid md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="p-6 flex flex-col justify-center">
          <CardHeader className="p-0 mb-6">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-10 w-3/4" />
          </CardHeader>
          <CardContent className="p-0 grid gap-4">
             <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full mt-1" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full mt-1" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full mt-1" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
    <Card className="shadow-lg">
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
        {[...Array(5)].map((_, i) => (
          <div className="flex items-start gap-3" key={i}>
            <Skeleton className="h-5 w-5 rounded-full mt-1" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
