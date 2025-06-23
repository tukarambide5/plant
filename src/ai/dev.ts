import { config } from 'dotenv';
config();

import '@/ai/flows/generate-care-guide.ts';
import '@/ai/flows/identify-plant.ts';
import '@/ai/flows/get-plant-details.ts';