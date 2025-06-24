import type { GetPlantDetailsOutput } from '@/ai/flows/get-plant-details';
import type { GenerateCareGuideOutput } from '@/ai/flows/generate-care-guide';
import type { DiagnosePlantHealthOutput } from '@/ai/flows/diagnose-plant';

/**
 * Represents the result of a plant identification process, used for displaying on the UI.
 */
export type PlantResult = {
  id: string;
  imageUrl: string;
  plantName: string;
  plantDetails: GetPlantDetailsOutput;
  careGuide: GenerateCareGuideOutput;
};

/**
 * Represents a single message in the chat conversation.
 */
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Represents the result of a plant health diagnosis.
 */
export type DiagnosisResult = {
  imageUrl: string;
  diagnosis: DiagnosePlantHealthOutput;
};

/**
 * Represents a single item in the identification history.
 */
export type HistoryItem = {
  id: string;
  imageUrl: string;
  plantName: string;
};

/**
 * Represents a plant placed in the Garden Visualizer.
 */
export type PlacedPlant = {
  id: string; // Unique ID for the instance of the placed plant
  type: string; // e.g., 'Sprout', 'Flower2', 'Trees'
  x: number;
  y: number;
};
