'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';
import type { HistoryItem } from '@/types';

type IdentificationHistoryProps = {
  history: HistoryItem[];
  onClearHistory: () => void;
};

export default function IdentificationHistory({ history, onClearHistory }: IdentificationHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
          <History className="h-7 w-7" />
          Recent Identifications
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClearHistory}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary/50">
              <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary">
                 <Image
                  src={item.imageUrl}
                  alt={item.plantName}
                  fill
                  className="object-cover"
                  data-ai-hint="plant"
                />
              </div>
              <p className="font-semibold text-lg text-foreground">{item.plantName}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
