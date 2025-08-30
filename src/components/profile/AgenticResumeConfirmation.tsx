import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, User, Briefcase, GraduationCap, Code, Award, FolderOpen, Sparkles, Eye, EyeOff } from "lucide-react";
import { ExtractedResumeData } from "@/types/resume";
import { useResumeExtraction } from "@/hooks/useResumeExtraction";

interface AgenticResumeConfirmationProps {
  extractedData: ExtractedResumeData;
  extractionId: string;
  confidence: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AgenticResumeConfirmation: React.FC<AgenticResumeConfirmationProps> = ({
  extractedData,
  extractionId,
  confidence,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { applyExtraction } = useResumeExtraction();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleConfirm = async () => {
    const success = await applyExtraction(extractionId);
    if (success) {
      onConfirm();
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 0.6) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const renderSectionPreview = (
    title: string,
    icon: React.ReactNode,
    data: any[],
    sectionKey: string,
    renderItem: (item: any, index: number) => React.ReactNode
  ) => {
    if (!data || data.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];
    const previewCount = 2;
    const hasMore = data.length > previewCount;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {data.length} item{data.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(sectionKey)}
              className="text-xs"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  View All {data.length}
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {(isExpanded ? data : data.slice(0, previewCount)).map((item, index) => 
            renderItem(item, index)
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Profile Auto-Fill</CardTitle>
              <CardDescription>
                Review the extracted data from your resume before applying it to your profile
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={getConfidenceColor(confidence)}
          >
            {Math.round(confidence * 100)}% Confidence
          </Badge>
        </div>

        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Data Replacement Notice</p>
            <p>Applying this data will replace your current profile information in the selected sections. This action cannot be undone.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Personal Information */}
        {extractedData.personalInfo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {extractedData.personalInfo.fullName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{extractedData.personalInfo.fullName}</span>
                </div>
              )}
              {extractedData.personalInfo.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{extractedData.personalInfo.email}</span>
                </div>
              )}
              {extractedData.personalInfo.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{extractedData.personalInfo.phone}</span>
                </div>
              )}
              {extractedData.personalInfo.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{extractedData.personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Experience */}
        {renderSectionPreview(
          "Work Experience",
          <Briefcase className="h-4 w-4 text-green-600" />,
          extractedData.experience || [],
          "experience",
          (exp, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-md border text-sm">
              <div className="font-medium">{exp.position} at {exp.company}</div>
              <div className="text-muted-foreground text-xs">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate} • {exp.location}
              </div>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {exp.technologies.slice(0, 3).map((tech: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {exp.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{exp.technologies.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {/* Education */}
        {renderSectionPreview(
          "Education",
          <GraduationCap className="h-4 w-4 text-purple-600" />,
          extractedData.education || [],
          "education",
          (edu, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-md border text-sm">
              <div className="font-medium">{edu.degree} in {edu.field}</div>
              <div className="text-muted-foreground text-xs">
                {edu.institution} • {edu.startYear} - {edu.endYear}
              </div>
              {edu.grade && (
                <div className="text-xs mt-1">Grade: {edu.grade}</div>
              )}
            </div>
          )
        )}

        {/* Skills */}
        {extractedData.skills && extractedData.skills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Skills</h3>
              <Badge variant="secondary" className="text-xs">
                {extractedData.skills.length} skills
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedData.skills.slice(0, 12).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill.name} • {skill.level}
                </Badge>
              ))}
              {extractedData.skills.length > 12 && (
                <Badge variant="secondary" className="text-xs">
                  +{extractedData.skills.length - 12} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {renderSectionPreview(
          "Projects",
          <FolderOpen className="h-4 w-4 text-orange-600" />,
          extractedData.projects || [],
          "projects",
          (project, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-md border text-sm">
              <div className="font-medium">{project.title}</div>
              <div className="text-muted-foreground text-xs line-clamp-2 mt-1">
                {project.description}
              </div>
              {project.technologies && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {project.technologies.slice(0, 3).map((tech: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* Certifications */}
        {renderSectionPreview(
          "Certifications",
          <Award className="h-4 w-4 text-yellow-600" />,
          extractedData.certifications || [],
          "certifications",
          (cert, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-md border text-sm">
              <div className="font-medium">{cert.name}</div>
              <div className="text-muted-foreground text-xs">
                {cert.issuer} • {cert.issueDate}
              </div>
            </div>
          )
        )}

        <Separator />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Data to Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgenticResumeConfirmation;