'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/lib/supabase';
import type { Identification } from '@/types';

import Header from '@/components/leafwise/header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Calendar, Leaf, PlusCircle, Sprout } from 'lucide-react';

export default function MyGardenPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchIdentifications = async () => {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('identifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching identifications:', error);
        setError('Failed to load your garden. Please try again later.');
      } else {
        setIdentifications(data as Identification[]);
      }
      setIsLoading(false);
    };

    fetchIdentifications();
  }, [user, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-headline text-primary">My Garden</h1>
              <p className="text-lg text-muted-foreground mt-1">Your personal collection of identified plants.</p>
            </div>
            <Button asChild>
              <Link href="/">
                <PlusCircle className="mr-2" />
                Identify New Plant
              </Link>
            </Button>
          </div>
          
          {isLoading && <GardenSkeleton />}
          {error && <GardenError message={error} />}
          {!isLoading && !error && identifications.length === 0 && <EmptyGarden />}
          
          {!isLoading && !error && identifications.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {identifications.map((plant) => (
                <Link href={`/my-garden/${plant.id}`} key={plant.id} className="group">
                  <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={plant.image_data_uri}
                        alt={`Image of ${plant.plant_name}`}
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        data-ai-hint="plant"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-headline text-2xl text-primary">{plant.plant_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Leaf className="h-4 w-4 mr-2 text-accent" />
                        <span>{plant.plant_details.category}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        <span>Identified {formatDistanceToNow(new Date(plant.created_at), { addSuffix: true })}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const GardenSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="h-full flex flex-col">
        <Skeleton className="aspect-square w-full" />
        <CardHeader>
          <Skeleton className="h-7 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-2/3" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const GardenError = ({ message }: { message: string }) => (
   <Alert variant="destructive" className="mt-8">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const EmptyGarden = () => (
  <div className="text-center py-16 border border-dashed rounded-lg bg-secondary/30 flex flex-col items-center justify-center">
    <Sprout className="mx-auto h-16 w-16 text-muted-foreground" />
    <h3 className="mt-4 text-xl font-semibold text-foreground">Your garden is empty</h3>
    <p className="mt-2 text-base text-muted-foreground max-w-sm">
      Start by identifying a plant, and it will be saved to your collection here.
    </p>
    <Button asChild className="mt-6">
      <Link href="/">Identify Your First Plant</Link>
    </Button>
  </div>
);
