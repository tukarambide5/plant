'use server';

/**
 * @fileOverview Generates a personalized care guide for a plant based on its details.
 *
 * - generateCareGuide - A function that generates the care guide.
 * - GenerateCareGuideInput - The input type for the generateCareGuide function.
 * - GenerateCareGuideOutput - The return type for the generateCareGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCareGuideInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  category: z.string().describe('The category of the plant (e.g., succulent, fern).'),
  nativeHabitat: z.string().describe('The native habitat of the plant.'),
  commonUses: z.string().describe('Common uses of the plant.'),
});
export type GenerateCareGuideInput = z.infer<typeof GenerateCareGuideInputSchema>;

const GenerateCareGuideOutputSchema = z.object({
  careGuide: z.string().describe('A personalized care guide for the plant.'),
});
export type GenerateCareGuideOutput = z.infer<typeof GenerateCareGuideOutputSchema>;

export async function generateCareGuide(input: GenerateCareGuideInput): Promise<GenerateCareGuideOutput> {
  return generateCareGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCareGuidePrompt',
  input: {schema: GenerateCareGuideInputSchema},
  output: {schema: GenerateCareGuideOutputSchema},
  prompt: `You are an expert horticulturist. Generate a personalized care guide for the following plant, including specific instructions for watering, sunlight, temperature, and soil needs.

Plant Name: {{{plantName}}}
Category: {{{category}}}
Native Habitat: {{{nativeHabitat}}}
Common Uses: {{{commonUses}}}

Care Guide:`,
});

const generateCareGuideFlow = ai.defineFlow(
  {
    name: 'generateCareGuideFlow',
    inputSchema: GenerateCareGuideInputSchema,
    outputSchema: GenerateCareGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
