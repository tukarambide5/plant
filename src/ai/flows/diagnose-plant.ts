'use server';

/**
 * @fileOverview An AI agent for diagnosing plant health problems from an image.
 *
 * - diagnosePlantHealth - A function that handles the plant diagnosis process.
 * - DiagnosePlantHealthInput - The input type for the diagnosePlantHealth function.
 * - DiagnosePlantHealthOutput - The return type for the diagnosePlantHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  plantName: z.string().optional().describe('The optional name of the plant to provide more context.'),
});
export type DiagnosePlantHealthInput = z.infer<typeof DiagnosePlantHealthInputSchema>;

const DiagnosePlantHealthOutputSchema = z.object({
    isHealthy: z.boolean().describe('Whether the plant appears to be healthy or not.'),
    diagnosis: z.string().describe("A summary of the plant's health issues, if any."),
    recommendations: z.array(z.string()).describe('A list of actionable recommendations to improve the plant\'s health.'),
});
export type DiagnosePlantHealthOutput = z.infer<typeof DiagnosePlantHealthOutputSchema>;

export async function diagnosePlantHealth(input: DiagnosePlantHealthInput): Promise<DiagnosePlantHealthOutput> {
  return diagnosePlantHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantHealthPrompt',
  input: {schema: DiagnosePlantHealthInputSchema},
  output: {schema: DiagnosePlantHealthOutputSchema},
  prompt: `You are an expert plant pathologist. Your task is to analyze an image of a plant and diagnose any health problems.
If the user provides the plant name, use it for context.

Based on the image, determine if the plant is healthy.
If it is not healthy, provide a clear diagnosis of the issue (e.g., "powdery mildew," "spider mite infestation," "overwatering").
Then, provide a list of actionable recommendations to help the user treat the problem.

Image: {{media url=photoDataUri}}
{{#if plantName}}
Plant Name: {{{plantName}}}
{{/if}}
`,
});

const diagnosePlantHealthFlow = ai.defineFlow(
  {
    name: 'diagnosePlantHealthFlow',
    inputSchema: DiagnosePlantHealthInputSchema,
    outputSchema: DiagnosePlantHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
