// FILE: components/persona-card.tsx
// This is the final, fully reactive version.

"use client";

import { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";

// Define the shape of a persona for type safety
interface Persona {
  id: string;
  name: string;
  avatar?: string;
  demographics?: { age?: number; occupation?: string };
  traits?: string[];
  pain_points?: string[];
  goals?: string[];
  [key: string]: any;
}

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void; // This is called when the user clicks the chat button
}

// Using React.memo tells this component to only re-render if its props have truly changed.
export const PersonaCard = memo(function PersonaCard({ persona, onClick }: PersonaCardProps) {
  // Defensive check in case persona data is ever missing
  if (!persona) return null;

  return (
    <Card className="flex flex-col h-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={persona.avatar} alt={persona.name} />
          <AvatarFallback>{persona.name?.charAt(0) || 'P'}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl font-bold text-gray-800">{persona.name || "Unnamed Persona"}</CardTitle>
          <p className="text-sm text-gray-500">
            {persona.demographics?.age}{persona.demographics?.occupation && `, ${persona.demographics.occupation}`}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm flex-grow">
        {/* Traits Section */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-700">Traits</h4>
          <div className="flex flex-wrap gap-2">
            {(persona.traits ?? []).map((trait, i) => (
              <Badge key={i} variant="secondary" className="bg-pink-100 text-pink-800">
                {trait}
              </Badge>
            ))}
          </div>
        </div>
        {/* Goals Section */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-700">Goals</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {(persona.goals ?? []).map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>
        </div>
      </CardContent>

      {/* Action Button to open chat */}
      <div className="p-4 pt-0 mt-auto">
         <Button onClick={onClick} variant="outline" className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat with {persona.name}
        </Button>
      </div>
    </Card>
  );
});