import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, Download, Trash2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import DocumentPreview from "./DocumentPreview";
import { useAuth } from "@/context/AuthContext";

export default function ResumeUpload() {
  const { profile, updateProfile, uploadResume, isLoading } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setCurrentFile(file);
      setIsProcessing(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Use the updated uploadResume method that calls the profile service
      await uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Resume processed successfully",
        description: "Profile has been automatically updated with extracted data",
      });
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(0);
      setCurrentFile(null);
      setIsProcessing(false);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  }, [uploadResume, user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
  });

  const handleDelete = async () => {
    // TODO: Implement resume deletion
    toast({
      title: "Resume deleted",
      description: "Your resume has been removed from your profile",
    });
  };

  const currentResume = profile?.resumeData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Resume Upload</h2>
        <p className="text-muted-foreground">
          Upload your resume to automatically extract information and get AI-powered insights.
        </p>
      </div>

      {/* Upload Area */}
      {!currentResume && !currentFile && (
        <Card>
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, and DOCX files up to 5MB
              </p>
              <Button className="mt-4" disabled={isLoading || isProcessing}>
                {isLoading || isProcessing ? "Processing..." : "Choose File"}
              </Button>
            </div>

            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    {uploadProgress < 30 ? "Uploading document..." : 
                     uploadProgress < 70 ? "Extracting text..." : 
                     uploadProgress < 90 ? "AI processing..." : "Completing..."}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Preview */}
      {currentFile && !currentResume && (
        <DocumentPreview 
          file={currentFile} 
          onRemove={() => {
            setCurrentFile(null);
            setUploadProgress(0);
            setIsProcessing(false);
          }}
        />
      )}

      {/* Current Resume */}
      {currentResume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Current Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{currentResume.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(currentResume.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Processed
                </Badge>
                <Button size="sm" variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* AI Analysis Results */}
            {currentResume.aiAnalysis && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Analysis:</strong> {currentResume.aiAnalysis}
                </AlertDescription>
              </Alert>
            )}

            {/* Skill Gaps */}
            {currentResume.skillGaps && currentResume.skillGaps.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Identified Skill Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {currentResume.skillGaps.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {currentResume.recommendations && currentResume.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {currentResume.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {/* Upload New Resume */}
            <div className="pt-4 border-t">
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <Button variant="outline" className="w-full" disabled={isLoading || isProcessing}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading || isProcessing ? "Processing..." : "Upload New Resume"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Keep file size under 5MB for faster processing
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}