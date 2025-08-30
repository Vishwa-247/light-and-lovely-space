import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Sparkles, Download, Eye, Loader2, Brain, Zap } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import ResumePreview from "./ResumePreview";
import AgenticResumeConfirmation from "./AgenticResumeConfirmation";
import ResumeFilePreview from "./ResumeFilePreview";
import { useResumeExtraction } from "@/hooks/useResumeExtraction";
import { ExtractedResumeData } from "@/types/resume";

const EnhancedResumeUpload = () => {
  const { profile, uploadResume, applyExtractedData } = useProfile();
  const { currentExtraction, createExtraction, isLoading: extractionLoading } = useResumeExtraction();
  const { toast } = useToast();
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [processingStage, setProcessingStage] = useState<'uploading' | 'extracting' | 'analyzing' | 'complete'>('uploading');

  // Check for existing extraction on component mount
  useEffect(() => {
    if (currentExtraction && !showConfirmation) {
      setExtractedData(currentExtraction.extracted_data);
      setShowConfirmation(true);
    }
  }, [currentExtraction, showConfirmation]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    setCurrentFile(file);
    processResume(file);
  }, [toast]);

  const processResume = async (file: File) => {
    if (!profile?.userId) return;
    
    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStage('uploading');

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Stage 1: Upload and extract
      setProcessingStage('extracting');
      const result = await uploadResume(file);
      
      clearInterval(uploadInterval);
      setUploadProgress(95);
      
      if (result?.success && result?.extracted_data) {
        setProcessingStage('analyzing');
        
        // Create extraction record in database
        const extraction = await createExtraction(result.extraction_id || 'temp', result.extracted_data);
        
        if (extraction) {
          setExtractedData(result.extracted_data);
          setProcessingStage('complete');
          setUploadProgress(100);
          
          toast({
            title: "Resume Analysis Complete! 🎉",
            description: "AI has extracted your profile data. Review the results below.",
          });
          
          // Auto-show confirmation after a brief delay
          setTimeout(() => {
            setShowConfirmation(true);
          }, 1000);
        }
      } else {
        throw new Error(result?.message || 'Failed to process resume');
      }
      
    } catch (error: any) {
      console.error("Resume processing error:", error);
      setUploadProgress(0);
      setProcessingStage('uploading');
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleDelete = async () => {
    // TODO: Implement resume deletion from Supabase storage
    toast({
      title: "Feature Coming Soon",
      description: "Resume deletion will be available in the next update.",
    });
  };

  const handleConfirmExtraction = async () => {
    if (!extractedData) return;
    
    try {
      // Apply the extracted data to the user's profile
      const success = await applyExtractedData(extractedData);
      
      if (success) {
        setShowConfirmation(false);
        setExtractedData(null);
        setCurrentFile(null);
        setUploadProgress(0);
        
        toast({
          title: "Profile Updated! ✨",
          description: "Your profile has been enhanced with AI-extracted data.",
        });
      }
    } catch (error) {
      console.error('Error applying extracted data:', error);
    }
  };

  const handleCancelExtraction = async () => {
    if (currentExtraction) {
      // Note: The rejection is handled in the confirmation component
      setShowConfirmation(false);
      setExtractedData(null);
      setCurrentFile(null);
      setUploadProgress(0);
    }
  };

  // Show confirmation dialog if data is extracted
  if (showConfirmation && extractedData && currentExtraction) {
    return (
      <AgenticResumeConfirmation
        extractedData={extractedData}
        extractionId={currentExtraction.id}
        confidence={currentExtraction.confidence_score}
        onConfirm={handleConfirmExtraction}
        onCancel={handleCancelExtraction}
        isLoading={extractionLoading}
      />
    );
  }

  const currentResume = profile?.resumeData;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">AI-Powered Resume Analysis</CardTitle>
          <CardDescription className="text-base">
            Upload your resume and let our AI extract and organize your professional information automatically
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Processing State */}
          {isProcessing && (
            <div className="space-y-4 p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-lg font-medium">
                  {processingStage === 'uploading' && 'Uploading resume...'}
                  {processingStage === 'extracting' && 'Extracting data with AI...'}
                  {processingStage === 'analyzing' && 'Analyzing and structuring...'}
                  {processingStage === 'complete' && 'Processing complete!'}
                </span>
              </div>
              
              <Progress value={uploadProgress} className="h-3" />
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {uploadProgress < 30 && "Securely uploading your resume..."}
                  {uploadProgress >= 30 && uploadProgress < 70 && "AI is reading and understanding your resume..."}
                  {uploadProgress >= 70 && uploadProgress < 95 && "Extracting skills, experience, and education..."}
                  {uploadProgress >= 95 && "Finalizing your profile data..."}
                </p>
                
                {uploadProgress > 50 && (
                  <div className="flex items-center justify-center gap-2 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>AI is analyzing your professional background</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!isProcessing && !currentResume && !currentFile && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? "border-primary bg-primary/10 scale-105" 
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isDragActive ? "Drop your resume here" : "Upload your resume"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your resume here, or click to browse
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">PDF</Badge>
                  <Badge variant="outline" className="text-xs">DOC</Badge>
                  <Badge variant="outline" className="text-xs">DOCX</Badge>
                  <Badge variant="outline" className="text-xs">Up to 10MB</Badge>
                </div>
                
                <Button size="lg" className="px-8">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          )}

          {/* File Preview */}
          {currentFile && !isProcessing && (
            <div className="p-6 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{currentFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentFile(null);
                    setUploadProgress(0);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

          {/* Current Resume Display with Preview */}
      {currentResume && !isProcessing && (
        <div className="space-y-4">
          <ResumeFilePreview
            filePath={`user-uploads/${currentResume.filename}`}
            fileName={currentResume.filename}
            fileSize={0}
            uploadDate={currentResume.uploadDate}
            onDelete={handleDelete}
          />
          
          {/* Upload New Resume */}
          <Card>
            <CardContent className="pt-6">
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <Button variant="outline" className="w-full" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <div className="mx-auto mb-3 p-2 bg-blue-100 rounded-full w-fit">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-1">AI-Powered Extraction</h3>
          <p className="text-sm text-muted-foreground">
            Advanced AI understands your resume structure and extracts relevant information
          </p>
        </Card>
        
        <Card className="text-center p-4">
          <div className="mx-auto mb-3 p-2 bg-green-100 rounded-full w-fit">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium mb-1">Smart Auto-Fill</h3>
          <p className="text-sm text-muted-foreground">
            Automatically populate your profile sections with extracted data
          </p>
        </Card>
        
        <Card className="text-center p-4">
          <div className="mx-auto mb-3 p-2 bg-purple-100 rounded-full w-fit">
            <Eye className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-1">Review & Confirm</h3>
          <p className="text-sm text-muted-foreground">
            Review all extracted data before applying it to your profile
          </p>
        </Card>
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Optimization Tips
          </CardTitle>
          <CardDescription>
            Follow these guidelines for the best AI extraction results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Use a standard resume format with clear sections
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Include specific skills, technologies, and tools
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                List measurable achievements and results
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Use consistent date formats (MM/YYYY)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Include contact information at the top
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Keep file size under 10MB for faster processing
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedResumeUpload;