import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Bot, CheckCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import ResumeFilePreview from "./ResumeFilePreview";
import { ExtractedResumeData } from "@/types/resume";

const SimpleResumeUpload = () => {
  const { profile, uploadResume, applyExtractedData, deleteResume } = useProfile();
  const { toast } = useToast();
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStage, setAiStage] = useState<string>('');

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

    try {
      // AI Agent processing stages
      const stages = [
        "🔍 Scanning your resume...",
        "🧠 AI is reading your content...",
        "📊 Extracting work experience...",
        "🎓 Analyzing education history...",
        "⚡ Identifying skills and technologies...",
        "🏆 Processing certifications...",
        "✨ Structuring your profile data..."
      ];

      let currentStageIndex = 0;
      setAiStage(stages[currentStageIndex]);

      // Progressive AI thinking simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 15;
          if (newProgress <= 90) {
            if (newProgress > currentStageIndex * 13) {
              currentStageIndex++;
              if (currentStageIndex < stages.length) {
                setAiStage(stages[currentStageIndex]);
              }
            }
            return newProgress;
          }
          clearInterval(progressInterval);
          return 90;
        });
      }, 400);

      // Process the resume
      const result = await uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setAiStage("🎉 Analysis complete!");
      
      if (result?.success && result?.extracted_data) {
        // Show AI agent toast for confirmation
        setTimeout(() => {
          toast({
            title: "🤖 AI Agent Ready!",
            description: "I've analyzed your resume and extracted your profile data.",
            duration: 3000,
          });
          
          // Follow up with decision toast
          setTimeout(() => {
            const shouldFill = window.confirm(
              "🤖 AI Agent: I've extracted your profile data from the resume. Should I auto-fill your profile now?\n\nClick OK to fill your profile, or Cancel to skip."
            );
            
            if (shouldFill) {
              handleAutoFill(result.extracted_data);
            } else {
              setCurrentFile(null);
              setUploadProgress(0);
              setIsProcessing(false);
              toast({
                title: "No problem!",
                description: "Your resume is saved. You can fill your profile manually or upload again later.",
              });
            }
          }, 1000);
        }, 1000);
      } else {
        throw new Error(result?.message || 'Failed to process resume');
      }
      
    } catch (error: any) {
      console.error("Resume processing error:", error);
      setUploadProgress(0);
      setIsProcessing(false);
      toast({
        title: "AI Processing Failed",
        description: error.message || "I couldn't analyze your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutoFill = async (extractedData: ExtractedResumeData) => {
    toast({
      title: "🤖 AI Agent Working...",
      description: "I'm now filling your profile with the extracted data.",
    });

    try {
      const success = await applyExtractedData(extractedData);
      
      if (success) {
        setCurrentFile(null);
        setUploadProgress(0);
        setIsProcessing(false);
        
        toast({
          title: "✨ Profile Updated!",
          description: "I've successfully filled your profile with AI-extracted data. Check out your sections!",
        });
      }
    } catch (error) {
      console.error('Error applying extracted data:', error);
      toast({
        title: "Update Failed",
        description: "I couldn't update your profile. Please try again.",
        variant: "destructive",
      });
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
    try {
      const success = await deleteResume();
      if (success) {
        toast({
          title: "Resume Deleted",
          description: "Your resume has been successfully deleted.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentResume = profile?.resumeData;

  return (
    <div className="space-y-6">
      {/* AI Processing State */}
      {isProcessing && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="pt-6">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <Bot className="h-8 w-8 text-primary animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary">AI Agent Processing</h3>
                  <p className="text-sm text-muted-foreground">{aiStage}</p>
                </div>
              </div>
              
              <Progress value={uploadProgress} className="h-3" />
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  AI is analyzing your professional background...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {!isProcessing && !currentResume && !currentFile && (
        <Card>
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? "border-primary bg-primary/10 scale-[1.02]" 
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isDragActive ? "Drop your resume here" : "Upload Resume for AI Analysis"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    AI will automatically extract and fill your profile
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
                  Choose Resume
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview */}
      {currentFile && !isProcessing && (
        <Card>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}

      {/* Current Resume Display */}
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
    </div>
  );
};

export default SimpleResumeUpload;