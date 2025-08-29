import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ChevronRight, Building2, BookOpen, Search, Star, Filter } from "lucide-react";
import Container from "@/components/ui/Container";
import { dsaTopics } from "@/data/dsaProblems";
import { companies } from "@/data/companyProblems";
import DSAFilters from "@/components/dsa/DSAFilters";
import { useDSAFilters } from "@/hooks/useDSAFilters";
import { dsaService } from "@/api/services/dsaService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DSASheet = () => {
  const [activeTab, setActiveTab] = useState("topics");
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  
  const {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    filteredTopics,
    filteredCompanies,
    availableCompanies,
    getFilteredProblemsForCompany,
    stats
  } = useDSAFilters({ topics: dsaTopics, companies });

  // Load user preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) return;

      try {
        // Load saved filters
        const savedFilters = await dsaService.getFilters(user.id);
        if (savedFilters) {
          setFilters(savedFilters);
        }

        // Load favorites
        const userFavorites = await dsaService.getFavorites(user.id);
        setFavorites(userFavorites);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [user?.id, setFilters]);

  // Save filters when they change
  useEffect(() => {
    const saveFilters = async () => {
      if (!user?.id) return;

      try {
        await dsaService.saveFilters(user.id, filters);
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveFilters, 1000);
    return () => clearTimeout(timeoutId);
  }, [filters, user?.id]);

  const handleToggleFavorite = async (itemId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to add favorites");
      return;
    }

    try {
      if (favorites.includes(itemId)) {
        await dsaService.removeFromFavorites(user.id, itemId);
        setFavorites(prev => prev.filter(id => id !== itemId));
        toast.success("Removed from favorites");
      } else {
        await dsaService.addToFavorites(user.id, itemId);
        setFavorites(prev => [...prev, itemId]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Error updating favorites");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Container className="py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Ultimate DSA Sheet
            </h1>
            <p className="text-xl text-muted-foreground">
              Problem Solving: Everything from Basics to Advanced
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search topics or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          {/* Filters */}
          <DSAFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableCompanies={availableCompanies}
            showCompanyFilters={activeTab === "companies"}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="topics" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Topics
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Companies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topics" className="mt-8">
              {/* Topics Grid */}
              {filteredTopics.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No topics found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTopics.map((topic, index) => (
                    <div key={topic.id} className="relative group">
                      <Link to={`/dsa-sheet/topic/${topic.id}`}>
                        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-3xl">{topic.icon}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {String(index + 1).padStart(2, '0')}
                                </Badge>
                                <Badge 
                                  variant={
                                    topic.difficulty === 'Easy' ? 'default' : 
                                    topic.difficulty === 'Medium' ? 'secondary' : 
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {topic.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {topic.category}
                                </Badge>
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                              {topic.title}
                            </h3>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {topic.solvedProblems}/{topic.totalProblems} solved
                                </span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </div>
                              
                              <Progress 
                                value={(topic.solvedProblems / topic.totalProblems) * 100} 
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFavorite(topic.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/10 transition-colors z-10"
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            favorites.includes(topic.id) 
                              ? 'fill-primary text-primary' 
                              : 'text-muted-foreground hover:text-primary'
                          }`} 
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="companies" className="mt-8">
              {/* Companies Grid */}
              {filteredCompanies.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((company, index) => {
                    const filteredProblems = getFilteredProblemsForCompany(company);
                    const solvedFilteredProblems = filteredProblems.filter(p => p.completed).length;
                    
                    return (
                      <div key={company.id} className="relative group">
                        <Link to={`/dsa-sheet/company/${company.id}`}>
                          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="text-3xl">{company.icon}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {String(index + 1).padStart(2, '0')}
                                  </Badge>
                                  {company.title === "Adobe" && (
                                    <Badge variant="default" className="text-xs">
                                      Enhanced
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                                {company.title}
                              </h3>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {solvedFilteredProblems}/{filteredProblems.length} problems
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                
                                <Progress 
                                  value={filteredProblems.length > 0 ? (solvedFilteredProblems / filteredProblems.length) * 100 : 0} 
                                  className="h-2"
                                />

                                {/* Difficulty breakdown */}
                                {filters.difficulty.length === 0 && (
                                  <div className="flex gap-1 text-xs">
                                    {['Easy', 'Medium', 'Hard'].map(diff => {
                                      const count = company.problems.filter(p => p.difficulty === diff).length;
                                      if (count === 0) return null;
                                      return (
                                        <Badge 
                                          key={diff}
                                          variant={diff === 'Easy' ? 'default' : diff === 'Medium' ? 'secondary' : 'destructive'}
                                          className="text-xs"
                                        >
                                          {count} {diff}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFavorite(company.id);
                          }}
                          className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/10 transition-colors z-10"
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              favorites.includes(company.id) 
                                ? 'fill-primary text-primary' 
                                : 'text-muted-foreground hover:text-primary'
                            }`} 
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Stats Section */}
          <div className="mt-16 text-center">
            <Card className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                {activeTab === "topics" ? (
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {stats.topics.totalProblems}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Problems</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div>
                      <div className="text-3xl font-bold text-secondary">
                        {stats.topics.solvedProblems}
                      </div>
                      <div className="text-sm text-muted-foreground">Solved</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div>
                      <div className="text-3xl font-bold text-accent">
                        {stats.topics.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Topics</div>
                    </div>
                    {(filters.difficulty.length > 0 || filters.category.length > 0) && (
                      <>
                        <div className="w-px h-12 bg-border"></div>
                        <div>
                          <div className="text-lg font-bold text-muted-foreground">
                            Filtered
                          </div>
                          <div className="text-xs text-muted-foreground">Results</div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {stats.companies.totalProblems}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Problems</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div>
                      <div className="text-3xl font-bold text-secondary">
                        {stats.companies.solvedProblems}
                      </div>
                      <div className="text-sm text-muted-foreground">Solved</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div>
                      <div className="text-3xl font-bold text-accent">
                        {stats.companies.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Companies</div>
                    </div>
                    {(filters.difficulty.length > 0 || filters.companies.length > 0) && (
                      <>
                        <div className="w-px h-12 bg-border"></div>
                        <div>
                          <div className="text-lg font-bold text-muted-foreground">
                            Filtered
                          </div>
                          <div className="text-xs text-muted-foreground">Results</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DSASheet;