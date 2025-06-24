'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, VideoOff } from 'lucide-react';

type ARPlantPreviewerProps = {
  plantImageUrl: string | null;
  plantName: string | null;
};

export default function ARPlantPreviewer({ plantImageUrl, plantName }: ARPlantPreviewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl md:text-3xl text-primary">
          <Camera className="h-6 w-6" />
          AR Plant Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          See how a plant looks in your space! Point your camera where you'd like to place the plant.
        </p>
        <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-center p-4">
              <VideoOff className="h-12 w-12 text-destructive mb-4" />
              <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use the AR Preview. You may need to refresh the page after granting permission.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {hasCameraPermission && plantImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl animate-in fade-in-50 zoom-in-75 duration-500">
                <Image
                  src={plantImageUrl}
                  alt={plantName || 'Plant preview'}
                  fill
                  className="object-contain"
                  data-ai-hint="plant"
                />
              </div>
            </div>
          )}

           {hasCameraPermission && !plantImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white text-lg font-semibold">Identify a plant first to preview it here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
