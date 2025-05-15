import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  sample_data: any;
}

function inferDataType(value: any): string {
  if (value === null || value === undefined) return 'unknown';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) return 'date';
    if (value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return 'email';
    if (value.length > 100) return 'text';
    return 'string';
  }
  return 'unknown';
}

function calculateConfidence(sourceColumn: string, targetColumn: string, dataType: string): number {
  let confidence = 0;

  // Name matching confidence
  const sourceLower = sourceColumn.toLowerCase();
  const targetLower = targetColumn.toLowerCase();
  
  // Direct matches
  if (sourceLower === targetLower) confidence += 0.6;
  // Partial matches
  else if (sourceLower.includes(targetLower) || targetLower.includes(sourceLower)) confidence += 0.3;
  
  // Common variations
  const variations = {
    'id': ['id', 'identifier', 'key'],
    'firstName': ['first_name', 'firstname', 'given_name'],
    'lastName': ['last_name', 'lastname', 'surname', 'family_name'],
    'email': ['email', 'email_address', 'mail'],
    'department': ['department', 'dept', 'team', 'unit']
  };

  // Check if source matches any variations of target
  for (const [key, values] of Object.entries(variations)) {
    if (key === targetLower && values.includes(sourceLower)) {
      confidence += 0.3;
      break;
    }
  }

  // Data type confidence
  const expectedTypes = {
    'id': ['string', 'integer'],
    'firstName': ['string'],
    'lastName': ['string'],
    'email': ['email', 'string'],
    'department': ['string', 'integer']
  };

  // Add confidence if data type matches expected type
  for (const [field, types] of Object.entries(expectedTypes)) {
    if (field === targetLower && types.includes(dataType)) {
      confidence += 0.2;
      break;
    }
  }

  return Math.min(confidence, 1); // Cap at 1.0
}

export async function POST(request: Request) {
  try {
    const { connection_string } = await request.json();
    
    // For demo purposes, we'll use a sample dataset
    // In production, this would connect to the actual database using the connection string
    const sampleData = [
      {
        emp_id: '1001',
        first_name: 'John',
        last_name: 'Doe',
        work_email: 'john.doe@company.com',
        dept_id: 'SALES01'
      }
    ];

    // Analyze the first record to get column information
    const columnInfo: ColumnInfo[] = Object.entries(sampleData[0]).map(([column, value]) => ({
      column_name: column,
      data_type: inferDataType(value),
      sample_data: value
    }));

    // Our target schema fields
    const targetFields = ['id', 'firstName', 'lastName', 'email', 'department'];

    // Generate mappings with confidence scores
    const mappings = columnInfo.map(info => {
      // Find best matching target field
      let bestMatch = targetFields[0];
      let highestConfidence = 0;

      for (const targetField of targetFields) {
        const confidence = calculateConfidence(info.column_name, targetField, info.data_type);
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = targetField;
        }
      }

      return {
        sourceColumn: info.column_name,
        targetColumn: bestMatch,
        confidence: highestConfidence,
        dataType: info.data_type,
        sampleData: info.sample_data
      };
    });

    return NextResponse.json({
      success: true,
      mappings
    });

  } catch (error: any) {
    console.error('Schema inference error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to infer schema'
    }, { status: 500 });
  }
}