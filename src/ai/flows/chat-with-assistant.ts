'use server';

/**
 * @fileOverview A Genkit flow for a gardening chat assistant.
 *
 * - chatWithAssistant - A function that handles a chat interaction.
 * - ChatWithAssistantInput - The input type for the chatWithAssistant function.
 * - ChatWithAssistantOutput - The return type for the chatWithAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithAssistantInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant being discussed.'),
  question: z.string().describe("The user's question about the plant."),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  answer: z.string().describe("The assistant's answer to the user's question."),
});
export type ChatWithAssistantOutput = z.infer<typeof ChatWithAssistantOutputSchema>;

export async function chatWithAssistant(input: ChatWithAssistantInput): Promise<ChatWithAssistantOutput> {
  return chatWithAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithAssistantPrompt',
  input: {schema: ChatWithAssistantInputSchema},
  output: {schema: ChatWithAssistantOutputSchema},
  prompt: `You are a friendly and knowledgeable gardening assistant called LeafWise Assistant.
You are helping a user with their plant, a "{{plantName}}".
Answer the user's question concisely and helpfully.

User's question: "{{question}}"
`,
});

const chatWithAssistantFlow = ai.defineFlow(
  {
    name: 'chatWithAssistantFlow',
    inputSchema: ChatWithAssistantInputSchema,
    outputSchema: ChatWithAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
