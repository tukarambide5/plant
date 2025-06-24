'use client';

import React, { useState, useEffect, DragEvent } from 'react';
import { Sprout, Flower2, Trees, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PlacedPlant } from '@/types';

const iconMap: { [key: string]: React.ElementType } = {
  Sprout: Sprout,
  Flower2: Flower2,
  Trees: Trees,
};

const PALETTE_PLANTS = [
  { type: 'Sprout', name: 'Seedling' },
  { type: 'Flower2', name: 'Flower' },
  { type: 'Trees', name: 'Tree' },
];

export default function GardenVisualizer() {
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedLayout = window.localStorage.getItem('gardenLayout');
      if (savedLayout) {
        setPlacedPlants(JSON.parse(savedLayout));
      }
    } catch (e) {
      console.error("Failed to load garden layout from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem('gardenLayout', JSON.stringify(placedPlants));
      } catch (e) {
        console.error("Failed to save garden layout to localStorage", e);
      }
    }
  }, [placedPlants, isClient]);


  const handleDragStart = (e: DragEvent<HTMLDivElement>, plantType: string) => {
    e.dataTransfer.setData('plantType', plantType);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plantType = e.dataTransfer.getData('plantType');
    const canvas = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvas.left;
    const y = e.clientY - canvas.top;

    if (plantType) {
      const newPlant: PlacedPlant = {
        id: `${plantType}-${Date.now()}`,
        type: plantType,
        x: x - 24, // Center the icon
        y: y - 24,
      };
      setPlacedPlants(prev => [...prev, newPlant]);
    }
  };

  const handleClearGarden = () => {
    setPlacedPlants([]);
  };

  const PlantIcon = ({ type, ...props }: { type: string; [key: string]: any }) => {
    const Icon = iconMap[type] || Sprout;
    return <Icon {...props} />;
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
          Mini Garden Visualizer
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleClearGarden}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Garden
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Palette */}
          <div className="w-full md:w-48 flex-shrink-0 border-r-0 md:border-r md:pr-4">
            <h3 className="font-semibold mb-2 text-center md:text-left text-muted-foreground">Plant Palette</h3>
            <p className="text-xs text-muted-foreground mb-4 text-center md:text-left">Drag an icon to the canvas.</p>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
              {PALETTE_PLANTS.map(plant => (
                <TooltipProvider key={plant.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, plant.type)}
                        className="flex flex-col items-center p-2 border rounded-md cursor-grab active:cursor-grabbing hover:bg-secondary transition-colors"
                      >
                        <PlantIcon type={plant.type} className="h-8 w-8 text-primary" />
                        <p className="text-xs mt-1 text-center truncate">{plant.name}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{plant.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full h-[400px] md:h-auto bg-secondary/30 rounded-lg border-2 border-dashed flex items-center justify-center min-h-[400px]"
          >
            {placedPlants.length === 0 && (
                <div className="text-center text-muted-foreground pointer-events-none">
                    <p>Your garden is empty.</p>
                    <p className="text-sm">Drop plants here!</p>
                </div>
            )}
            {placedPlants.map(plant => (
              <div
                key={plant.id}
                className="absolute text-primary cursor-pointer"
                style={{ left: `${plant.x}px`, top: `${plant.y}px` }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                        <PlantIcon type={plant.type} className="h-12 w-12" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{plant.type}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
