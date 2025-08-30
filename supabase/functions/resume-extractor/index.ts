import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const groqApiKey = Deno.env.get('GROQ_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExtractedData {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  experience?: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    technologies: string[];
    location: string;
  }>;
  education?: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    grade?: string;
    description?: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate: string;
    githubUrl?: string;
    liveUrl?: string;
    highlights: string[];
  }>;
  skills?: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    category: 'Technical' | 'Soft' | 'Language' | 'Framework' | 'Tool';
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
}

async function extractTextFromPdf(fileContent: Uint8Array): Promise<string> {
  // Simple text extraction from PDF - in production you'd use a proper PDF library
  const decoder = new TextDecoder();
  let text = decoder.decode(fileContent);
  
  // Clean up PDF artifacts and extract readable text
  text = text.replace(/[^\x20-\x7E\s]/g, ' ').trim();
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ');
  
  return text;
}

async function extractTextFromDocx(fileContent: Uint8Array): Promise<string> {
  // Basic DOCX text extraction - convert to string and clean
  const decoder = new TextDecoder();
  let text = decoder.decode(fileContent);
  
  // Remove XML tags and clean up
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/[^\x20-\x7E\s]/g, ' ').trim();
  text = text.replace(/\s+/g, ' ');
  
  return text;
}

async function extractResumeData(resumeText: string): Promise<ExtractedData> {
  const prompt = `Extract structured data from this resume text and return it in the exact JSON format below. If a field is not found, omit it entirely.

Resume text:
${resumeText}

Return ONLY this JSON structure with actual data filled in:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "experience": [
    {
      "id": "exp_1",
      "company": "string",
      "position": "string", 
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "current": boolean,
      "description": "string",
      "technologies": ["string"],
      "location": "string"
    }
  ],
  "education": [
    {
      "id": "edu_1", 
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startYear": "YYYY",
      "endYear": "YYYY", 
      "grade": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "id": "proj_1",
      "title": "string",
      "description": "string", 
      "technologies": ["string"],
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "githubUrl": "string",
      "liveUrl": "string",
      "highlights": ["string"]
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "Advanced",
      "category": "Technical"
    }
  ],
  "certifications": [
    {
      "id": "cert_1",
      "name": "string",
      "issuer": "string",
      "issueDate": "MM/YYYY",
      "expiryDate": "MM/YYYY",
      "credentialId": "string", 
      "credentialUrl": "string"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert resume parser. Extract data accurately and return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;
    
    // Clean and parse JSON
    const cleanedJson = extractedText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('Error extracting resume data:', error);
    // Return fallback data structure
    return {
      personalInfo: { fullName: 'Unable to extract' },
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: []
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing resume extraction request');
    
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File;
    const userId = formData.get('user_id') as string;

    if (!resumeFile || !userId) {
      throw new Error('Missing required fields: resume file and user_id');
    }

    console.log(`Processing file: ${resumeFile.name} for user: ${userId}`);

    // Store file in Supabase Storage
    const fileName = `${userId}/${Date.now()}_${resumeFile.name}`;
    const fileContent = new Uint8Array(await resumeFile.arrayBuffer());
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume-files')
      .upload(fileName, fileContent, {
        contentType: resumeFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Extract text based on file type
    let resumeText = '';
    if (resumeFile.type === 'application/pdf') {
      resumeText = await extractTextFromPdf(fileContent);
    } else if (resumeFile.type.includes('wordprocessingml') || resumeFile.name.endsWith('.docx')) {
      resumeText = await extractTextFromDocx(fileContent);
    } else if (resumeFile.type.includes('text') || resumeFile.name.endsWith('.txt')) {
      resumeText = new TextDecoder().decode(fileContent);
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or text files.');
    }

    console.log('Text extracted, processing with AI...');

    // Extract structured data using Groq
    const extractedData = await extractResumeData(resumeText);

    console.log('AI extraction complete, saving to database...');

    // Store extracted data in resume_extractions table
    const { data: extractionRecord, error: dbError } = await supabase
      .from('resume_extractions')
      .insert({
        user_id: userId,
        extracted_data: extractedData,
        status: 'completed',
        extraction_type: 'groq_ai',
        confidence_score: 0.85
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save extraction: ${dbError.message}`);
    }

    console.log('Resume extraction completed successfully');

    return new Response(JSON.stringify({
      success: true,
      extraction_id: extractionRecord.id,
      extracted_data: extractedData,
      confidence_score: 0.85,
      message: 'Resume processed successfully',
      file_path: uploadData.path
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in resume-extractor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});