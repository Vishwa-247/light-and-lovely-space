import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";

interface DSAFiltersProps {
  filters: {
    difficulty: string[];
    category: string[];
    companies: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableCompanies: string[];
  showCompanyFilters?: boolean;
}

const DSAFilters = ({ 
  filters, 
  onFiltersChange, 
  availableCompanies, 
  showCompanyFilters = false 
}: DSAFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const categories = ['inside', 'outside'];

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const newDifficulties = checked 
      ? [...filters.difficulty, difficulty]
      : filters.difficulty.filter(d => d !== difficulty);
    
    onFiltersChange({ ...filters, difficulty: newDifficulties });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.category, category]
      : filters.category.filter(c => c !== category);
    
    onFiltersChange({ ...filters, category: newCategories });
  };

  const handleCompanyChange = (company: string, checked: boolean) => {
    const newCompanies = checked 
      ? [...filters.companies, company]
      : filters.companies.filter(c => c !== company);
    
    onFiltersChange({ ...filters, companies: newCompanies });
  };

  const clearAllFilters = () => {
    onFiltersChange({ difficulty: [], category: [], companies: [] });
  };

  const hasActiveFilters = filters.difficulty.length > 0 || 
                          filters.category.length > 0 || 
                          filters.companies.length > 0;

  return (
    <Card className="mb-6 bg-card/50 backdrop-blur-sm border-primary/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-6 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filters.difficulty.length + filters.category.length + filters.companies.length}
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Difficulty Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Difficulty</h4>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <div key={difficulty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${difficulty}`}
                      checked={filters.difficulty.includes(difficulty)}
                      onCheckedChange={(checked) => 
                        handleDifficultyChange(difficulty, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`difficulty-${difficulty}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {difficulty}
                    </label>
                    <Badge 
                      variant={
                        difficulty === 'Easy' ? 'default' : 
                        difficulty === 'Medium' ? 'secondary' : 
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Category</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.category.includes(category)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {category}
                    </label>
                    <Badge variant="outline" className="text-xs capitalize">
                      {category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Filter */}
            {showCompanyFilters && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Companies</h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableCompanies.map((company) => (
                    <div key={company} className="flex items-center space-x-2">
                      <Checkbox
                        id={`company-${company}`}
                        checked={filters.companies.includes(company)}
                        onCheckedChange={(checked) => 
                          handleCompanyChange(company, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`company-${company}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {company}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Filters & Clear */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {filters.difficulty.map((difficulty) => (
                    <Badge key={difficulty} variant="secondary" className="gap-1">
                      {difficulty}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleDifficultyChange(difficulty, false)}
                      />
                    </Badge>
                  ))}
                  {filters.category.map((category) => (
                    <Badge key={category} variant="outline" className="gap-1">
                      {category}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleCategoryChange(category, false)}
                      />
                    </Badge>
                  ))}
                  {filters.companies.map((company) => (
                    <Badge key={company} variant="default" className="gap-1">
                      {company}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleCompanyChange(company, false)}
                      />
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DSAFilters;