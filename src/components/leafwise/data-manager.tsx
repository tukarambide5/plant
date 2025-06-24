'use client';

import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Database } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { UserData, HistoryItem, PlacedPlant } from '@/types';

export default function DataManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const plantHistory = window.localStorage.getItem('plantHistory');
      const gardenLayout = window.localStorage.getItem('gardenLayout');

      const dataToExport: UserData = {
        plantHistory: plantHistory ? JSON.parse(plantHistory) : [],
        gardenLayout: gardenLayout ? JSON.parse(gardenLayout) : [],
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'leafwise-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Your data has been downloaded as leafwise-data.json.',
      });
    } catch (e: any) {
      console.error('Export failed', e);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: e.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read file content.');
        }

        const importedData = JSON.parse(text) as UserData;

        // Basic validation
        if (
          !importedData ||
          !Array.isArray(importedData.plantHistory) ||
          !Array.isArray(importedData.gardenLayout)
        ) {
          throw new Error('Invalid or corrupted data file.');
        }

        window.localStorage.setItem('plantHistory', JSON.stringify(importedData.plantHistory));
        window.localStorage.setItem('gardenLayout', JSON.stringify(importedData.gardenLayout));

        toast({
          title: 'Import Successful',
          description: 'Your data has been restored. The page will now reload.',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error: any) {
        console.error('Import failed', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      } finally {
        // Reset file input to allow importing the same file again
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
          <Database className="h-7 w-7" />
          Manage Your Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Save your identification history and garden layout to a file, or restore it from a backup.
        </p>
        <div className="flex gap-4">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept=".json,application/json"
          />
        </div>
      </CardContent>
    </Card>
  );
}
