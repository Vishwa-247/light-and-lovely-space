
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Book, Video, Medal, MessageSquare, AlertCircle, Code, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import Chatbot from "@/components/Chatbot";
import { useToast } from "@/hooks/use-toast";
import { dsaTopics } from "@/data/dsaProblems";
import { companies } from "@/data/companyProblems";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showChatbot, setShowChatbot] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Real courses and interviews data - empty by default, will be populated from backend
  const displayCourses: any[] = [];
  const displayInterviews: any[] = [];

  const recentCourses = displayCourses.slice(0, 3);
  const recentInterviews = displayInterviews.slice(0, 3);

  // DSA Analytics calculations
  const totalDSAProblems = dsaTopics.reduce((total, topic) => total + topic.totalProblems, 0);
  const solvedDSAProblems = dsaTopics.reduce((total, topic) => total + topic.solvedProblems, 0);
  const totalCompanyProblems = companies.reduce((total, company) => total + company.totalProblems, 0);
  const solvedCompanyProblems = companies.reduce((total, company) => total + company.solvedProblems, 0);
  const totalAllDSAProblems = totalDSAProblems + totalCompanyProblems;
  const totalSolvedDSAProblems = solvedDSAProblems + solvedCompanyProblems;
  const dsaProgressPercentage = totalAllDSAProblems > 0 ? Math.round((totalSolvedDSAProblems / totalAllDSAProblems) * 100) : 0;

  // Recent DSA activity (solved problems from topics and companies)
  const recentDSAActivity = [
    ...dsaTopics.slice(0, 2).map(topic => ({
      type: 'topic',
      name: topic.title,
      progress: topic.totalProblems > 0 ? Math.round((topic.solvedProblems / topic.totalProblems) * 100) : 0,
      solved: topic.solvedProblems,
      total: topic.totalProblems,
      id: topic.id
    })),
    ...companies.slice(0, 1).map(company => ({
      type: 'company',
      name: company.title,
      progress: company.totalProblems > 0 ? Math.round((company.solvedProblems / company.totalProblems) * 100) : 0,
      solved: company.solvedProblems,
      total: company.totalProblems,
      id: company.id
    }))
  ];

  const WelcomeCard = () => (
    <Card className="col-span-full p-6 text-center">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Welcome to StudyMate, {user?.user_metadata?.full_name || 'Student'}!</CardTitle>
        <CardDescription className="text-base">
          Your personalized learning and interview practice platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-w-md mx-auto">
          <p className="mb-4">Get started by creating your first learning course or practice interview</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/course-generator">
                Create Course <Book className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mock-interview">
                Start Interview <Video className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Fix: Replace the line with error by checking if both displayCourses and displayInterviews are empty
  const showWelcomeCard = displayCourses.length === 0 && displayInterviews.length === 0;

  return (
    <Container>
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">StudyMate Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your learning progress and interview performance
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/course-generator">Create Course</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mock-interview">AI Interview Coach</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowChatbot(!showChatbot)}
              className="flex items-center gap-1"
            >
              <MessageSquare size={16} />
              <span>Help</span>
            </Button>
          </div>
        </div>

        {showChatbot && (
          <div className="mb-8">
            <Chatbot />
          </div>
        )}

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="dsa">DSA Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{displayCourses.length}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    AI Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Video className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{displayInterviews.length}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profile Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Medal className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">-</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    DSA Problems
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Code className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{totalSolvedDSAProblems}/{totalAllDSAProblems}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Weekly Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">-</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentCourses.length > 0 ? (
                    <div className="space-y-6">
                      {recentCourses.map((course) => (
                        <div key={course.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-sm text-muted-foreground">0%</span>
                          </div>
                          <Progress value={0} />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/dashboard?tab=courses" onClick={() => setActiveTab("courses")}>
                          View All Courses
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No courses yet. Create your first course!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Interviews</CardTitle>
                  <CardDescription>Your latest practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentInterviews.length > 0 ? (
                    <div className="space-y-6">
                      {recentInterviews.map((interview) => (
                        <div key={interview.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{interview.job_role}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(interview.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-muted-foreground">
                              Pending
                            </span>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/interview-result/${interview.id}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/dashboard?tab=interviews" onClick={() => setActiveTab("interviews")}>
                          View All AI Interviews
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No interviews yet. Start your first mock interview!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>DSA Progress</CardTitle>
                  <CardDescription>Your coding practice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentDSAActivity.length > 0 ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Overall Progress</span>
                          <span className="text-sm text-muted-foreground">{dsaProgressPercentage}%</span>
                        </div>
                        <Progress value={dsaProgressPercentage} />
                      </div>
                      {recentDSAActivity.map((activity, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{activity.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {activity.solved}/{activity.total}
                            </span>
                          </div>
                          <Progress value={activity.progress} />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/dashboard?tab=dsa" onClick={() => setActiveTab("dsa")}>
                          View DSA Progress
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No DSA problems solved yet. Start practicing!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {showWelcomeCard && <WelcomeCard />}
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>
                      {course.purpose.replace('_', ' ')} • {course.difficulty}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} />
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 w-full" asChild>
                      <Link to={`/course/${course.id}`}>
                        Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Generate New Course</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create a custom course based on your learning goals
                </p>
                <Button asChild>
                  <Link to="/course-generator">
                    Start Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayInterviews.map((interview) => (
                <Card key={interview.id}>
                  <CardHeader>
                    <CardTitle>{interview.job_role}</CardTitle>
                    <CardDescription>
                      Tech Stack: {interview.tech_stack}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        interview.completed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {interview.completed ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Overall Score</span>
                      <span className={`text-lg font-bold ${
                        Math.random() >= 0.8 ? "text-green-500" : 
                        Math.random() >= 0.5 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {Math.floor(Math.random() * 40 + 60)}%
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to={`/interview-result/${interview.id}`}>
                        View Results <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Interview Agents</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Choose from HR, Technical, or Aptitude interview coaches
                </p>
                <div className="space-y-2 w-full">
                  <Button asChild size="sm" className="w-full">
                    <Link to="/mock-interview?type=technical">
                      Technical Interview
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to="/mock-interview?type=hr">
                      HR Interview
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to="/mock-interview?type=aptitude">
                      Aptitude Test
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dsa">
            <div className="space-y-6">
              {/* DSA Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Problems
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Target className="mr-2 h-4 w-4 text-primary" />
                      <div className="text-2xl font-bold">{totalAllDSAProblems}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Solved Problems
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <div className="text-2xl font-bold">{totalSolvedDSAProblems}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Progress Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Medal className="mr-2 h-4 w-4 text-primary" />
                      <div className="text-2xl font-bold">{dsaProgressPercentage}%</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Topics Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Book className="mr-2 h-4 w-4 text-primary" />
                      <div className="text-2xl font-bold">{dsaTopics.length}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* DSA Topics Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>DSA Topics Progress</CardTitle>
                    <CardDescription>Track your progress by data structures and algorithms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dsaTopics.slice(0, 5).map((topic) => (
                        <div key={topic.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{topic.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {topic.solvedProblems}/{topic.totalProblems}
                            </span>
                          </div>
                          <Progress 
                            value={topic.totalProblems > 0 ? (topic.solvedProblems / topic.totalProblems) * 100 : 0} 
                          />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/dsa-sheet">
                          View All Topics <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Problems</CardTitle>
                    <CardDescription>Practice problems from top tech companies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companies.slice(0, 5).map((company) => (
                        <div key={company.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{company.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {company.solvedProblems}/{company.totalProblems}
                            </span>
                          </div>
                          <Progress 
                            value={company.totalProblems > 0 ? (company.solvedProblems / company.totalProblems) * 100 : 0} 
                          />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to="/company-problems">
                          View All Companies <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-dashed border-2">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Start practicing DSA problems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild>
                      <Link to="/dsa-sheet">
                        <Code className="mr-2 h-4 w-4" />
                        Practice by Topics
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/company-problems">
                        <Target className="mr-2 h-4 w-4" />
                        Company Problems
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/dsa-sheet?random=true">
                        <Medal className="mr-2 h-4 w-4" />
                        Random Problem
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default Dashboard;
