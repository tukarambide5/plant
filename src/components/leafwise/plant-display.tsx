import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, BookOpen, Leaf, Globe, Sparkles, Sprout, Sun, Thermometer, Droplets, Layers, Flower2, ExternalLink } from 'lucide-react';
import type { PlantResult } from '@/types';
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

  if (error && !result) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-25">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription>
          {error} You can try again with a different image, or use another tool for identification.
        </AlertDescription>
        <div className="mt-4">
            <Button asChild variant="outline">
                <a href="https://lens.google.com" target="_blank" rel="noopener noreferrer">
                    Try with Google Lens
                    <ExternalLink className="ml-2 h-4 w-4" />
                </a>
            </Button>
        </div>
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

  const { imageUrl, plantName, plantDetails, careGuide } = result;

  const careItems = [
    { icon: Droplets, label: "Watering", points: careGuide.watering },
    { icon: Sun, label: "Sunlight", points: careGuide.sunlight },
    { icon: Thermometer, label: "Temperature", points: careGuide.temperature },
    { icon: Layers, label: "Soil", points: careGuide.soil },
    { icon: Flower2, label: "Fertilizing", points: careGuide.fertilizing },
  ];

  return (
    <div className="grid gap-8 animate-in fade-in-50 duration-500">
      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-secondary">
            <Image
              src={imageUrl}
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
        <CardContent className="pt-2 text-sm">
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] font-semibold text-foreground">Care Aspect</TableHead>
                <TableHead className="font-semibold text-foreground">Recommendations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careItems.map(({ icon: Icon, label, points }) => (
                <TableRow key={label}>
                  <TableCell className="font-medium align-top">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      <CardContent className="pt-2">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div className="flex items-start gap-4" key={i}>
              <div className="w-[120px] space-y-2">
                <Skeleton className="h-5 w-1/3" />
              </div>
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
