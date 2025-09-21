import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";

const Courses = () => {
  // Sample courses with mind map capabilities
  const courses = [
    {
      id: "1",
      title: "Advanced React Patterns and Performance Optimization",
      description: "Master advanced React patterns, state management, and performance optimization techniques with interactive mind maps and coding playgrounds.",
      difficulty: "Advanced",
      duration: "8 hours",
      chapters: 6,
      features: ["Interactive Mind Maps", "Code Playground", "NotebookLM-style Learning"]
    },
    {
      id: "2", 
      title: "Full-Stack JavaScript Development",
      description: "Complete full-stack development course covering Node.js, Express, React, and MongoDB with visual learning aids.",
      difficulty: "Intermediate",
      duration: "12 hours",
      chapters: 10,
      features: ["Visual Learning", "Real Projects", "Code Examples"]
    },
    {
      id: "3",
      title: "Data Structures and Algorithms",
      description: "Comprehensive DSA course with interactive visualizations, mind maps, and coding challenges.",
      difficulty: "Intermediate",
      duration: "15 hours", 
      chapters: 8,
      features: ["Algorithm Visualization", "Practice Problems", "Mind Map Concepts"]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediate": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Advanced": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Container className="py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Interactive Learning Courses
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of learning with mind maps, interactive code playgrounds, and NotebookLM-style educational content.
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.chapters} chapters
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Key Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {course.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link to={`/course/${course.id}`} className="block">
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Start Learning
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="py-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Want a Custom Course?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Generate personalized courses with AI-powered content, mind maps, and interactive learning experiences tailored to your needs.
                </p>
                <Link to="/course-generator">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Generate Custom Course
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Courses;