'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X } from 'lucide-react';

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  confidence: number;
  dataType: string;
  sampleData: string;
}

interface SchemaInferenceProps {
  onMappingConfirmed: (mapping: Record<string, string>) => void;
  connectionString: string;
}

export function SchemaInference({ onMappingConfirmed, connectionString }: SchemaInferenceProps) {
  const [inferredMappings, setInferredMappings] = useState<ColumnMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});

  const inferSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations/infer-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_string: connectionString })
      });

      const data = await response.json();
      if (data.success) {
        setInferredMappings(data.mappings);
        // Initialize custom mappings with inferred ones
        const initialMappings = data.mappings.reduce((acc: Record<string, string>, mapping: ColumnMapping) => {
          acc[mapping.sourceColumn] = mapping.targetColumn;
          return acc;
        }, {});
        setCustomMappings(initialMappings);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to infer schema',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (sourceColumn: string, targetColumn: string) => {
    setCustomMappings(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  const handleConfirm = () => {
    onMappingConfirmed(customMappings);
    toast({
      title: 'Success',
      description: 'Column mapping confirmed'
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> High</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-500">Medium</Badge>;
    } else {
      return <Badge className="bg-red-500"><X className="w-3 h-3 mr-1" /> Low</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schema Inference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={inferSchema}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Schema...
              </>
            ) : (
              'Analyze Database Schema'
            )}
          </Button>

          {inferredMappings.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Suggested Column Mappings</div>
              {inferredMappings.map((mapping) => (
                <div key={mapping.sourceColumn} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{mapping.sourceColumn}</span>
                    {getConfidenceBadge(mapping.confidence)}
                  </div>
                  <Input
                    value={customMappings[mapping.sourceColumn] || ''}
                    onChange={(e) => handleMappingChange(mapping.sourceColumn, e.target.value)}
                    placeholder={mapping.targetColumn}
                  />
                  <div className="text-xs text-gray-500">
                    <span>Type: {mapping.dataType}</span>
                    <span className="mx-2">•</span>
                    <span>Sample: {mapping.sampleData}</span>
                  </div>
                </div>
              ))}
              <Button
                onClick={handleConfirm}
                className="w-full mt-4"
              >
                Confirm Mappings
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}