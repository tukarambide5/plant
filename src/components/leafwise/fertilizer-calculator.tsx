
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Beaker } from 'lucide-react';

type PlantType = 'foliage' | 'flowering' | 'succulent';
type FertilizerType = 'liquid' | 'granular';

interface CalculationResult {
  npk: string;
  amount: string;
  frequency: string;
  instructions: string;
}

export default function FertilizerCalculator() {
  const [plantType, setPlantType] = useState<PlantType | ''>('');
  const [potSize, setPotSize] = useState<number | ''>('');
  const [fertilizerType, setFertilizerType] = useState<FertilizerType | ''>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    if (!plantType || !potSize || !fertilizerType) {
      setError('Please fill in all fields to get a recommendation.');
      setResult(null);
      return;
    }
    setError(null);

    let npk = '';
    let frequency = '';
    let amount = '';
    let instructions = '';

    // NPK and Frequency based on plant type
    switch (plantType) {
      case 'foliage':
        npk = 'High in Nitrogen (e.g., 20-10-10 or 3-1-2 ratio)';
        frequency = 'Every 2-4 weeks during the growing season (spring/summer).';
        break;
      case 'flowering':
        npk = 'High in Phosphorus (e.g., 10-20-10 or 1-2-1 ratio)';
        frequency = 'Every 1-2 weeks during the blooming season.';
        break;
      case 'succulent':
        npk = 'Low, balanced ratio (e.g., 5-10-5 or 10-10-10 diluted)';
        frequency = 'Once a month during the growing season only.';
        break;
    }

    // Amount and Instructions based on pot size and fertilizer type
    const potDiameter = Number(potSize);
    if (fertilizerType === 'liquid') {
      const dilutionRate = plantType === 'succulent' ? '1/4 to 1/2' : '1/2';
      amount = `Dilute to ${dilutionRate} strength. For a ${potDiameter}-inch pot, use approximately ${Math.round(potDiameter * 1.5)} fl oz of diluted solution per watering.`;
      instructions = 'Always water the plant with plain water before applying liquid fertilizer to avoid root burn. Apply to moist soil.';
    } else { // granular
      const teaspoons = Math.max(1, Math.round(potDiameter / 6));
      amount = `Use approximately ${teaspoons} teaspoon${teaspoons > 1 ? 's' : ''} for a ${potDiameter}-inch pot.`;
      instructions = 'Sprinkle granules evenly on the soil surface, avoiding the plant stem. Gently mix into the top inch of soil and water thoroughly.';
    }

    setResult({ npk, frequency, amount, instructions });
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl md:text-3xl text-primary">
          <Beaker className="h-6 w-6" />
          Fertilizer Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Get a general fertilizer recommendation for your houseplant. This is a guideline; always check your specific plant's needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="plant-type">Plant Type</Label>
            <Select onValueChange={(value) => setPlantType(value as PlantType)} value={plantType}>
              <SelectTrigger id="plant-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foliage">Foliage Plant</SelectItem>
                <SelectItem value="flowering">Flowering Plant</SelectItem>
                <SelectItem value="succulent">Succulent/Cactus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pot-size">Pot Diameter (inches)</Label>
            <Input
              id="pot-size"
              type="number"
              placeholder="e.g., 6"
              value={potSize}
              onChange={(e) => setPotSize(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="fertilizer-type">Fertilizer Type</Label>
            <Select onValueChange={(value) => setFertilizerType(value as FertilizerType)} value={fertilizerType}>
              <SelectTrigger id="fertilizer-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="liquid">Liquid</SelectItem>
                <SelectItem value="granular">Granular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleCalculate} className="w-full md:w-auto">Calculate</Button>

        {error && (
            <Alert variant="destructive" className="mt-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {result && (
          <div className="mt-6 border-t pt-6 space-y-4 animate-in fade-in-50">
             <h3 className="text-xl font-headline text-primary">Your Recommendation</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">N-P-K Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{result.npk}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Frequency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{result.frequency}</p>
                    </CardContent>
                </Card>
                 <Card className="sm:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Application</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{result.amount}</p>
                        <p className="text-sm text-muted-foreground mt-1">{result.instructions}</p>
                    </CardContent>
                </Card>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
