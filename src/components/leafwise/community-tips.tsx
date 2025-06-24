
'use client';

import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import tips from '@/data/tips.json';

export default function CommunityTips() {
  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-3xl text-primary">
          <Lightbulb className="h-7 w-7" />
          Plant Care Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          A collection of tips and tricks from the community to help your plants thrive.
        </p>
        <Accordion type="single" collapsible className="w-full">
          {tips.map((tip, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{tip.title}</AccordionTrigger>
              <AccordionContent>
                {tip.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
