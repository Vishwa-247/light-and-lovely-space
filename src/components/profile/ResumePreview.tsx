import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Maximize2, Minimize2 } from "lucide-react";

interface ResumePreviewProps {
  file: File;
  showAnalysis?: boolean;
  fullView?: boolean;
}

export default function ResumePreview({ file, showAnalysis = false }: ResumePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (file) {
      setIsProcessing(true);
      
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Enhanced text extraction simulation
      setTimeout(() => {
        if (file.type === 'application/pdf') {
          setExtractedText(`
JOHN DOE
Senior Software Engineer
📧 john.doe@example.com | 📱 (555) 123-4567
🔗 linkedin.com/in/johndoe | 💻 github.com/johndoe
📍 San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 5+ years in full-stack development,
specializing in React, Node.js, and cloud architecture. Proven track record
of leading teams and delivering scalable solutions that serve millions of users.

TECHNICAL SKILLS
Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Next.js, Vue.js
Backend: Node.js, Python, Express.js, FastAPI, Django
Databases: MongoDB, PostgreSQL, MySQL, Redis
Cloud: AWS, Google Cloud, Docker, Kubernetes, Jenkins
Tools: Git, Linux, Agile/Scrum, Figma

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Architected and developed 10+ scalable web applications using React and Node.js
• Improved application performance by 40% through code optimization and caching strategies
• Led a cross-functional team of 5 developers on multiple high-impact projects
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 3 junior developers, helping them advance their careers

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications using modern JavaScript frameworks
• Collaborated with cross-functional teams to deliver features ahead of schedule
• Implemented automated testing reducing bugs by 30% and improving code quality
• Participated in code reviews and established best practices for the team

Junior Developer | DevStudio | 2018 - 2019
• Developed frontend components using React and integrated with REST APIs
• Assisted in database design and implementation using MongoDB
• Participated in agile development processes and daily standups

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014 - 2018
GPA: 3.8/4.0
Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems

PROJECTS

E-Commerce Platform (2023)
• Built full-stack e-commerce solution with React, Node.js, and MongoDB
• Integrated payment processing (Stripe), inventory management, and user authentication
• Deployed on AWS with auto-scaling, achieving 99.9% uptime
• Technologies: React, Node.js, MongoDB, AWS, Docker

Task Management App (2022)
• Developed React Native mobile application with real-time synchronization
• Implemented WebSocket connections for real-time updates
• Published on App Store and Google Play with 4.8/5 rating
• Technologies: React Native, Firebase, WebSockets

CERTIFICATIONS
• AWS Certified Solutions Architect (2023)
• Google Cloud Professional Developer (2022)
• MongoDB Certified Developer (2021)

ACHIEVEMENTS
• Employee of the Quarter - Q3 2023
• Led migration project that saved company $100K annually
• Speaker at ReactConf 2023 - "Optimizing React Performance"
          `);
        } else {
          setExtractedText(`
SARAH JOHNSON
Product Manager
sarah.johnson@email.com | (555) 987-6543
linkedin.com/in/sarahjohnson

SUMMARY
Results-driven Product Manager with 4+ years of experience leading cross-functional teams
to deliver innovative products that drive business growth and user satisfaction.

EXPERIENCE
Senior Product Manager | InnovaTech | 2022 - Present
• Led product strategy for mobile app with 2M+ active users
• Increased user engagement by 35% through data-driven feature development
• Managed product roadmap and coordinated with engineering and design teams

EDUCATION
MBA in Business Administration | Stanford University | 2020
BS in Computer Science | UC Berkeley | 2018

SKILLS
Product Strategy, Agile Development, Data Analysis, User Research,
A/B Testing, Wireframing, Jira, Confluence, SQL
          `);
        }
        setIsProcessing(false);
      }, 1500);

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = file.name;
    link.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resume Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {file.type === 'application/pdf' ? 'PDF' : 'DOCX'}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 ${isExpanded ? 'min-h-[600px]' : 'min-h-[300px]'}`}>
          {/* File Info */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
              </p>
            </div>
            {isProcessing && (
              <div className="ml-auto flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-muted-foreground">Processing...</span>
              </div>
            )}
          </div>

          {/* Enhanced Preview Content */}
          <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
            <div className="bg-gray-50 dark:bg-gray-800 border-b p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Document Preview</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {file.type === 'application/pdf' ? 'PDF' : 'DOCX'}
                  </Badge>
                  {!isProcessing && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Processed
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {isProcessing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Extracting content...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Document thumbnail/icon */}
                  <div className="flex items-center justify-center py-4 bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.type === 'application/pdf' ? 'PDF Document' : 'Word Document'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Content preview */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h5 className="font-semibold mb-3 text-sm">Extracted Content Preview:</h5>
                    <div className="max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
                        {extractedText.substring(0, 500)}...
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Analysis Highlights */}
          {showAnalysis && !isProcessing && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">AI Analysis Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-lg font-bold text-green-600">8</div>
                  <div className="text-xs text-muted-foreground">Sections Found</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-lg font-bold text-blue-600">15</div>
                  <div className="text-xs text-muted-foreground">Skills Detected</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-lg font-bold text-purple-600">1,240</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-lg font-bold text-orange-600">2</div>
                  <div className="text-xs text-muted-foreground">Pages</div>
                </div>
              </div>
              
              {/* Key Insights */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">Key Insights</h5>
                <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <li>• Strong technical background with modern frameworks</li>
                  <li>• Leadership experience with team management</li>
                  <li>• Quantifiable achievements and impact metrics</li>
                  <li>• Well-structured professional progression</li>
                </ul>
              </div>
            </div>
          )}

          {isExpanded && !isProcessing && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-3">Complete Document Content</h4>
              <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
                  {extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}