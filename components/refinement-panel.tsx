// FILE: components/refinement-panel.tsx
// This is the complete, intelligent component that fixes the UI update issue.

"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { RefreshCw, Wand2 } from 'lucide-react';

interface RefinementPanelProps {
  onRefine: (refinements: any) => void;
  isRefining: boolean;
}

export function RefinementPanel({ onRefine, isRefining }: RefinementPanelProps) {
  // --- This component manages its own internal state for the controls ---
  const [budgetLevel, setBudgetLevel] = useState([50]);
  const [customerFocus, setCustomerFocus] = useState([50]);
  const [tone, setTone] = useState('professional');
  const [includeDemographicVariations, setIncludeDemographicVariations] = useState(false);
  const [generateCampaignSuggestions, setGenerateCampaignSuggestions] = useState(false);
  const [includePainPointAnalysis, setIncludePainPointAnalysis] = useState(false);

  // --- This function gathers all the state and sends it to the parent ---
  const handleApplyChanges = () => {
    const refinements = {
      budgetLevel: budgetLevel[0],
      customerFocus: customerFocus[0],
      tone,
      includeDemographicVariations,
      generateCampaignSuggestions,
      includePainPointAnalysis,
    };
    // This calls the function that was passed down from DashboardPage
    onRefine(refinements);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-purple-500" />
          Refine Personas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Level Slider */}
        <div className="space-y-2">
          <Label>Budget Level</Label>
          <Slider
            value={budgetLevel}
            onValueChange={setBudgetLevel}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low Budget</span>
            <span>High Budget</span>
          </div>
        </div>

        {/* Customer Segment Focus Slider */}
        <div className="space-y-2">
          <Label>Customer Segment Focus</Label>
          <Slider
            value={customerFocus}
            onValueChange={setCustomerFocus}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Broad Market</span>
            <span>Niche Focus</span>
          </div>
        </div>

        {/* Messaging Tone Dropdown */}
        <div className="space-y-2">
          <Label>Messaging Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional & Formal</SelectItem>
              <SelectItem value="friendly">Friendly & Casual</SelectItem>
              <SelectItem value="humorous">Humorous & Witty</SelectItem>
              <SelectItem value="inspirational">Inspirational & Aspirational</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Options Switches */}
        <div className="space-y-4 pt-4 border-t">
            <h4 className='font-semibold text-sm'>Advanced Options</h4>
             <div className="flex items-center justify-between">
                <Label htmlFor="demographic-variations">Include demographic variations</Label>
                <Switch id="demographic-variations" checked={includeDemographicVariations} onCheckedChange={setIncludeDemographicVariations} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="campaign-suggestions">Generate campaign suggestions</Label>
                <Switch id="campaign-suggestions" checked={generateCampaignSuggestions} onCheckedChange={setGenerateCampaignSuggestions} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="pain-point-analysis">Include pain point analysis</Label>
                <Switch id="pain-point-analysis" checked={includePainPointAnalysis} onCheckedChange={setIncludePainPointAnalysis} />
            </div>
        </div>

        {/* Apply Button */}
        <Button onClick={handleApplyChanges} disabled={isRefining} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          {isRefining ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Apply Changes
        </Button>
      </CardContent>
    </Card>
  );
}