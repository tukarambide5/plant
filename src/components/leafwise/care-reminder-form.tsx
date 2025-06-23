'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Identification } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { addDays, format, formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarClock, Check, Droplets, Flower2, Save } from 'lucide-react';

type CareReminderFormProps = {
  identification: Identification;
  onUpdate: () => void;
};

export default function CareReminderForm({ identification, onUpdate }: CareReminderFormProps) {
  const { toast } = useToast();
  const [wateringFrequency, setWateringFrequency] = useState(identification.watering_frequency ?? '');
  const [fertilizingFrequency, setFertilizingFrequency] = useState(identification.fertilizing_frequency ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [isFertilizing, setIsFertilizing] = useState(false);

  const handleSaveFrequencies = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('identifications')
      .update({
        watering_frequency: wateringFrequency ? Number(wateringFrequency) : null,
        fertilizing_frequency: fertilizingFrequency ? Number(fertilizingFrequency) : null,
      })
      .eq('id', identification.id);

    if (error) {
      toast({ title: 'Error', description: 'Could not save reminder settings.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Reminder settings saved.' });
      onUpdate();
    }
    setIsSaving(false);
  };

  const handleLogAction = async (actionType: 'water' | 'fertilize') => {
    if (actionType === 'water') setIsWatering(true);
    if (actionType === 'fertilize') setIsFertilizing(true);

    const updateData =
      actionType === 'water'
        ? { last_watered_at: new Date().toISOString() }
        : { last_fertilized_at: new Date().toISOString() };

    const { error } = await supabase.from('identifications').update(updateData).eq('id', identification.id);

    if (error) {
      toast({ title: 'Error', description: `Could not log ${actionType} action.`, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Logged ${actionType} action.` });
      onUpdate();
    }

    if (actionType === 'water') setIsWatering(false);
    if (actionType === 'fertilize') setIsFertilizing(false);
  };
  
  const getNextDueDate = (lastDateStr: string | null, frequency: number | null) => {
    if (!lastDateStr || !frequency) return 'Set frequency and log first action';
    try {
      const lastDate = parseISO(lastDateStr);
      const nextDate = addDays(lastDate, frequency);
      return format(nextDate, 'PPP');
    } catch(e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
          <CalendarClock className="h-7 w-7" />
          Care Reminders
        </CardTitle>
        <CardDescription>Set up and track your plant care schedule.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-12">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Droplets className="h-5 w-5 text-accent"/> Watering</h3>
          <div className="space-y-2">
            <Label htmlFor="watering_freq">Remind me every (days)</Label>
            <Input 
              id="watering_freq" 
              type="number" 
              placeholder="e.g., 7"
              value={wateringFrequency}
              onChange={(e) => setWateringFrequency(e.target.value)}
              min="1"
            />
          </div>
          <Button onClick={() => handleLogAction('water')} disabled={isWatering || isFertilizing || isSaving} className="w-full">
            {isWatering ? 'Logging...' : <><Check className="mr-2" /> I just watered this plant</>}
          </Button>
          <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md space-y-1">
            <p>Last watered: {identification.last_watered_at ? formatDistanceToNow(parseISO(identification.last_watered_at), { addSuffix: true }) : 'Never'}</p>
            <p>Next watering due: {getNextDueDate(identification.last_watered_at, identification.watering_frequency)}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Flower2 className="h-5 w-5 text-accent"/> Fertilizing</h3>
          <div className="space-y-2">
            <Label htmlFor="fertilizing_freq">Remind me every (days)</Label>
            <Input 
              id="fertilizing_freq" 
              type="number" 
              placeholder="e.g., 30"
              value={fertilizingFrequency}
              onChange={(e) => setFertilizingFrequency(e.target.value)}
              min="1"
            />
          </div>
          <Button onClick={() => handleLogAction('fertilize')} disabled={isWatering || isFertilizing || isSaving} className="w-full">
            {isFertilizing ? 'Logging...' : <><Check className="mr-2" /> I just fertilized this plant</>}
          </Button>
          <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md space-y-1">
            <p>Last fertilized: {identification.last_fertilized_at ? formatDistanceToNow(parseISO(identification.last_fertilized_at), { addSuffix: true }) : 'Never'}</p>
            <p>Next fertilizing due: {getNextDueDate(identification.last_fertilized_at, identification.fertilizing_frequency)}</p>
          </div>
        </div>
        <div className="md:col-span-2 flex justify-end pt-4 border-t">
            <Button onClick={handleSaveFrequencies} disabled={isSaving || isWatering || isFertilizing}>
                {isSaving ? 'Saving...' : <><Save className="mr-2" /> Save Reminder Settings</>}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
