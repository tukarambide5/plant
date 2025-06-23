import type { GetPlantDetailsOutput } from '@/ai/flows/get-plant-details';
import type { GenerateCareGuideOutput } from '@/ai/flows/generate-care-guide';

/**
 * Represents the result of a plant identification process, used for displaying on the UI.
 */
export type PlantResult = {
  imageUrl: string;
  plantName: string;
  plantDetails: GetPlantDetailsOutput;
  careGuide: GenerateCareGuideOutput;
};
