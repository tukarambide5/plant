'use server';

/**
 * @fileOverview An AI agent for retrieving plant details.
 *
 * - getPlantDetails - A function that retrieves details about a plant.
 * - GetPlantDetailsInput - The input type for the getPlantDetails function.
 * - GetPlantDetailsOutput - The return type for the getPlantDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPlantDetailsInputSchema = z.object({
  plantName: z.string().describe('The name of the plant to retrieve details for.'),
});
export type GetPlantDetailsInput = z.infer<typeof GetPlantDetailsInputSchema>;

const GetPlantDetailsOutputSchema = z.object({
  name: z.string().describe('The common name of the plant.'),
  category: z.string().describe('The category of the plant (e.g., flowering plant, succulent).'),
  nativeHabitat: z.string().describe('The native habitat of the plant.'),
  commonUses: z.string().describe('Common uses of the plant (e.g., medicinal, ornamental).'),
});
export type GetPlantDetailsOutput = z.infer<typeof GetPlantDetailsOutputSchema>;

export async function getPlantDetails(input: GetPlantDetailsInput): Promise<GetPlantDetailsOutput> {
  return getPlantDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPlantDetailsPrompt',
  input: {schema: GetPlantDetailsInputSchema},
  output: {schema: GetPlantDetailsOutputSchema},
  prompt: `You are an expert botanist. Your task is to provide detailed information about a specific plant.

  Given the name of a plant, you will return its name, category, native habitat, and common uses.
  Make sure to populate all the fields.

  Plant Name: {{{plantName}}}
  `,
});

const getPlantDetailsFlow = ai.defineFlow(
  {
    name: 'getPlantDetailsFlow',
    inputSchema: GetPlantDetailsInputSchema,
    outputSchema: GetPlantDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
