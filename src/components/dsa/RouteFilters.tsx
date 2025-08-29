import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X, Heart, Star } from "lucide-react";

interface RouteFiltersProps {
  filters: {
    difficulty: string[];
  };
  onFiltersChange: (filters: any) => void;
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
  showFavoritesOnly: boolean;
  onShowFavoritesChange: (show: boolean) => void;
}

const RouteFilters = ({ 
  filters, 
  onFiltersChange, 
  favorites,
  onToggleFavorite,
  showFavoritesOnly,
  onShowFavoritesChange
}: RouteFiltersProps) => {
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const newDifficulties = checked 
      ? [...filters.difficulty, difficulty]
      : filters.difficulty.filter(d => d !== difficulty);
    
    onFiltersChange({ ...filters, difficulty: newDifficulties });
  };

  const clearAllFilters = () => {
    onFiltersChange({ difficulty: [] });
    onShowFavoritesChange(false);
  };

  const hasActiveFilters = filters.difficulty.length > 0 || showFavoritesOnly;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Hard': return 'text-red-600 dark:text-red-400';
      default: return '';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 sticky top-4 z-10">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {filters.difficulty.length + (showFavoritesOnly ? 1 : 0)}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Favorites Toggle */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorites"
              checked={showFavoritesOnly}
              onCheckedChange={onShowFavoritesChange}
            />
            <label
              htmlFor="favorites"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              Show Favorites Only
            </label>
            {favorites.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {favorites.length}
              </Badge>
            )}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground text-sm">Difficulty Level</h4>
          <div className="grid grid-cols-3 gap-2">
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
                  className={`text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${getDifficultyColor(difficulty)}`}
                >
                  {difficulty}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {showFavoritesOnly && (
                <Badge variant="default" className="gap-1 text-xs">
                  <Star className="w-3 h-3" />
                  Favorites
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-300" 
                    onClick={() => onShowFavoritesChange(false)}
                  />
                </Badge>
              )}
              {filters.difficulty.map((difficulty) => (
                <Badge key={difficulty} variant="secondary" className="gap-1 text-xs">
                  {difficulty}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-300" 
                    onClick={() => handleDifficultyChange(difficulty, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RouteFilters;