'use server';

/**
 * @fileOverview This file defines a Genkit flow for identifying plant species from an image.
 *
 * - identifyPlant - The main function to trigger the plant identification flow.
 * - IdentifyPlantInput - The input type for the identifyPlant function, which includes the public image URL.
 * - IdentifyPlantOutput - The output type for the identifyPlant function, providing the identified plant species.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantInputSchema = z.object({
  photoUrl: z
    .string()
    .url()
    .describe('A public URL of a photo of a plant.'),
});
export type IdentifyPlantInput = z.infer<typeof IdentifyPlantInputSchema>;

const IdentifyPlantOutputSchema = z.object({
  plantSpecies: z.string().describe('The identified plant species.'),
});
export type IdentifyPlantOutput = z.infer<typeof IdentifyPlantOutputSchema>;

export async function identifyPlant(input: IdentifyPlantInput): Promise<IdentifyPlantOutput> {
  return identifyPlantFlow(input);
}

const identifyPlantPrompt = ai.definePrompt({
  name: 'identifyPlantPrompt',
  input: {schema: IdentifyPlantInputSchema},
  output: {schema: IdentifyPlantOutputSchema},
  prompt: `You are an expert botanist. Please identify the plant species in the image provided.

  Image: {{media url=photoUrl}}
  \n
  Respond with just the plant species.`, // Just respond with the plant species, nothing else
});

const identifyPlantFlow = ai.defineFlow(
  {
    name: 'identifyPlantFlow',
    inputSchema: IdentifyPlantInputSchema,
    outputSchema: IdentifyPlantOutputSchema,
  },
  async input => {
    const {output} = await identifyPlantPrompt(input);
    return output!;
  }
);
