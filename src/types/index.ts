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

/**
 * Represents the structure of a plant identification record as stored in Supabase.
 */
export type Identification = {
  id: string;
  created_at: string;
  user_id: string;
  plant_name: string;
  plant_details: GetPlantDetailsOutput;
  care_guide: GenerateCareGuideOutput;
  image_url: string;
  watering_frequency: number | null;
  last_watered_at: string | null;
  fertilizing_frequency: number | null;
  last_fertilized_at: string | null;
};
