
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sun, VideoOff, Camera } from 'lucide-react';

const getLightLevel = (brightness: number): string => {
  if (brightness < 30) return 'Low Light';
  if (brightness < 60) return 'Medium Light';
  if (brightness < 85) return 'Bright, Indirect Light';
  return 'Direct Sunlight';
};

const getRecommendation = (brightness: number): string => {
    if (brightness < 30) return 'Suitable for low-light tolerant plants like Snake Plants or ZZ Plants.';
    if (brightness < 60) return 'Good for many common houseplants like Pothos or Philodendrons.';
    if (brightness < 85) return 'Ideal for Fiddle Leaf Figs, most ferns, and other tropicals that love brightness.';
    return 'This spot is great for succulents, cacti, and other sun-loving varieties.';
}

export default function LightMeter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const { toast } = useToast();

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

  const handleStartAnalysis = () => {
      if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not start light analysis.' });
          return;
      }
      
      setIsAnalyzing(true);
      
      intervalIdRef.current = setInterval(() => {
          if (video.readyState < 2) return; // Wait for video to be ready
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let colorSum = 0;
          
          for (let i = 0; i < data.length; i += 4) {
              // A simple brightness calculation
              colorSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
          }
          
          // Normalize to a 0-100 scale
          const avgBrightness = (colorSum / (data.length / 4)) / 2.55;
          setBrightness(Math.min(100, Math.round(avgBrightness)));
          
      }, 500);
  };
  
  const handleStopAnalysis = () => {
      setIsAnalyzing(false);
      if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
      }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      handleStopAnalysis();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl md:text-3xl text-primary">
          <Sun className="h-6 w-6" />
          Smart Light Meter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Find the perfect spot for your plant. Point your camera at a location to measure the ambient light level.
        </p>

        <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="hidden"></canvas>
          
          {hasCameraPermission === null && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-center p-4">
                <p className="text-lg font-semibold mb-4">Check the light in your room</p>
                <Button onClick={getCameraPermission}>
                    <Camera className="mr-2" />
                    Enable Camera
                </Button>
            </div>
          )}

          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-center p-4">
              <VideoOff className="h-12 w-12 text-destructive mb-4" />
              <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {hasCameraPermission && (
          <div className="flex flex-col items-center gap-4">
            {!isAnalyzing ? (
              <Button onClick={handleStartAnalysis} size="lg">
                Start Analysis
              </Button>
            ) : (
              <Button onClick={handleStopAnalysis} size="lg" variant="destructive">
                Stop Analysis
              </Button>
            )}
          </div>
        )}

        {isAnalyzing && (
            <div className="space-y-4 pt-4 text-center animate-in fade-in-50">
                <Progress value={brightness} className="h-4" />
                <div className="text-2xl font-bold text-primary">{getLightLevel(brightness)}</div>
                <p className="text-muted-foreground px-4">{getRecommendation(brightness)}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
