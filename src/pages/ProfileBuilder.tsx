import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import ProfileSection from "@/components/profile/ProfileSection";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Award, 
  FolderOpen,
  FileText,
  CheckCircle,
  Eye 
} from "lucide-react";
import Container from "@/components/ui/Container";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import EducationForm from "@/components/profile/EducationForm";
import ExperienceForm from "@/components/profile/ExperienceForm";
import ProjectsForm from "@/components/profile/ProjectsForm";
import SkillsForm from "@/components/profile/SkillsForm";
import CertificationsForm from "@/components/profile/CertificationsForm";
import ResumeUpload from "@/components/profile/ResumeUpload";
import ProfilePreview from "@/components/profile/ProfilePreview";
import { useProfile } from "@/hooks/useProfile";
import { UserProfile } from "@/types/profile";

const sections = [
  { id: 'resume', name: 'Resume Upload', icon: FileText, component: ResumeUpload, description: 'Upload your resume to auto-fill profile data' },
  { id: 'personal', name: 'Personal Info', icon: User, component: PersonalInfoForm, description: 'Basic contact information and professional links' },
  { id: 'education', name: 'Education', icon: GraduationCap, component: EducationForm, description: 'Your academic background and qualifications' },
  { id: 'experience', name: 'Experience', icon: Briefcase, component: ExperienceForm, description: 'Professional work experience and internships' },
  { id: 'projects', name: 'Projects', icon: FolderOpen, component: ProjectsForm, description: 'Personal and professional projects showcase' },
  { id: 'skills', name: 'Skills', icon: Code, component: SkillsForm, description: 'Technical and soft skills with proficiency levels' },
  { id: 'certifications', name: 'Certifications', icon: Award, component: CertificationsForm, description: 'Professional certifications and achievements' },
  { id: 'preview', name: 'Preview', icon: Eye, component: ProfilePreview, description: 'Preview your complete profile' },
];

export default function ProfileBuilder() {
  const { user } = useAuth();
  const { profile, updateProfile, isLoading } = useProfile();
  const [activeSection, setActiveSection] = useState("resume");

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  const getCompletionStatus = (sectionId: string) => {
    if (!profile) return false;
    
    switch (sectionId) {
      case 'resume':
        return !!profile.resumeData;
      case 'personal':
        return !!(profile.personalInfo.fullName && profile.personalInfo.email && profile.personalInfo.phone);
      case 'education':
        return profile.education.length > 0;
      case 'experience':
        return profile.experience.length > 0;
      case 'projects':
        return profile.projects.length > 0;
      case 'skills':
        return profile.skills.length > 0;
      case 'certifications':
        return profile.certifications.length > 0;
      default:
        return false;
    }
  };

  const getSectionCompletionPercentage = (sectionId: string) => {
    if (!profile) return 0;
    
    switch (sectionId) {
      case 'resume':
        return profile.resumeData ? 100 : 0;
      case 'personal':
        const personalFields = ['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio'];
        const filledPersonal = personalFields.filter(field => 
          profile.personalInfo[field as keyof typeof profile.personalInfo]
        ).length;
        return Math.round((filledPersonal / personalFields.length) * 100);
      case 'education':
        return profile.education.length > 0 ? 100 : 0;
      case 'experience':
        return profile.experience.length > 0 ? 100 : 0;
      case 'projects':
        return profile.projects.length > 0 ? 100 : 0;
      case 'skills':
        return profile.skills.length > 0 ? 100 : 0;
      case 'certifications':
        return profile.certifications.length > 0 ? 100 : 0;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Profile Builder</h1>
              <p className="text-muted-foreground">
                Build your professional profile to get personalized recommendations
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              {profile?.completionPercentage || 0}% Complete
            </Badge>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Profile Completion</span>
                    <span>{profile?.completionPercentage || 0}%</span>
                  </div>
                  <Progress value={profile?.completionPercentage || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <div className="relative w-28 h-28">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-muted relative">
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-primary transition-all duration-500"
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + (profile?.completionPercentage || 0) * 0.5}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {profile?.completionPercentage || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-lg mb-2">Profile Completion</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete all sections to maximize your profile visibility
                  </p>
                </div>

                <div className="space-y-2">
                  {sections.map((section) => {
                    const isCompleted = getCompletionStatus(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-muted hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded ${activeSection === section.id ? 'bg-primary-foreground/20' : ''}`}>
                            <section.icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{section.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {profile && (
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last updated</span>
                      <span>{new Date(profile.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {profile.resumeData && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-success" />
                        <span className="text-sm text-success">Resume uploaded</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProfileSection
              title={currentSection.name}
              description={currentSection.description}
              isCompleted={getCompletionStatus(activeSection)}
              completionPercentage={getSectionCompletionPercentage(activeSection)}
              icon={currentSection.icon && <currentSection.icon className="h-5 w-5" />}
            >
              <currentSection.component />
            </ProfileSection>
          </div>
        </div>
      </div>
    </Container>
  );
}
