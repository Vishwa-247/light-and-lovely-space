import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { ExtractedResumeData, ResumeExtraction } from "@/types/resume";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export const useResumeExtraction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [extractions, setExtractions] = useState<ResumeExtraction[]>([]);
  const [currentExtraction, setCurrentExtraction] = useState<ResumeExtraction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's resume extractions
  useEffect(() => {
    if (user) {
      loadExtractions();
    }
  }, [user]);

  const loadExtractions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resume_extractions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types
      const transformedData = (data || []).map(item => ({
        ...item,
        extracted_data: item.extracted_data as ExtractedResumeData,
        applied_at: item.applied_at || undefined,
        applied_by: item.applied_by || undefined
      })) as ResumeExtraction[];
      
      setExtractions(transformedData);
      
      // Set the most recent pending extraction as current
      const pendingExtraction = transformedData.find(e => e.status === 'completed' && !e.applied_at);
      if (pendingExtraction) {
        setCurrentExtraction(pendingExtraction);
      }
    } catch (error: any) {
      console.error("Error loading extractions:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createExtraction = async (resumeId: string, extractedData: ExtractedResumeData) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resume_extractions')
        .insert({
          user_id: user.id,
          resume_id: resumeId,
          extracted_data: extractedData as Json,
          status: 'completed',
          extraction_type: 'groq_ai',
          confidence_score: 0.85
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data
      const transformedData = {
        ...data,
        extracted_data: data.extracted_data as ExtractedResumeData,
        applied_at: data.applied_at || undefined,
        applied_by: data.applied_by || undefined
      } as ResumeExtraction;

      setCurrentExtraction(transformedData);
      await loadExtractions(); // Refresh the list
      
      return data;
    } catch (error: any) {
      console.error("Error creating extraction:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to save extracted data",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const applyExtraction = async (extractionId: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // Mark extraction as applied
      const { error } = await supabase
        .from('resume_extractions')
        .update({
          applied_at: new Date().toISOString(),
          applied_by: user.id
        })
        .eq('id', extractionId);

      if (error) throw error;

      // Update local state
      setCurrentExtraction(null);
      await loadExtractions();

      toast({
        title: "Success! 🎉",
        description: "Your profile has been updated with the extracted data.",
      });

      return true;
    } catch (error: any) {
      console.error("Error applying extraction:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to apply extracted data",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectExtraction = async (extractionId: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('resume_extractions')
        .delete()
        .eq('id', extractionId);

      if (error) throw error;

      setCurrentExtraction(null);
      await loadExtractions();

      toast({
        title: "Extraction Rejected",
        description: "The extracted data has been discarded.",
      });

      return true;
    } catch (error: any) {
      console.error("Error rejecting extraction:", error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractions,
    currentExtraction,
    isLoading,
    error,
    createExtraction,
    applyExtraction,
    rejectExtraction,
    loadExtractions,
  };
};